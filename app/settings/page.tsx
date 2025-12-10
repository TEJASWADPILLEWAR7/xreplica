import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

import {
  CreditCard,
  Key,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Zap,
  User,
} from "lucide-react";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import CheckoutButton from "./CheckoutButton";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import CooldownSettings from "./CooldownSettings";
import RegenerateKeyButton from "./RegenerateKeyButton";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) redirect("/");

  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (dbUser.length === 0) redirect("/dashboard");

  const localUser = dbUser[0];

  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, localUser.id))
    .limit(1);

  let planStatus = "No Active Plan";
  let isPro = false;
  let isTrial = false;
  const now = new Date();

  if (sub.length > 0) {
    const s = sub[0];
    if (s.status === "active" && s.nextBillingDate && s.nextBillingDate > now) {
      isPro = true;
      planStatus = "Active Pro Plan";
    } else if (s.status === "trialing" && s.trialEnd && s.trialEnd > now) {
      isTrial = true;
      const daysLeft = Math.ceil(
        (s.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      planStatus = `Free Trial (${daysLeft} Days Left)`;
    } else {
      planStatus = "Plan Expired";
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-sans">
      <nav className="bg-black/80 backdrop-blur-md border-b border-[#2F3336] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[#71767B] hover:text-[#E7E9EA] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <SignOutButton>
            <button className="text-sm text-red-500 hover:text-red-400 font-medium flex items-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-[#71767B]">
            Manage your AI voice and subscription.
          </p>
        </div>

        <section className="bg-[#16181C] rounded-xl border border-[#2F3336] shadow-sm overflow-hidden group hover:border-[#1D9BF0] transition-all">
          <div className="p-6 border-b border-[#2F3336] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-[#1D9BF0]/10 p-2 rounded-lg group-hover:bg-[#1D9BF0]/20 transition-colors">
                <User className="w-5 h-5 text-[#1D9BF0]" />
              </div>
              <div>
                <h2 className="font-bold">AI Voice Profile</h2>
                <p className="text-sm text-[#71767B]">
                  How AI understands your style.
                </p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className="px-4 h-9 rounded-lg border border-[#2F3336] bg-black hover:bg-[#2F3336] text-sm text-[#E7E9EA] flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <RefreshCw className="w-3 h-3" /> Retrain Voice
            </Link>
          </div>

          <div className="p-6 bg-black/30">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-black p-4 border border-[#2F3336] rounded-lg text-[#71767B]">
              {localUser.toneProfile ||
                "No profile detected. Please retrain your voice."}
            </p>
          </div>
        </section>

        <section className="bg-[#16181C] rounded-xl border border-[#2F3336] shadow-sm overflow-hidden group hover:border-yellow-500 transition-colors">
          <div className="p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/10 p-2 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="font-bold">Performance Controls</h2>
                <p className="text-sm text-[#71767B]">
                  Adjust extension behavior.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2F3336]">
              <CooldownSettings
                initialCooldown={localUser.cooldownSeconds || 45}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#16181C] rounded-xl border border-[#2F3336] shadow-sm overflow-hidden group hover:border-green-500 transition-colors">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="font-bold">Subscription</h2>
                <p className="text-sm text-[#71767B]">
                  Current Status:{" "}
                  <span
                    className={`font-medium ${
                      isPro
                        ? "text-green-500"
                        : isTrial
                        ? "text-[#1D9BF0]"
                        : "text-red-500"
                    }`}
                  >
                    {planStatus}
                  </span>
                </p>
              </div>
            </div>

            {isPro ? (
              <div className="flex items-center gap-4">
                <CancelSubscriptionButton />
                <Link
                  href="https://dodopayments.com/customer"
                  target="_blank"
                  className="px-4 h-9 rounded-lg bg-[#E7E9EA] hover:bg-white text-black text-sm transition-all hover:-translate-y-0.5 font-semibold"
                >
                  <p className="mt-1.5">Manage Billing</p>
                </Link>
              </div>
            ) : (
              <CheckoutButton />
            )}
          </div>
        </section>

        <section className="bg-[#16181C] rounded-xl border border-[#2F3336] shadow-sm overflow-hidden group hover:border-[#71767B] transition-colors">
          <div className="p-6 border-b border-[#2F3336]">
            <div className="flex items-center gap-3">
              <div className="bg-[#2F3336] p-2 rounded-lg">
                <Key className="w-5 h-5 text-[#71767B]" />
              </div>
              <div>
                <h2 className="font-bold">Extension Key</h2>
                <p className="text-sm text-[#71767B]">
                  Auto-sync handles this. Use manually only if needed.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="text-xs font-bold text-[#71767B] uppercase tracking-wider block mb-2">
              Your Secret Key
            </label>

            <code className="flex-1 bg-black border border-[#2F3336] rounded-lg px-3 py-2 text-sm font-mono text-[#71767B] break-all block">
              {localUser.extensionKey}
            </code>

            <div className="flex justify-between items-start">
              <p className="text-xs text-[#71767B]/60 mt-2">
                Do not share this key. It grants access to your reply quota.
              </p>
              <RegenerateKeyButton />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
