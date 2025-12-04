"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

const REASONS = [
  "Not getting enough value",
  "Too expensive right now",
  "AI replies don’t match my writing style",
  "Not using X enough to justify it",
  "Facing technical issues / bugs",
  "I only needed it for a short time",
  "Switching to another tool",
  "Other",
];

export default function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    if (!selectedReason) {
      alert("Please select a reason to continue.");
      return;
    }
    if (selectedReason === "Other" && !otherDetails.trim()) {
      alert("Please tell us more about why you are cancelling.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          details: selectedReason === "Other" ? otherDetails : null,
        }),
      });

      if (res.ok) {
        alert("Subscription cancelled successfully.");
        setShowModal(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmDisabled =
    loading ||
    !selectedReason ||
    (selectedReason === "Other" && !otherDetails.trim());

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10"
      >
        <AlertTriangle className="w-4 h-4" />
        Cancel Subscription
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#71767B] hover:text-[#E7E9EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#E7E9EA] mb-2">
              {`We're sorry to see you go`}
            </h3>
            <p className="text-sm text-[#71767B] mb-6">
              Help us improve by sharing why you are cancelling.
            </p>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1 custom-scroll">
              {REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-[#1D9BF0] bg-[#1D9BF0]/10"
                      : "border-[#2F3336] hover:bg-[#2F3336]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-[#1D9BF0] w-4 h-4"
                  />
                  <span className="text-sm text-[#E7E9EA]">{reason}</span>
                </label>
              ))}

              {selectedReason === "Other" && (
                <textarea
                  className="w-full p-3 rounded-xl border border-[#2F3336] bg-black text-[#E7E9EA] text-sm focus:border-[#1D9BF0] focus:outline-none resize-none"
                  placeholder="Please tell us more... (Required)"
                  rows={3}
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#2F3336] text-[#E7E9EA] font-medium hover:bg-[#2F3336] transition-colors"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={isConfirmDisabled}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
