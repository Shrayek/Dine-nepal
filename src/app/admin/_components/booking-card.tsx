import { api } from "@/trpc/server";

import { format } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { redirect } from "next/navigation";
import React from "react";
import moment from "moment";

export async function BookingCard() {
  const bookings = await api.booking.all()

  return <Card className="xl:col-span-2">
    <CardHeader className="flex flex-row items-center">
      <div className="grid gap-2">
        <CardTitle>Upcoming Bookings</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead className="text-left">Time</TableHead>
            <TableHead className="text-left">Booked By</TableHead>
            <TableHead className="text-left">Contact Email</TableHead>
            <TableHead className="text-left">Seats</TableHead>
            <TableHead className="text-left">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            bookings.map(({ id, restaurant, time, interval, remarks, user, seats }) => {
              return <TableRow key={id}>
                <TableCell>
                  <div className="font-medium">{restaurant?.name}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{format(time!, "E MMM h:mm a")} - {format(moment(time).add(interval, "m").toDate(), "h:mm a")}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user?.name}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user?.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{seats.map(s => s.seat?.label).join()}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{remarks}</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <CancelBookingButton id={id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            })
          }
        </TableBody>
      </Table>
    </CardContent>
  </Card>
}

export function CancelBookingButton({ id }: { id: string }) {
  return <form action={async () => {
    "use server"

    await api.booking.delete(id)
    redirect("/admin")
  }}>
    <button type="submit">Cancel</button>
  </form>
}

type PropsWithId = { id: string }

// export function OptionsDropdown({ subject }: { subject: Subject }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="h-8 w-8 p-0">
//           <span className="sr-only">Open menu</span>
//           <DotsHorizontalIcon className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//         <DeleteButton id={subject.id} />
//         <DropdownMenuSeparator />
//         <AddUpdateButton subject={subject} />
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

// export function DeleteButton({ id }: PropsWithId) {
//   return <form action={async () => {
//     "use server"
//
//     await api.subject.delete(id)
//
//     revalidatePath("/admin/subjects")
//     redirect("/admin/subjects")
//   }}>
//     <DropdownMenuItem>
//       <button type="submit">Delete</button>
//     </DropdownMenuItem>
//   </form>
// }

// export function AddUpdateButton({ subject }: { subject?: Partial<Subject> }) {
//   const text = subject?.id ? "Update" : "Add"
//
//   async function upsert(formData: FormData) {
//     "use server"
//
//     const name = formData.get("name") as string
//     const description = formData.get("description") as string
//
//     await api.subject.createOrUpdate({ name, description, id: subject?.id ?? undefined })
//
//     redirect("/admin/subjects")
//   }
//
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <div className="ml-auto gap-1">
//           {
//             !subject?.id &&
//             <Button asChild size="sm">
//               <div>
//                 {text}
//                 <BookIcon className="h-4 w-4" />
//               </div>
//             </Button>
//           }
//           {
//             !!subject?.id &&
//             <button className="text-sm">
//               {text}
//             </button>
//           }
//         </div>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <form action={upsert}>
//           <DialogHeader>
//             <DialogTitle>Add subject</DialogTitle>
//             <DialogDescription>
//               Fill in subject details here. Click {text} when you&apos;re done.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="name" className="text-right">
//                 Name
//               </Label>
//               <Input defaultValue={subject?.name ?? undefined} required id="name" name="name" placeholder="subject name" className="col-span-3" />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="description" className="text-right">
//                 Description
//               </Label>
//               <Textarea required id="description" defaultValue={subject?.description ?? undefined} placeholder="about the subject" name="description" className="col-span-3" />
//             </div>
//           </div>
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button type="submit">{text} Subject</Button>
//             </DialogClose>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
