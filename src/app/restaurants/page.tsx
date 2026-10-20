import { RestaurantList } from "@/components/restaurant-list";
import { api } from "@/trpc/server";
import { AddRestaurantDialog } from "./_components/add-restaurant-dialog";
import { currentUser } from "@clerk/nextjs/server";
import { Input } from "@/components/ui/input";

export default async function Page({ searchParams: { q } }: { searchParams: { q?: string } }) {
  const user = await currentUser()
  const restaurants = await api.restaurant.all({ q })

  return <div className="flex flex-col space-y-3 items-end px-4 pt-8">
    <div className="flex flex-row justify-between items-center w-full">
      <form>
        <Input placeholder="Search restaurant..." defaultValue={q} name="q" />
      </form>
      {user?.publicMetadata.role === "admin" && <AddRestaurantDialog />}
    </div>
    <div className="w-full">
      <RestaurantList restaurants={restaurants} />
    </div>
  </div>
}
