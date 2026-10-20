import { currentUser } from "@clerk/nextjs/server";
import { BookingCard } from "./_components/booking-card";
import { notFound } from "next/navigation";

export default async function Page() {
	const user = await currentUser()
	if(user?.publicMetadata?.role !== "admin") return notFound()

  return <BookingCard />
}
