import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createNewRoom = mutation({
	args: {
		topic: v.string(),
		coachingOption: v.string(),
		expertName: v.string(),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.insert('DiscussionRoom', {
			topic: args.topic,
			coachingOption: args.coachingOption,
			expertName: args.expertName,
		});
		return result;
	}
});

import { query } from "./_generated/server";

export const getDiscussionRoom = query({
	args: {
		id: v.id("DiscussionRoom"),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.get(args.id);
		return result;
	},
});