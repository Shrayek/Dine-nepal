"use client"

import { InputContainer } from "@/components/input-container"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { type FormEvent, useCallback, useState } from "react"

export function AddRestaurantDialog() {
	const router = useRouter()
	const [open, setOpen] = useState(false)

	const createRestaurant = api.restaurant.create.useMutation()
	const utils = api.useUtils()

	const [isLoading, setIsLoading] = useState(false)

	const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setIsLoading(true)
		const formData = new FormData(e.currentTarget)
		const name = formData.get("name") as string
		const location = formData.get("location") as string
		const image = formData.get("image") as File | undefined
		const restaurant = await createRestaurant.mutateAsync({
			name, location,
			// @ts-expect-error xxx
			image: image && {
				name: `${image.name}${image.lastModified}`,
				mediaType: image.type,
				base64Content: "",
			},
		})
		await fetch(restaurant.image!.uploadUrl!, { method: 'PUT', body: image });

		setIsLoading(false)
		setOpen(false)
		await utils.restaurant.all.invalidate()
		router.refresh()
	}, [createRestaurant, router, utils.restaurant.all])
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Add restaurant</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Add new restaurant</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="flex flex-col items-start gap-4">
							<InputContainer required name="name" placeholder="restaurant name" display="Name" />
							<InputContainer required name="location" placeholder="restaurant location" display="Location" />
							<InputContainer name="image" display="Image" accept="image/png, image/jpeg" type="file" />
						</div>
						<DialogFooter>
							<Button className={clsx({ "animate-bounce repeat-infinite": isLoading })} disabled={isLoading} type="submit">
								Add
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
