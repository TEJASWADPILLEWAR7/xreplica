"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";

// --- SUB-COMPONENTS (Defined outside to prevent re-render focus loss) ---

const SectionLabel = ({ number, title }: { number: string; title: string }) => (
  <label className="block text-lg font-bold text-[#E7E9EA] mb-4 flex items-center gap-3">
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1D9BF0]/20 text-[#1D9BF0] text-sm border border-[#1D9BF0]/30 font-mono">
      {number}
    </span>
    {title}
  </label>
);

const RadioGroup = ({
  field,
  options,
  currentValue,
  onChange,
}: {
  field: string;
  options: string[];
  currentValue: string;
  onChange: (field: string, value: string) => void;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {options.map((opt) => {
      const isSelected = currentValue === opt;
      return (
        <button
          key={opt}
          onClick={() => onChange(field, opt)}
          className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border text-left flex items-center justify-between group ${
            isSelected
              ? "bg-[#1D9BF0] border-[#1D9BF0] text-white shadow-[0_4px_20px_-4px_rgba(29,155,240,0.5)] scale-[1.02]"
              : "bg-[#16181C] border-[#2F3336] text-[#71767B] hover:border-[#71767B] hover:text-[#E7E9EA]"
          }`}
        >
          {opt}
          {isSelected && (
            <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" />
          )}
        </button>
      );
    })}
  </div>
);

const TweetCard = ({
  number,
  type,
  tweet,
  value,
  field,
  onChange,
  optional = false,
}: {
  number: string;
  type: string;
  tweet: string;
  value: string;
  field: string;
  onChange: (field: string, value: string) => void;
  optional?: boolean;
}) => (
  <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl p-6 space-y-4 transition-all hover:border-[#1D9BF0]/50 group">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1D9BF0]/10 flex items-center justify-center text-[#1D9BF0] font-bold text-xs border border-[#1D9BF0]/20">
          {number}
        </div>
        <span className="text-xs font-bold text-[#71767B] uppercase tracking-wider bg-[#2F3336]/50 px-2 py-1 rounded-md border border-[#2F3336]">
          {type}
        </span>
      </div>
      {optional && (
        <span className="text-[10px] text-[#71767B] font-medium border border-[#2F3336] px-2 py-0.5 rounded-full">
          Optional
        </span>
      )}
    </div>

    <div className="pl-4 border-l-2 border-[#2F3336] group-hover:border-[#1D9BF0] transition-colors duration-300">
      <p className="text-[#E7E9EA] text-base leading-relaxed font-medium">
        “{tweet}”
      </p>
    </div>

    <div className="relative">
      <div className="absolute left-4 top-4 text-[#71767B]">
        <MessageSquare className="w-4 h-4" />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder="Type your natural reply here..."
        className="w-full bg-black border border-[#2F3336] rounded-xl p-4 pl-11 text-sm text-[#E7E9EA] focus:outline-none focus:border-[#1D9BF0] focus:ring-1 focus:ring-[#1D9BF0] transition-all resize-none h-28 placeholder-[#71767B] leading-relaxed"
      />
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [config, setConfig] = useState({
    vibe: "Balanced",
    emojis: "Sometimes",
    length: "One sentence",
    avoid: "Corporate, Robotic, Cringe, Dull, Over-formal, Spammy",
    insights: "Add insight",
    energy: "Match but keep my tone",
  });

  const [replies, setReplies] = useState({
    tweet1: "",
    tweet2: "",
    tweet3: "",
    tweet4: "",
  });

  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleReplyChange = (field: string, value: string) => {
    setReplies((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!config.avoid.trim()) {
      alert("Please specify a tone to avoid (e.g., 'Robotic').");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !replies.tweet1.trim() ||
      !replies.tweet2.trim() ||
      !replies.tweet3.trim()
    ) {
      alert("Please reply to at least the first 3 tweets to train your voice.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);

    const trainingData = `
Tweet: "Been building for months. Some days feel fast, some feel slow. But progress is progress."
Reply: "${replies.tweet1}"

Tweet: "AI tools are exploding, but real advantage comes from people who actually execute. Thoughts?"
Reply: "${replies.tweet2}"

Tweet: "I swear, every time I open my laptop, 10 new SaaS ideas pop up automatically 💀"
Reply: "${replies.tweet3}"

${
  replies.tweet4
    ? `Tweet: "Shoutout to everyone building in public — this community pushes me every day."\nReply: "${replies.tweet4}"`
    : ""
}
    `.trim();

    const payload = {
      feel: config.vibe,
      emojis: config.emojis,
      length: config.length,
      avoid: config.avoid,
      directness: config.vibe === "Direct" ? "Very direct" : "Balanced",
      replyObjective: config.insights,
      matchEnergy: config.energy,
      examples: trainingData,
      tweets: "",
    };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.hasActiveSubscription) {
          router.push("/dashboard");
        } else {
          initiateCheckout();
        }
      } else {
        alert(data.error || "Failed to save profile. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  const initiateCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Unable to initiate checkout. Please contact support.");
        setLoading(false);
      }
    } catch {
      alert("Payment service unavailable. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] py-12 px-4 font-sans selection:bg-[#1D9BF0] selection:text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#1D9BF0]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div
            className={`flex flex-col items-center gap-2 ${
              step >= 1 ? "text-[#1D9BF0]" : "text-[#71767B]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step >= 1
                  ? "border-[#1D9BF0] bg-[#1D9BF0] text-white"
                  : "border-[#2F3336] bg-[#16181C]"
              }`}
            >
              1
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Style
            </span>
          </div>
          <div
            className={`w-16 h-0.5 rounded-full transition-colors ${
              step >= 2 ? "bg-[#1D9BF0]" : "bg-[#2F3336]"
            }`}
          />
          <div
            className={`flex flex-col items-center gap-2 ${
              step >= 2 ? "text-[#1D9BF0]" : "text-[#71767B]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step >= 2
                  ? "border-[#1D9BF0] bg-[#1D9BF0] text-white"
                  : "border-[#2F3336] bg-[#16181C]"
              }`}
            >
              2
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Training
            </span>
          </div>
        </div>

        {/* STEP 1: CONFIGURATION */}
        {step === 1 && (
          <div className="space-y-10 animate-fade-in pb-20">
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-4xl font-bold text-[#E7E9EA] tracking-tight">
                Define Your Persona
              </h1>
              <p className="text-[#71767B] text-lg">
                Teach the AI exactly how you want to sound on X.
              </p>
            </div>

            <div className="space-y-12">
              <div className="space-y-3">
                <SectionLabel number="1" title="What's your reply vibe?" />
                <RadioGroup
                  field="vibe"
                  options={[
                    "Witty",
                    "Chill",
                    "Direct",
                    "Friendly",
                    "Sarcastic",
                    "Balanced",
                  ]}
                  currentValue={config.vibe}
                  onChange={handleConfigChange}
                />
              </div>

              <div className="space-y-3">
                <SectionLabel number="2" title="Do you use emojis?" />
                <RadioGroup
                  field="emojis"
                  options={["Yes", "No", "Sometimes"]}
                  currentValue={config.emojis}
                  onChange={handleConfigChange}
                />
              </div>

              <div className="space-y-3">
                <SectionLabel number="3" title="Preferred reply length?" />
                <RadioGroup
                  field="length"
                  options={["One sentence", "Two sentences", "Short paragraph"]}
                  currentValue={config.length}
                  onChange={handleConfigChange}
                />
              </div>

              <div className="space-y-3">
                <SectionLabel number="4" title="Tone to AVOID (Important)" />
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="e.g. Corporate, cringe, robotic, overly excited"
                    value={config.avoid}
                    onChange={(e) =>
                      handleConfigChange("avoid", e.target.value)
                    }
                    className="w-full bg-[#16181C] border border-[#2F3336] rounded-xl p-4 text-[#E7E9EA] focus:outline-none focus:border-[#1D9BF0] focus:ring-1 focus:ring-[#1D9BF0] transition-all placeholder-[#71767B] group-hover:border-[#71767B]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <SectionLabel number="5" title="Should we add insights?" />
                <RadioGroup
                  field="insights"
                  options={["Add insight", "Keep it simple"]}
                  currentValue={config.insights}
                  onChange={handleConfigChange}
                />
              </div>

              <div className="space-y-3">
                <SectionLabel number="6" title="Energy matching rule?" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Match but keep my tone", "Keep my tone always"].map(
                    (opt) => {
                      const isSelected = config.energy === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleConfigChange("energy", opt)}
                          className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border text-left flex items-center justify-between group ${
                            isSelected
                              ? "bg-[#1D9BF0] border-[#1D9BF0] text-white shadow-[0_4px_20px_-4px_rgba(29,155,240,0.5)]"
                              : "bg-[#16181C] border-[#2F3336] text-[#71767B] hover:border-[#71767B] hover:text-[#E7E9EA]"
                          }`}
                        >
                          {opt}
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-[#2F3336]">
              <button
                onClick={handleNext}
                className="btn bg-[#E7E9EA] hover:bg-white text-black font-bold py-4 px-10 rounded-full flex items-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(231,233,234,0.3)] text-lg"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VOICE TRAINING */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in pb-20">
            <div className="text-center space-y-4 mb-10">
              <div className="inline-flex items-center gap-2 bg-[#1D9BF0]/10 text-[#1D9BF0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#1D9BF0]/20">
                <Sparkles className="w-3 h-3" /> Voice Calibration
              </div>
              <h1 className="text-4xl font-bold text-[#E7E9EA] tracking-tight">
                Train Your Voice
              </h1>
              <p className="text-[#71767B] max-w-lg mx-auto text-lg">
                Reply to these tweets in your <b>natural style</b>. This "locks"
                your persona for the AI.
              </p>
            </div>

            <div className="space-y-6">
              <TweetCard
                number="1"
                type="Motivation / Journey"
                tweet="Been building for months. Some days feel fast, some feel slow. But progress is progress."
                field="tweet1"
                value={replies.tweet1}
                onChange={handleReplyChange}
              />

              <TweetCard
                number="2"
                type="Opinion / Insight"
                tweet="AI tools are exploding, but real advantage comes from people who actually execute. Thoughts?"
                field="tweet2"
                value={replies.tweet2}
                onChange={handleReplyChange}
              />

              <TweetCard
                number="3"
                type="Humor / Casual"
                tweet="I swear, every time I open my laptop, 10 new SaaS ideas pop up automatically 💀"
                field="tweet3"
                value={replies.tweet3}
                onChange={handleReplyChange}
              />

              <TweetCard
                number="4"
                type="Appreciation"
                tweet="Shoutout to everyone building in public — this community pushes me every day."
                field="tweet4"
                value={replies.tweet4}
                onChange={handleReplyChange}
                optional
              />
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-[#2F3336]">
              <button
                onClick={() => setStep(1)}
                className="text-[#71767B] hover:text-[#E7E9EA] text-sm font-medium transition-colors px-4 py-2 hover:bg-[#2F3336] rounded-lg"
              >
                Back to Style
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn bg-[#E7E9EA] hover:bg-white text-black font-bold py-4 px-10 rounded-full flex items-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_20px_-5px_rgba(231,233,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Finish & Launch <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
