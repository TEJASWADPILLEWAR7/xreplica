import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  Zap,
  MessageSquare,
  Settings,
  LogOut,
  CheckCircle2,
  User,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/");
  }

  const email = user.emailAddresses?.[0]?.emailAddress || "";

  let dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (dbUser.length === 0) {
    const existingEmailUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const newKey = "xr_" + uuidv4().replace(/-/g, "");

    if (existingEmailUser.length > 0) {
      await db
        .update(users)
        .set({
          clerkId: userId,
          extensionKey: existingEmailUser[0].extensionKey || newKey,
        })
        .where(eq(users.id, existingEmailUser[0].id));

      dbUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);
    } else {
      const newUser = await db
        .insert(users)
        .values({
          clerkId: userId,
          email,
          extensionKey: newKey,
          toneProfile: "Professional, witty, casual.",
        })
        .returning();
      dbUser = newUser;
    }
  }

  if (!dbUser[0].extensionKey) {
    const newKey = "xr_" + uuidv4().replace(/-/g, "");
    await db
      .update(users)
      .set({ extensionKey: newKey })
      .where(eq(users.id, dbUser[0].id));

    dbUser[0].extensionKey = newKey;
  }

  const localUser = dbUser[0];
  const secretKey = localUser.extensionKey;

  const totalReplies = localUser.totalReplies || 0;
  const lastDate = localUser.lastReplyAt
    ? new Date(localUser.lastReplyAt).toDateString()
    : "";
  const todayDate = new Date().toDateString();
  const todayReplies = lastDate === todayDate ? localUser.repliesToday || 0 : 0;

  const subResult = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, localUser.id))
    .limit(1);

  let planName = "Free Trial (Not Started)";
  let planColorClass = "text-[#71767B]";
  const now = new Date();

  if (subResult.length > 0) {
    const sub = subResult[0];

    if (sub.status === "active") {
      if (sub.nextBillingDate && sub.nextBillingDate > now) {
        planName = "Pro Plan (Active)";
        planColorClass = "text-green-500";
      } else {
        planName = "Pro Plan Expired";
        planColorClass = "text-red-500";
      }
    } else if (
      sub.status === "trialing" &&
      sub.trialEnd &&
      sub.trialEnd > now
    ) {
      const daysLeft = Math.ceil(
        (sub.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      planName = `Free Trial (${daysLeft} Days Left)`;
      planColorClass = "text-[#1D9BF0]";
    } else if (sub.status === "cancelled") {
      planName = "Cancelled";
      planColorClass = "text-red-500";
    } else {
      planName = "Expired / Inactive";
      planColorClass = "text-red-500";
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-sans">
      <nav className="bg-black/80 backdrop-blur-md border-b border-[#2F3336] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-[#E7E9EA] text-lg">
            <span className="sr-only">XReplica</span>
            <span>XReplica Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span
              className="text-sm text-[#71767B] hidden md:inline truncate max-w-[220px]"
              title={email}
            >
              {email}
            </span>

            <Link
              href="/settings"
              aria-label="Settings"
              className="p-2 hover:bg-[#16181C] rounded-full text-[#71767B] hover:text-[#1D9BF0] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>

            <SignOutButton>
              <button
                className="p-2 hover:bg-[#16181C] rounded-full text-[#71767B] hover:text-red-500 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div
          id="x-replica-sync"
          data-key={secretKey}
          data-email={email}
          style={{ display: "none" }}
        />

        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <article className="bg-[#16181C] p-6 rounded-xl border border-[#2F3336] hover:border-[#1D9BF0] transition-colors group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black border border-[#2F3336] rounded-lg group-hover:border-[#1D9BF0] transition-colors">
                <Zap className="w-6 h-6 text-[#1D9BF0]" />
              </div>
              <div>
                <p className="text-sm text-[#71767B] font-medium">
                  Replies Today
                </p>
                <h3 className="text-2xl font-bold">{todayReplies}</h3>
              </div>
            </div>
          </article>

          <article className="bg-[#16181C] p-6 rounded-xl border border-[#2F3336] hover:border-[#a855f7] transition-colors group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black border border-[#2F3336] rounded-lg group-hover:border-[#a855f7] transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-[#71767B] font-medium">
                  Total Generated
                </p>
                <h3 className="text-2xl font-bold">{totalReplies}</h3>
              </div>
            </div>
          </article>

          <article className="bg-[#16181C] p-6 rounded-xl border border-[#2F3336] hover:border-[#22c55e] transition-colors group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black border border-[#2F3336] rounded-lg group-hover:border-[#22c55e] transition-colors">
                <User className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[#71767B] font-medium">
                  Current Plan
                </p>
                <h3 className={`text-lg font-bold ${planColorClass}`}>
                  {planName}
                </h3>
              </div>
            </div>
          </article>
        </section>

        <aside className="bg-[#16181C] border border-[#2F3336] rounded-xl p-6 mb-8 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1D9BF0]" />
          <div className="bg-[#1D9BF0]/10 p-3 rounded-full shrink-0">
            <Settings className="w-5 h-5 text-[#1D9BF0]" />
          </div>
          <div>
            <h3 className="font-bold">Extension Connected</h3>
            <p className="text-[#71767B] text-sm mt-1">
              Your account is synced. Open X.com to start generating replies.
            </p>
          </div>
        </aside>

        <section className="bg-[#16181C] border border-[#2F3336] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1D9BF0]" />
            How to use
          </h2>

          <ol className="relative border-l border-[#2F3336] ml-3 space-y-8">
            {[
              {
                title: "Go to X.com",
                desc: (
                  <>
                    Open{" "}
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1D9BF0] hover:underline"
                    >
                      X.com
                    </a>{" "}
                    in Chrome. Make sure you are logged in.
                  </>
                ),
              },
              {
                title: "Find a Tweet",
                desc: "Open any tweet you want to reply to.",
              },
              {
                title: "Generate",
                desc: (
                  <>
                    Click the{" "}
                    <span className="font-bold bg-[#2F3336] px-1 rounded text-xs">
                      AI Reply
                    </span>{" "}
                    button at the bottom of the tweet.
                  </>
                ),
              },
              {
                title: "Post",
                desc: 'Review the generated reply and click "Reply" to share.',
              },
            ].map((step, idx) => (
              <li key={idx} className="ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-[#16181C] rounded-full -left-3 ring-4 ring-black text-[#1D9BF0]">
                  <span className="w-2 h-2 bg-[#1D9BF0] rounded-full" />
                </span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-[#71767B] mt-1">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
