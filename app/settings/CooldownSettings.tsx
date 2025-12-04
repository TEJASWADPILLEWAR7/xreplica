"use client";

import { useState } from "react";
import { Loader2, Save, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface CooldownSettingsProps {
  initialCooldown: number;
}

export default function CooldownSettings({
  initialCooldown,
}: CooldownSettingsProps) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cooldown }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to update settings");
      }
    } catch (error) {
      console.error("Settings error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
      <div className="flex-1 w-full">
        <label className="text-sm font-medium text-[#E7E9EA] mb-1.5 block flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#71767B]" />
          Reply Cooldown (Seconds)
        </label>

        <p className="text-xs text-[#71767B] mb-3">
          Minimum wait time between AI generations to prevent spam.
        </p>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min={5}
            max={300}
            value={cooldown}
            onChange={(e) => setCooldown(parseInt(e.target.value) || 0)}
            className="bg-black border border-[#2F3336] text-[#E7E9EA] rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-[#1D9BF0] transition-colors font-mono text-sm"
          />

          <button
            onClick={handleSave}
            disabled={loading || cooldown === initialCooldown}
            className="px-4 py-2 h-9 rounded-lg bg-[#E7E9EA] hover:bg-white text-black text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : saved ? (
              "Saved!"
            ) : (
              <>
                <Save className="w-3 h-3" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
