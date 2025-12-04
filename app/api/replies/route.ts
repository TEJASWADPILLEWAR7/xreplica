import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { generateTweetReply } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const extensionKey = req.headers.get("x-extension-key");
    if (!extensionKey)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Fetch User
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.extensionKey, extensionKey))
      .limit(1);
    if (userRecord.length === 0)
      return NextResponse.json({ error: "Invalid Key" }, { status: 403 });
    const user = userRecord[0];

    // 2. Cooldown Check
    const now = new Date();
    if (user.lastReplyAt) {
      const diffSeconds =
        (now.getTime() - new Date(user.lastReplyAt).getTime()) / 1000;
      if (diffSeconds < user.cooldownSeconds) {
        return NextResponse.json(
          {
            error: `Please wait ${Math.ceil(
              user.cooldownSeconds - diffSeconds
            )}s`,
          },
          { status: 429 }
        );
      }
    }

    // 3. Check Subscription (Strict 30-Day Cycle)
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);

    let hasActiveSub = false;

    if (sub.length > 0) {
      const s = sub[0];

      // RULE: Status must be active AND we must be before the next billing date
      const isActivePro =
        s.status === "active" && s.nextBillingDate && s.nextBillingDate > now;

      // RULE: Or valid trial
      const isTrialing =
        s.status === "trialing" && s.trialEnd && s.trialEnd > now;

      if (isActivePro || isTrialing) {
        hasActiveSub = true;
      }
    }

    if (!hasActiveSub) {
      return NextResponse.json(
        {
          error: "Plan Expired",
          reply: "Your plan has expired. Please renew to continue.",
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { tweetText, imageUrl } = body;

    // 4. Generate Reply
    const { reply } = await generateTweetReply(
      tweetText,
      user.toneProfile,
      imageUrl
    );

    // 5. SMART DAILY COUNTER LOGIC
    const lastDate = user.lastReplyAt
      ? new Date(user.lastReplyAt).toDateString()
      : "";
    const todayDate = now.toDateString();

    let newDailyCount = user.repliesToday || 0;

    if (lastDate !== todayDate) {
      // It's a new day! Reset counter to 1
      newDailyCount = 1;
    } else {
      // Same day, just increment
      newDailyCount += 1;
    }

    // 6. Update Database
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          lastReplyAt: now,
          totalReplies: sql`${users.totalReplies} + 1`,
          repliesToday: newDailyCount,
        })
        .where(eq(users.id, user.id));
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
