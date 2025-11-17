import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const createNewRoom = mutation({
	args: {
		topic: v.string(),
		coachingOption: v.string(),
		expertName: v.string(),
		uid: v.id("users"),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.insert('DiscussionRoom', {
			topic: args.topic,
			coachingOption: args.coachingOption,
			expertName: args.expertName,
			uid: args.uid,
		});
		return result;
	}
});



export const getDiscussionRoom = query({
	args: {
		id: v.id("DiscussionRoom"),
	},
	handler: async (ctx, args) => {
		const result = await ctx.db.get(args.id);
		return result;
	},
});


export const updateConversation = mutation({
	args: {
		id: v.id("DiscussionRoom"),
		conversation: v.any()
	},

	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			conversation: args.conversation
		})
	}
})


export const updateFeedback = mutation({
	args: {
		id: v.id("DiscussionRoom"),
		feedback: v.any(),
	},

	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			feedback: args.feedback,
		});
	},
});


export const getAllDiscussionRoom = query({
	args: {
		uid: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		if (!args.uid) return [];
		const result = await ctx.db.query("DiscussionRoom")
		.filter(query => query.eq(query.field("uid"), args.uid)).collect();
		
		return result;
	},
});