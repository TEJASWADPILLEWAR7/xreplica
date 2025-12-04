import Link from "next/link";
import { ArrowLeft, Shield, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] flex flex-col font-sans selection:bg-[#1D9BF0] selection:text-white">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-4xl mx-auto w-full border-b border-[#2F3336]">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#71767B] hover:text-[#E7E9EA] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-lg font-semibold tracking-tight text-[#E7E9EA]">
          XReplica
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[#71767B]">Last Updated: December 2025</p>
        </div>

        <div className="space-y-12 text-[#E7E9EA] leading-relaxed">
          {/* 1. Introduction */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                1
              </span>
              Introduction
            </h2>
            <p className="text-[#71767B]">
              X-Replica (“we”, “us”, “our”) provides an AI-powered Chrome
              extension and web application that helps users generate AI replies
              on X.com (Twitter). We care deeply about your privacy and are
              committed to protecting your data.
            </p>
            <p className="text-[#71767B]">
              This Privacy Policy explains what information we collect, how we
              use it, what we never collect, and your rights.
            </p>
          </section>

          {/* 2. Data We Do NOT Collect */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                2
              </span>
              Data We Do NOT Collect
            </h2>
            <p className="text-[#71767B]">
              X-Replica is designed to respect your privacy. We do{" "}
              <strong className="text-white">not</strong> collect, store, or
              sell:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 mt-2">
              {[
                "Personal contact info (address, phone)",
                "Credit card or financial data",
                "Browsing history",
                "Location data",
                "Private messages or DMs",
                "Tracking cookies",
                "Sensitive personal information",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-[#71767B] bg-[#16181C] p-3 rounded-lg border border-[#2F3336]"
                >
                  <span className="text-red-500">❌</span> {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#71767B] italic mt-2">
              We do not track your behavior on any website.
            </p>
          </section>

          {/* 3. Chrome Extension */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                3
              </span>
              Data the Chrome Extension Accesses
            </h2>
            <p className="text-[#71767B]">
              The Chrome extension only interacts with public tweet content on
              X.com to allow the “AI Reply” button to work.
            </p>
            <div className="bg-[#16181C] p-5 rounded-xl border border-[#2F3336] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  What it DOES:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-[#71767B] text-sm">
                  <li>Reads the text of the tweet you explicitly select.</li>
                  <li>
                    Sends that text to our API to generate a relevant reply.
                  </li>
                  <li>Displays the generated reply back to you.</li>
                </ul>
              </div>
              <div className="border-t border-[#2F3336] pt-4">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  What it DOES NOT do:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-[#71767B] text-sm">
                  <li>Track your activity or scroll history.</li>
                  <li>Read private messages.</li>
                  <li>Access your account credentials.</li>
                  <li>Monitor browsing on other sites.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Local Storage */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                4
              </span>
              Local Storage (On Your Device Only)
            </h2>
            <p className="text-[#71767B]">
              The only data saved locally on your browser is your{" "}
              <strong className="text-white">X-Replica API Key</strong>. This is
              stored using Chrome’s secure local storage and never leaves your
              device unless YOU choose to use it for generating replies. We
              never access this key directly from our servers.
            </p>
          </section>

          {/* 5. Website Data */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                5
              </span>
              Data the Website Processes
            </h2>
            <p className="text-[#71767B]">
              If you create an account or subscribe, we collect the minimum
              necessary info:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#71767B] pl-2">
              <li>Email address.</li>
              <li>Authentication info (via Clerk).</li>
              <li>
                Payment identifiers (handled securely by Dodo Payments—we never
                see card numbers).
              </li>
            </ul>
          </section>

          {/* 6. How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                6
              </span>
              How We Use Data
            </h2>
            <p className="text-[#71767B]">
              We use your information solely to: authenticate you, generate AI
              replies, manage your subscription, and provide support. We do{" "}
              <strong className="text-white">not</strong> sell, rent, or share
              your data with third parties.
            </p>
          </section>

          {/* 7. AI Processing */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                7
              </span>
              AI Content Processing
            </h2>
            <p className="text-[#71767B]">
              When you request a reply, the tweet text is sent to our AI models
              (Google Gemini) to generate the response. We do not permanently
              store the content of your tweets or the generated replies after
              processing.
            </p>
          </section>

          {/* 8. Third Parties */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                8
              </span>
              Third-Party Services
            </h2>
            <p className="text-[#71767B]">
              We use trusted providers who adhere to strict security standards:
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 mt-2">
              <li className="bg-[#16181C] p-3 rounded-lg border border-[#2F3336] text-sm text-[#71767B]">
                <strong className="text-[#E7E9EA] block mb-1">Clerk</strong>
                Secure Authentication
              </li>
              <li className="bg-[#16181C] p-3 rounded-lg border border-[#2F3336] text-sm text-[#71767B]">
                <strong className="text-[#E7E9EA] block mb-1">
                  Dodo Payments
                </strong>
                Payment Processing
              </li>
              <li className="bg-[#16181C] p-3 rounded-lg border border-[#2F3336] text-sm text-[#71767B]">
                <strong className="text-[#E7E9EA] block mb-1">Vercel</strong>
                Secure Hosting
              </li>
              <li className="bg-[#16181C] p-3 rounded-lg border border-[#2F3336] text-sm text-[#71767B]">
                <strong className="text-[#E7E9EA] block mb-1">Google AI</strong>
                LLM Processing
              </li>
            </ul>
          </section>

          {/* 9. Security */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                9
              </span>
              Security Measures
            </h2>
            <p className="text-[#71767B]">
              We protect your data using HTTPS encryption, secure local storage,
              and by requesting no unnecessary permissions. We do not use
              third-party trackers.
            </p>
          </section>

          {/* 10. Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                10
              </span>
              Children’s Privacy
            </h2>
            <p className="text-[#71767B]">
              X-Replica is not intended for users under the age of 13. We do not
              knowingly collect information from children.
            </p>
          </section>

          {/* 11. Rights */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                11
              </span>
              Your Rights
            </h2>
            <p className="text-[#71767B]">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#71767B] pl-2">
              <li>Request what personal information is stored.</li>
              <li>Delete your account and data.</li>
              <li>Reset your API key.</li>
              <li>Disconnect the Chrome extension at any time.</li>
              <li>Unsubscribe from emails.</li>
            </ul>
          </section>

          {/* 12. Updates */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2F3336] text-xs text-[#71767B]">
                12
              </span>
              Updates to This Policy
            </h2>
            <p className="text-[#71767B]">
              We may update this Privacy Policy as needed. If we make
              significant changes, we will notify users on our website.
            </p>
          </section>

          {/* 13. Contact */}
          <section className="pt-8 border-t border-[#2F3336]">
            <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-[#71767B] mb-4">
              For privacy questions, data deletion requests, or concerns, please
              email us directly:
            </p>
            <a
              href="mailto:tejaswadpillewar2@gmail.com"
              className="inline-flex items-center gap-2 text-[#1D9BF0] hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              tejaswadpillewar2@gmail.com
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-[#2F3336] text-center">
        <div className="max-w-4xl mx-auto px-6 text-xs text-[#71767B]">
          <p>© 2025 XReplica. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
