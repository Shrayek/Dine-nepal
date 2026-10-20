import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { type ReviewRecord } from "@/xata";
import { type XataRecord, type EditableData, type Identifiable } from "@xata.io/client";
import { localDb } from "../../local-db";

export type Create<R extends XataRecord> = Omit<EditableData<R>, 'id'> & Partial<Identifiable>

export const reviewRouter = createTRPCRouter({
  forRestaurant: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const db = localDb.getStore();
      return db.reviews.filter((r) =>
        typeof r.restaurant === "string" ? r.restaurant === input : r.restaurant?.id === input
      );
    }),

  add: protectedProcedure
    .input(z.custom<Create<ReviewRecord> & Partial<Identifiable>>())
    .mutation(({ ctx, input }) => {
      const db = localDb.getStore();
      const newReview = {
        id: `rev-${Date.now()}`,
        restaurant: (input as any).restaurant,
        review: (input as any).review,
        stars: (input as any).stars,
        user: {
          id: ctx.user.id,
          name: ctx.user.firstName ? `${ctx.user.firstName} ${ctx.user.lastName ?? ""}`.trim() : (ctx.user.username ?? "Customer"),
          image: ctx.user.imageUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        },
      };

      db.reviews.unshift(newReview);
      localDb.saveStore(db);
      return newReview;
    }),
});
