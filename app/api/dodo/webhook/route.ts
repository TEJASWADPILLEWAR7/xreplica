import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

const webhookSecret = process.env.DODO_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const webhookId = req.headers.get("webhook-id");
    const webhookSignature = req.headers.get("webhook-signature");
    const webhookTimestamp = req.headers.get("webhook-timestamp");

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    const body = await req.text();

    const webhook = new Webhook(webhookSecret);
    try {
      await webhook.verify(body, {
        "webhook-id": webhookId,
        "webhook-signature": webhookSignature,
        "webhook-timestamp": webhookTimestamp,
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    if (type === "subscription.active" || type === "payment.succeeded") {
      const clerkUserId = data.metadata?.userId;

      if (clerkUserId) {
        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        if (userRecord.length > 0) {
          const internalUserId = userRecord[0].id;

          await db
            .delete(subscriptions)
            .where(eq(subscriptions.userId, internalUserId));

          await db.insert(subscriptions).values({
            userId: internalUserId,
            paymentId: data.subscription_id || "one_time",
            status: "active",
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
