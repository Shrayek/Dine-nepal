import Image from "next/image"
import Link from "next/link"
import { type Restaurant } from "@/xata"
import { currentUser } from "@clerk/nextjs/server"

export async function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 p-4 md:p-6">
      {
        restaurants.map(({ image, name, location, id }) => {
          return <div className="relative group overflow-hidden rounded-lg shadow-xl" key={id}>
            <Link className="absolute inset-0 z-10" href={`/restaurants/${id}`}>
              <span className="sr-only">View</span>
            </Link>
            <Image
              alt={name ?? ""}
              className="object-cover w-full h-60"
              height={300}
              src={image?.url ?? ""}
              style={{
                aspectRatio: "400/300",
                objectFit: "cover",
              }}
              width={400}
            />
            <div className="bg-white p-4 dark:bg-gray-950">
              <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
            </div>
          </div>
        })
      }
    </section>
  )
}
