import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function checkSubscriptionStatus(email: string) {
  // 1. Get user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.length === 0) {
    return { allowed: false, reason: "User not found" };
  }

  const userId = user[0].id;

  // 2. Get subscription
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub || sub.length === 0) {
    return { allowed: false, reason: "No subscription found" };
  }

  const s = sub[0];
  const now = new Date();

  // 3. Check Trial
  if (s.status === "trialing" && s.trialEnd) {
    if (s.trialEnd > now) {
      return { allowed: true, plan: "Trial", expiresAt: s.trialEnd };
    } else {
      return { allowed: false, reason: "Trial expired" };
    }
  }

  // 4. Check Active Subscription (Strict 30-Day Window)
  if (s.status === "active") {
    // Access is only allowed if today is BEFORE the next billing date
    if (s.nextBillingDate && s.nextBillingDate > now) {
      return { allowed: true, plan: "Pro", expiresAt: s.nextBillingDate };
    } else {
      return { allowed: false, reason: "Plan expired (Payment required)" };
    }
  }

  return { allowed: false, reason: "Subscription inactive" };
}
