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
import { type Restaurant } from "@/xata"
import clsx from "clsx"
import { Pen } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useCallback, useState } from "react"

export function UpdateRestaurantDialog({ restaurant: { id, name, location, seatCount } }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const updateRestaurant = api.restaurant.update.useMutation()
  const utils = api.useUtils()

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const location = formData.get("location") as string
    const seatCountStr = formData.get("seatCount") as string
		const seatCount = parseInt(seatCountStr)
    await updateRestaurant.mutateAsync({
      id, name, location, seatCount,
    })

    setIsLoading(false)
    setOpen(false)
    await utils.restaurant.all.invalidate()
    router.back()
    router.refresh()
  }, [updateRestaurant, id, utils.restaurant.all, router])
	
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pen className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Update restaurant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-4">
              <InputContainer defaultValue={name ?? undefined} required name="name" placeholder="restaurant name" display="Name" />
              <InputContainer defaultValue={location ?? undefined} required name="location" placeholder="restaurant location" display="Location" />
              <InputContainer defaultValue={seatCount ?? undefined} required name="seatCount" placeholder="no. of seats" display="Seat Count" />
            </div>
            <DialogFooter>
              <Button className={clsx({ "animate-bounce repeat-infinite": isLoading })} disabled={isLoading} type="submit">
                Update
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
