"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Chrome, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleStartTrial = () => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing");
      return;
    }

    // Redirect to onboarding instead of direct checkout
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] flex flex-col font-sans">
      {/* HEADER */}
      <header className="px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#71767B] hover:text-[#E7E9EA] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Same Logo Style as Landing Page */}
        <div className="text-lg font-semibold tracking-tight text-[#E7E9EA]">
          XReplica
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col items-center pt-12 px-4 pb-24">
        <div className="text-center space-y-4 mb-12 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Simple Pricing
          </h1>
          <p className="text-[#71767B] text-lg">
            Unlock full automated growth. Cancel anytime.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="w-full max-w-md bg-[#16181C] border border-[#2F3336] rounded-2xl shadow-[0_0_40px_-12px_rgba(29,155,240,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#1D9BF0] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold text-2xl text-[#E7E9EA]">Pro Plan</h3>

              <div className="text-right">
                <span className="text-5xl font-bold tracking-tight">$5.99</span>
                <span className="text-[#71767B] text-lg">/mo</span>
              </div>
            </div>

            <p className="text-sm text-[#71767B]">
              Includes a 3-day free trial. Cancel anytime.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                "Unlimited AI Replies",
                "Custom Voice Training",
                "Chrome Extension Access",
                "Priority Support",
                "Usage Analytics",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1D9BF0] shrink-0" />
                  <span className="text-sm text-[#E7E9EA]">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <button
                onClick={handleStartTrial}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-[#E7E9EA] text-black font-bold text-base hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Start 3-Day Free Trial"
                )}
              </button>

              <p className="text-xs text-center text-[#71767B] mt-4">
                Secured by Dodo Payments
              </p>
            </div>
          </div>
        </div>

        {/* Chrome CTA */}
        <div className="pt-12 text-center">
          <Link
            href="https://chromewebstore.google.com/detail/x-replica/jjngegcjfjmnlenoiljkhhpbgikcifll?utm_source=item-share-cb"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-medium text-sm transition-all hover:-translate-y-0.5"
          >
            <Chrome className="w-4 h-4" />
            Add to Chrome
          </Link>
          <p className="text-xs text-[#71767B] mt-3">
            3-day trial • No credit card needed
          </p>
        </div>
      </main>
    </div>
  );
}
