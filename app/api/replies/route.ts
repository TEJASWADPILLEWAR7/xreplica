import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, subscriptions, jobs } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const maxDuration = 60; // Allow long-polling

export async function POST(req: Request) {
  try {
    const extensionKey = req.headers.get("x-extension-key");
    if (!extensionKey)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Auth Check
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

    // 3. Subscription Check
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .limit(1);
    let hasActiveSub = false;
    if (sub.length > 0) {
      const s = sub[0];
      const isActive =
        s.status === "active" && s.nextBillingDate && s.nextBillingDate > now;
      const isTrial = s.status === "trialing" && s.trialEnd && s.trialEnd > now;
      if (isActive || isTrial) hasActiveSub = true;
    }
    if (!hasActiveSub)
      return NextResponse.json({ error: "Plan Expired" }, { status: 402 });

    const body = await req.json();
    const { tweetText, imageUrl } = body;

    // --- ASYNC QUEUE LOGIC START ---

    // 4. Enqueue Job
    const [newJob] = await db
      .insert(jobs)
      .values({
        userId: user.id,
        tweetText: tweetText,
        imageUrl: imageUrl,
        status: "pending",
      })
      .returning();

    console.log(`[API] Job ${newJob.id} Enqueued. Waiting for worker...`);

    // 5. Long-Polling (Wait loop)
    const startTime = Date.now();
    let finalJob = null;

    // Wait up to 50 seconds for the worker to finish
    while (Date.now() - startTime < 50000) {
      await new Promise((r) => setTimeout(r, 1000)); // Sleep 1s

      const check = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, newJob.id))
        .limit(1);
      if (check[0].status === "completed") {
        finalJob = check[0];
        break;
      }
      if (check[0].status === "failed") {
        return NextResponse.json(
          { error: "Generation Failed" },
          { status: 500 }
        );
      }
    }

    if (!finalJob) {
      return NextResponse.json(
        { error: "Server busy. Please try again." },
        { status: 504 }
      );
    }

    // --- ASYNC QUEUE LOGIC END ---

    // 6. Update Stats
    const lastDate = user.lastReplyAt
      ? new Date(user.lastReplyAt).toDateString()
      : "";
    const todayDate = new Date().toDateString();
    const newDailyCount =
      lastDate === todayDate ? (user.repliesToday || 0) + 1 : 1;

    await db
      .update(users)
      .set({
        lastReplyAt: new Date(),
        totalReplies: sql`${users.totalReplies} + 1`,
        repliesToday: newDailyCount,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ reply: finalJob.reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
