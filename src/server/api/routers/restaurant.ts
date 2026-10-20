import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { type Restaurant } from "@/xata";
import { localDb } from "../../local-db";

export const restaurantRouter = createTRPCRouter({
  all: publicProcedure
    .input(z.object({ q: z.ostring() }).default({}))
    .query(async ({ input: { q } }) => {
      const db = localDb.getStore();
      let restaurants = [...db.restaurants];
      if (q) {
        const queryLower = q.toLowerCase();
        restaurants = restaurants.filter((r) =>
          r.name?.toLowerCase().includes(queryLower) ||
          r.location?.toLowerCase().includes(queryLower)
        );
      }
      return restaurants.reverse();
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(({ input }) => {
      const db = localDb.getStore();
      db.restaurants = db.restaurants.filter((r) => r.id !== input);
      db.seats = db.seats.filter((s) => (typeof s.restaurant === "string" ? s.restaurant !== input : s.restaurant?.id !== input));
      localDb.saveStore(db);
      return { id: input };
    }),

  update: protectedProcedure
    .input(z.custom<Restaurant>())
    .mutation(({ input }) => {
      const db = localDb.getStore();
      const index = db.restaurants.findIndex((r) => r.id === input.id);
      if (index !== -1) {
        db.restaurants[index] = { ...db.restaurants[index], ...input };
        localDb.saveStore(db);
        return db.restaurants[index];
      }
      return input;
    }),

  create: publicProcedure
    .input(z.custom<Restaurant>())
    .mutation(async ({ input }) => {
      const db = localDb.getStore();
      const newId = `rest-${Date.now()}`;
      const seatCount = input.seatCount || 16;
      const newRestaurant = {
        ...input,
        id: newId,
        seatCount,
        "xata.createdAt": new Date().toISOString(),
      };
      db.restaurants.push(newRestaurant);

      const gridSize = Math.floor(Math.sqrt(seatCount)) || 4;
      const seats = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          seats.push({
            id: `seat-${newId}-${row}-${col}`,
            restaurant: newId,
            row,
            column: col,
            label: `${row}${col}`,
            status: "available" as const,
          });
        }
      }
      db.seats.push(...seats);
      localDb.saveStore(db);
      return newRestaurant;
    }),

  detail: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const db = localDb.getStore();
      const restaurant = db.restaurants.find((r) => r.id === input);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      return {
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location,
        seatCount: restaurant.seatCount,
      };
    }),

  seats: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = localDb.getStore();
      const restaurant = db.restaurants.find((r) => r.id === input);
      if (!restaurant) return [];

      // Real-time seat status calculation:
      // A seat is only "booked" if there is an active booking where:
      // booking.time <= now < booking.time + (interval in minutes)
      const now = Date.now();
      const activeBookedSeatIds = new Set<string>();

      for (const booking of db.bookings) {
        if (!booking.time) continue;
        const bookingRestId = typeof booking.restaurant === "string" ? booking.restaurant : booking.restaurant?.id;
        if (bookingRestId !== input) continue;

        const startTime = new Date(booking.time).getTime();
        const durationMinutes = Number(booking.interval) || 60;
        const endTime = startTime + durationMinutes * 60 * 1000;

        // If current time falls within the booking window or booking is in the immediate upcoming slot
        if (now >= startTime && now < endTime) {
          const bSeats = db.bookingSeats.filter(bs => (typeof bs.booking === "string" ? bs.booking === booking.id : bs.booking?.id === booking.id));
          for (const bs of bSeats) {
            const sId = typeof bs.seat === "string" ? bs.seat : bs.seat?.id;
            if (sId) activeBookedSeatIds.add(sId);
            // Also check by label matching
            const sLabel = typeof bs.seat === "object" ? bs.seat?.label : null;
            if (sLabel) {
              const matched = db.seats.find(s => s.label === sLabel && (typeof s.restaurant === "string" ? s.restaurant === input : s.restaurant?.id === input));
              if (matched) activeBookedSeatIds.add(matched.id);
            }
          }
        }
      }

      let restaurantSeats = db.seats.filter((s) =>
        typeof s.restaurant === "string" ? s.restaurant === input : s.restaurant?.id === input
      );

      if (restaurantSeats.length === 0) {
        const count = restaurant.seatCount || 16;
        const gridSize = Math.floor(Math.sqrt(count)) || 4;
        restaurantSeats = [];
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            restaurantSeats.push({
              id: `seat-${input}-${row}-${col}`,
              restaurant: input,
              row,
              column: col,
              label: `${row}${col}`,
              status: "available" as const,
            });
          }
        }
        db.seats.push(...restaurantSeats);
      }

      // Sync active vs released status dynamically
      let changed = false;
      restaurantSeats = restaurantSeats.map(seat => {
        const shouldBeBooked = activeBookedSeatIds.has(seat.id);
        const newStatus = shouldBeBooked ? ("booked" as const) : ("available" as const);
        if (seat.status !== newStatus) {
          changed = true;
          seat.status = newStatus;
        }
        return seat;
      });

      if (changed) {
        localDb.saveStore(db);
      }

      return restaurantSeats;
    }),

  bookSeats: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        time: z.date(),
        interval: z.number().min(15, "Duration must be at least 15 minutes").max(180, "Duration cannot exceed 3 hours (180 mins)").default(60),
        seats: z.array(z.string()).min(1),
        remarks: z.ostring(),
      })
    )
    .mutation(async ({ ctx, input: { time, interval, restaurantId, seats, remarks } }) => {
      const db = localDb.getStore();
      const bookingId = `book-${Date.now()}`;
      const rest = db.restaurants.find((r) => r.id === restaurantId);

      db.bookings.push({
        id: bookingId,
        restaurant: { id: restaurantId, name: rest?.name ?? "Restaurant" },
        time: time.toISOString(),
        remarks: remarks ?? "",
        user: {
          id: ctx.user.id,
          name: ctx.user.firstName ? `${ctx.user.firstName} ${ctx.user.lastName ?? ""}`.trim() : (ctx.user.username ?? "Guest User"),
          email: ctx.user.emailAddresses?.[0]?.emailAddress ?? "guest@example.com",
        },
        interval,
      });

      for (const seatId of seats) {
        const seatObj = db.seats.find((s) => s.id === seatId);
        db.bookingSeats.push({
          id: `bs-${Date.now()}-${Math.random()}`,
          booking: bookingId,
          seat: { id: seatId, label: seatObj?.label ?? "Seat" },
        });

        if (seatObj) {
          seatObj.status = "booked";
        }
      }

      localDb.saveStore(db);
      return { success: true, bookingId };
    }),
});
