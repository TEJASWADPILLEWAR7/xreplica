import { NextResponse } from "next/server";
import { checkSubscriptionStatus } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const status = await checkSubscriptionStatus(email);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
