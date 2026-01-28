import { GoogleGenAI } from "@google/genai";
import { REPLY_GENERATION_PROMPT, STYLE_ANALYSIS_PROMPT } from "@/lib/prompts";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: URL to Base64
async function urlToGenerativePart(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const buffer = await response.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    return {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
  } catch (e) {
    console.error("Image processing failed:", e);
    return null;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function analyzeTone(data: any) {
  try {
    let prompt = STYLE_ANALYSIS_PROMPT;
    prompt = prompt.replace("{{feel}}", data.feel);
    prompt = prompt.replace("{{emojis}}", data.emojis);
    prompt = prompt.replace("{{length}}", data.length);
    prompt = prompt.replace("{{avoid}}", data.avoid);
    prompt = prompt.replace("{{directness}}", data.directness);
    prompt = prompt.replace("{{replyObjective}}", data.replyObjective);
    prompt = prompt.replace("{{matchEnergy}}", data.matchEnergy);
    prompt = prompt.replace("{{examples}}", data.examples);
    prompt = prompt.replace(
      "{{tweets}}",
      data.tweets || "No extra tweets provided.",
    );

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const analysis = response.text;
    if (!analysis) throw new Error("Empty analysis");
    return analysis.trim();
  } catch (error) {
    console.error("Tone Analysis Error:", error);
    return "Professional, casual, authentic voice.";
  }
}

// 2. GENERATE REPLY (Fixed Return Type)
export async function generateTweetReply(
  tweet: string,
  toneProfile: string | null,
  imageUrl?: string,
  isRetry: boolean = false,
) {
  const startTime = Date.now();
  const profile = toneProfile || "Professional, casual, lowercase, witty.";
  const tweetContent = tweet ? tweet : "[NO TEXT - IMAGE ONLY]";

  let promptText = REPLY_GENERATION_PROMPT.replace("{{tone_profile}}", profile);
  promptText = promptText.replace("{{tweet_to_reply}}", tweetContent);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputParts: any[] = [promptText];
  let imageProcessed = false;

  if (imageUrl) {
    const imagePart = await urlToGenerativePart(imageUrl);
    if (imagePart) {
      inputParts.push(imagePart);
      inputParts[0] +=
        "\n\n[SYSTEM NOTE: The tweet is an image. Analyze visual context.]";
      imageProcessed = true;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: inputParts,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const rawReply = response.text || "";

    // Error Recovery
    const isError =
      rawReply.toLowerCase().includes("error") ||
      rawReply.includes("undefined");
    if (!isRetry && (isError || rawReply.length < 2)) {
      return generateTweetReply(tweet, toneProfile, imageUrl, true);
    }

    // Cleanup
    let final = rawReply
      .replace(/^["']|["']$/g, "")
      .replace(/\*/g, "")
      .replace(/_/g, "");
    final = final.trim().replace(/\n+/g, " ").replace(/\s+/g, " ");

    // Logs
    const logs = {
      responseCleaned: final,
      replyLength: final.length,
      decisionType: imageProcessed ? "image" : "text",
      executionTime: Date.now() - startTime,
    };

    // Return OBJECT (This matches what route.ts expects)
    return { reply: final, logs };
  } catch (error) {
    console.error("Gemini Error:", error);
    if (!isRetry)
      return generateTweetReply(tweet, toneProfile, undefined, true);
    throw error;
  }
}
