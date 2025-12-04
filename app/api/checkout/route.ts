import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import DodoPayments from "dodopayments";

const dodoKey = process.env.DODO_API_KEY;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!dodoKey) {
      return NextResponse.json(
        { error: "Configuration Error" },
        { status: 500 }
      );
    }

    const client = new DodoPayments({
      bearerToken: dodoKey,
      environment: "test_mode",
    });

    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json(
        { error: "Product Not Configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/dashboard?payment=success`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim() || "User",
      },
      metadata: { userId: userId },
      return_url: returnUrl,
    });

    const checkoutUrl =
      session.payment_link || session.checkout_url || session.url;

    if (!checkoutUrl) {
      throw new Error("Unable to retrieve checkout URL");
    }

    return NextResponse.json({ url: checkoutUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment Initialization Failed" },
      { status: 500 }
    );
  }
}
