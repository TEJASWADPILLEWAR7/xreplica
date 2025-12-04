import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  toneProfile: text("tone_profile"),
  extensionKey: text("extension_key").unique(),
  boundInstallationId: text("bound_installation_id"),
  cooldownSeconds: integer("cooldown_seconds").default(45).notNull(),
  lastReplyAt: timestamp("last_reply_at"),
  totalReplies: integer("total_replies").default(0).notNull(),
  repliesToday: integer("replies_today").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTweets = pgTable("user_tweets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  tweetText: text("tweet_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  paymentId: text("payment_id"),
  status: text("status").notNull().default("trialing"),
  trialEnd: timestamp("trial_end"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cancellationFeedback = pgTable("cancellation_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
