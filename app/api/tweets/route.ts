import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { generateTweetReply } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const extensionKey = req.headers.get("x-extension-key");

    if (!extensionKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.extensionKey, extensionKey))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: "Invalid Key" }, { status: 403 });
    }

    const user = userRecord[0];
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

    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);

    let hasActiveSub = false;

    if (sub.length > 0) {
      const s = sub[0];
      const active =
        s.status === "active" && s.nextBillingDate && s.nextBillingDate > now;

      const trial = s.status === "trialing" && s.trialEnd && s.trialEnd > now;

      if (active || trial) hasActiveSub = true;
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

    const { reply } = await generateTweetReply(
      tweetText,
      user.toneProfile,
      imageUrl
    );

    const lastDate = user.lastReplyAt
      ? new Date(user.lastReplyAt).toDateString()
      : "";
    const todayDate = now.toDateString();

    let newDailyCount = user.repliesToday || 0;
    newDailyCount = lastDate === todayDate ? newDailyCount + 1 : 1;

    await db
      .update(users)
      .set({
        lastReplyAt: now,
        totalReplies: sql`${users.totalReplies} + 1`,
        repliesToday: newDailyCount,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
