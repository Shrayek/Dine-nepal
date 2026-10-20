"use client"

import { Button } from "@/components/ui/button";
import { Loader, Trash } from "lucide-react"
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type AppRouter } from "@/server/api/root";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type inferProcedureOutput } from "@trpc/server";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "@/components/date-time-picker/date-time-picker";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { UpdateRestaurantDialog } from "./update-restaurant-dialog";
import { type Restaurant } from "@/xata";

type SeatsResponse = inferProcedureOutput<AppRouter["restaurant"]["seats"]>

const colorMap = {
	available: "bg-gray-600",
	booked: "bg-red-600",
	selected: "bg-yellow-600",
}

export function Seats({ seats: _seats, restaurant }: { seats: SeatsResponse, restaurant: Omit<Restaurant, "image"> }) {
	const { user } = useUser()
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [seats, setSeats] = useState(_seats)
	const utils = api.useUtils()
	const deleteMutation = api.restaurant.delete.useMutation({
		async onSuccess() {
			await utils.restaurant.all.invalidate()
			router.back()
			router.refresh()
		},
	})

	const selectedSeats = useMemo(() => seats.filter(s => s.status === "selected"), [seats])

	const { isPending, mutate } = api.restaurant.bookSeats.useMutation({
		async onSuccess() {
			setOpen(false)
			setSeats(s => s.map(s => selectedSeats.map(s => s.id).includes(s?.id) ? ({ ...s, status: s.status === "selected" ? "booked" : s.status }) : s))
			await utils.restaurant.seats.invalidate()
			router.refresh()
		},
	})

	return <div className="flex flex-col space-y-3 pt-8 relative">
		{selectedSeats.length > 0 && <Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="mx-4">Book Selected Seats</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={e => {
					e.preventDefault()
					e.stopPropagation()

					const formData = new FormData(e.currentTarget);

					const timeStr = formData.get("dateTime") as string | undefined

					if (!timeStr) return toast.error("Please select time", { position: "top-center" })

					const intervalStr = formData.get("interval") as string

					const remarks = formData.get("remarks") as string | undefined
					const interval = parseInt(intervalStr)
					const time = new Date(timeStr)

					mutate({ seats: selectedSeats.map(s => s.id), interval, remarks, restaurantId: restaurant.id, time })
				}}>
					<DialogHeader>
						<DialogTitle>Book Seats</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="dateTime" className="text-right">
								Date&Time
							</Label>
							<DateTimePicker id="dateTime" name="dateTime" />
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="interval" className="text-right">
								Duration
							</Label>
							<select
								id="interval"
								name="interval"
								required
								defaultValue="60"
								className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="30" className="bg-background text-foreground">30 minutes</option>
								<option value="45" className="bg-background text-foreground">45 minutes</option>
								<option value="60" className="bg-background text-foreground">1 hour (Recommended)</option>
								<option value="90" className="bg-background text-foreground">1.5 hours</option>
								<option value="120" className="bg-background text-foreground">2 hours</option>
								<option value="150" className="bg-background text-foreground">2.5 hours</option>
								<option value="180" className="bg-background text-foreground">3 hours (Maximum)</option>
							</select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="remarks" className="text-right">
								Remarks
							</Label>
							<Textarea id="remarks" name="remarks" className="col-span-3" />
						</div>
					</div>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-start gap-4">
						</div>
						<DialogFooter>
							<Button className={clsx({ "animate-bounce repeat-infinite": isPending })} disabled={isPending} type="submit">
								Book
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>}
		{
			user?.publicMetadata.role === "admin" &&
			<div className="flex flex-row space-x-4 justify-center">
				<form onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()

					deleteMutation.mutate(restaurant.id)
				}}>
					<UpdateRestaurantDialog restaurant={restaurant} />
					<Button size="sm" className="mx-4" disabled={deleteMutation.isPending} type="submit" variant="destructive">
						{deleteMutation.isPending && <Loader className="animate-spin" />}
						<Trash className="size-4" />
					</Button>
				</form>
			</div>
		}
		<div className="flex flex-row space-x-3 justify-center items-center">
			{Object.entries(colorMap).map(([status, className]) => <div key={status} className={cn("flex flex-row space-x-1 items-center justify-center")}>
				<div className={cn(className, "size-4")} />
				<h1>{status}</h1>
			</div>)}
		</div>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-4 md:p-6">
			{Array.from({ length: Math.ceil(seats.length / 4) }).map((_, i) => {
				const start = i * 4;
				const end = start + 4;
				const rowSeats = seats.slice(start, end);
				return (
					<center key={i}>
						<div className="shadow-xl shadow-gray-600 h-56 gap-4 grid grid-cols-2 place-items-center">
							{rowSeats.map(({ id, label, status }) => (
								<button disabled={status === "booked"} key={id} className={clsx("rounded-sm p-2", colorMap[status as keyof typeof colorMap])} onClick={() => {
									setSeats(s => s.map(s => s.id === id ? ({ ...s, status: s.status === "available" ? "selected" : "available" }) : s))
								}}>{label}</button>
							))}
						</div>
					</center>
				);
			})}
		</div>
	</div>
}
