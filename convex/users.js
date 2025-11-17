import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    // If user already exists
    const userData = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    // If not then add new user
    if (userData?.length == 0) {
      const data = {
        name: args.name,
        email: args.email,
        credits: 50000,
        subscriptionId: Math.random().toString(36).substring(2, 15),
      }

      const insertedId = await ctx.db.insert("users", { 
        ...data
      });

      return { _id: insertedId, ...data };
    }

    return userData[0];
  },
});
