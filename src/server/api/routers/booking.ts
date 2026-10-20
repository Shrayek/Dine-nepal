import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { localDb } from "../../local-db";

export const bookingRouter = createTRPCRouter({
  all: protectedProcedure
    .query(async () => {
      const db = localDb.getStore();
      const now = new Date();

      const upcomingBookings = db.bookings.filter((b) => {
        if (!b.time) return false;
        return new Date(b.time) > now;
      });

      return upcomingBookings.map((booking) => {
        const seats = db.bookingSeats
          .filter((bs) => (typeof bs.booking === "string" ? bs.booking === booking.id : bs.booking?.id === booking.id))
          .map((bs) => ({
            seat: { label: typeof bs.seat === "object" ? bs.seat?.label : bs.seat },
          }));

        return {
          ...booking,
          time: new Date(booking.time!),
          seats,
        };
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .query(({ input }) => {
      const db = localDb.getStore();
      db.bookings = db.bookings.filter((b) => b.id !== input);
      db.bookingSeats = db.bookingSeats.filter((bs) => (typeof bs.booking === "string" ? bs.booking !== input : bs.booking?.id !== input));
      localDb.saveStore(db);
      return { id: input };
    }),
});
