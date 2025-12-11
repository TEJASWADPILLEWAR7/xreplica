import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { analyzeTone } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const userClerk = await currentUser();

    if (!userId || !userClerk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const toneProfile = await analyzeTone(body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    let internalUserId: string;

    if (existingUser.length === 0) {
      const newApiKey = "xr_" + uuidv4().replace(/-/g, "");

      const newUser = await db
        .insert(users)
        .values({
          clerkId: userId,
          email: userClerk.emailAddresses[0].emailAddress,
          extensionKey: newApiKey,
          toneProfile: toneProfile,
        })
        .returning();

      internalUserId = newUser[0].id;
    } else {
      await db
        .update(users)
        .set({ toneProfile })
        .where(eq(users.clerkId, userId));

      internalUserId = existingUser[0].id;
    }

    // Check for existing subscription
    const subRecord = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, internalUserId))
      .limit(1);

    let hasActiveSubscription = false;
    const now = new Date();

    if (subRecord.length === 0) {
      // Create a 3-day free trial automatically (No payment required)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3); // EXACTLY 3 DAYS

      await db.insert(subscriptions).values({
        userId: internalUserId,
        status: "trialing",
        trialEnd: trialEndDate,
        paymentId: "free_trial",
      });

      hasActiveSubscription = true;
    } else {
      const s = subRecord[0];
      const isActive =
        s.status === "active" && s.nextBillingDate && s.nextBillingDate > now;
      const isTrialing =
        s.status === "trialing" && s.trialEnd && s.trialEnd > now;

      if (isActive || isTrialing) {
        hasActiveSubscription = true;
      }
    }

    return NextResponse.json({
      success: true,
      toneProfile,
      hasActiveSubscription,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
