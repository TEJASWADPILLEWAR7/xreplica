import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newKey = "xr_" + uuidv4().replace(/-/g, "");

    // Update key AND clear the device lock (boundInstallationId)
    // allowing the next device to claim ownership.
    await db
      .update(users)
      .set({
        extensionKey: newKey,
        boundInstallationId: null, // Reset lock
      })
      .where(eq(users.clerkId, userId));

    return NextResponse.json({ success: true, newKey });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to regenerate" },
      { status: 500 }
    );
  }
}
