"use client"

import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RatingBar } from "@/components/ui/rating-bar";
import { api } from "@/trpc/react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddReviewDialog({ restaurantId }: { restaurantId: string }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const ratingMutation = api.review.add.useMutation({
		onSuccess() {
			setOpen(false)
			router.refresh()
		}
	})

	return <Dialog open={open} onOpenChange={setOpen}>
		<DialogTrigger asChild>
			<Button variant="outline">
				Add review
				<UserCheck className="ml-3" />
			</Button>
		</DialogTrigger>
		<DialogContent>
			<form onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()

				const formData = new FormData(e.currentTarget)
				const ratingStr = formData.get("rating") as string | undefined

				if (!ratingStr) return toast.error("rating is required", { position: "top-center" })

				const review = formData.get("review") as string
				const stars = parseInt(ratingStr)

				ratingMutation.mutate({ restaurant: restaurantId, review, stars })
			}}>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="rating" className="text-right">
							Rating
						</Label>
						<RatingBar name="rating" />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="review" className="text-right">
							Review
						</Label>
						<Textarea className="col-span-3" id="review" name="review" required />
					</div>
				</div>
				<DialogFooter>
					<Button disabled={ratingMutation.isPending} className={clsx(
						ratingMutation.isPending && "animate-bounce",
					)} type="submit">Add</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
}
