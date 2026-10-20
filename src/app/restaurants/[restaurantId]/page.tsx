import { api } from "@/trpc/server";
import { Seats } from "./_components/seats";
import { AddReviewDialog } from "./_components/add-review-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RatingBar } from "@/components/ui/rating-bar";

export default async function Page({ params: { restaurantId } }: { params: { restaurantId: string } }) {
	const seats = await api.restaurant.seats(restaurantId)

	const reviews = await api.review.forRestaurant(restaurantId)
	const restaurant = await api.restaurant.detail(restaurantId)

	return <div className="flex flex-col space-y-8">
		<div className="flex flex-col space-y-1 items-center mt-2">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				{restaurant.name}
			</h1>
			<p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
				{restaurant.location}
			</p>
		</div>
		<Seats seats={seats} restaurant={restaurant} />
		<div className="px-6">
			<div className="flex flex-row justify-between">
				<h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
					Reviews
				</h2>
				<AddReviewDialog restaurantId={restaurantId} />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-4 md:p-6">
				{
					reviews.map(({ review, id, user, stars }) => {
						return <Card key={id}>
							<CardHeader className="flex flex-row">
								<Avatar className="mr-3">
									<AvatarImage src={user?.image ?? ""} />
									<AvatarFallback>
										{user?.name?.substring(0)}
									</AvatarFallback>
								</Avatar>
								<h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
									{user?.name}
								</h3>
							</CardHeader>
							<CardContent>
								<RatingBar readonly value={stars ?? undefined} />
								<p className="leading-7">
									{review}
								</p>
							</CardContent>
						</Card>
					})
				}
			</div>
		</div>
	</div>;
}
