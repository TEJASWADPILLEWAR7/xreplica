import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { cooldown } = body;

    // Update based on Clerk ID
    await db
      .update(users)
      .set({ cooldownSeconds: parseInt(cooldown) })
      .where(eq(users.clerkId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
