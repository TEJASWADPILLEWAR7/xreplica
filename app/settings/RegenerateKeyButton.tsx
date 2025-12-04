"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegenerateKeyButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    const confirmed = window.confirm(
      "Are you sure? This will invalidate your current key on all devices. You will be redirected to the Dashboard to sync the new key."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/settings/regenerate", {
        method: "POST",
      });

      if (res.ok) {
        // Redirect to dashboard immediately to force sync
        router.push("/dashboard");
      } else {
        alert("Failed to regenerate key.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      disabled={loading}
      className="text-xs text-[#71767B] hover:text-[#E7E9EA] underline flex items-center gap-1 mt-2"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <RefreshCw className="w-3 h-3" />
      )}
      Reset Key & Device Lock
    </button>
  );
}
