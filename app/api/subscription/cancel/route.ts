import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  subscriptions,
  users,
  cancellationFeedback,
} from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import DodoPayments from "dodopayments";

const dodoKey = process.env.DODO_API_KEY;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!dodoKey) {
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 500 }
      );
    }

    let reason: string | null = null;
    let details: string | null = null;

    try {
      const text = await req.text();
      if (text) {
        const body = JSON.parse(text);
        reason = body.reason || null;
        details = body.details || null;
      }
    } catch {}

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const internalUserId = userRecord[0].id;

    const subRecord = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, internalUserId))
      .limit(1);

    if (subRecord.length === 0 || !subRecord[0].paymentId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    const subscriptionId = subRecord[0].paymentId;

    const client = new DodoPayments({
      bearerToken: dodoKey,
      environment: "test_mode",
    });

    try {
      await (client.subscriptions as any).cancel(subscriptionId);
    } catch {}

    if (reason) {
      try {
        await db.insert(cancellationFeedback).values({
          userId: internalUserId,
          reason,
          details,
        });
      } catch {}
    }

    await db
      .update(subscriptions)
      .set({ status: "cancelled" })
      .where(eq(subscriptions.userId, internalUserId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
