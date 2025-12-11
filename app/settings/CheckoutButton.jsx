"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutButton({ className = "" }) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/checkout", { method: "POST" });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout failed.");
            }
        } catch {
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`px-4 h-10 rounded-xl bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Redirecting..." : "Upgrade to Pro"}
        </button>
    );
}