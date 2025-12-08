import "dotenv/config";
import { db } from "../lib/db";
import { jobs, users } from "../lib/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { generateTweetReply } from "../lib/ai";

const POLLING_INTERVAL_MS = 1_000;
const RATE_LIMIT_DELAY_MS = 3_500;
const RETRY_DELAY_MS = 5_000;

let isShuttingDown = false;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const now = () => new Date();

function normalizeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message.slice(0, 500); // prevent log/db abuse
  }
  return "Unexpected error";
}

const shutdown = () => {
  isShuttingDown = true;
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function processJob(job: typeof jobs.$inferSelect): Promise<void> {
  try {
    // Lock job
    await db
      .update(jobs)
      .set({ status: "processing", updatedAt: now() })
      .where(eq(jobs.id, job.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, job.userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { reply } = await generateTweetReply(
      job.tweetText,
      user.toneProfile,
      job.imageUrl ?? undefined
    );

    await db
      .update(jobs)
      .set({
        status: "completed",
        reply,
        updatedAt: now(),
      })
      .where(eq(jobs.id, job.id));
  } catch (err) {
    const errorMessage = normalizeError(err);

    console.error("[Worker] Job failed", {
      jobId: job.id,
      error: errorMessage,
    });

    await db
      .update(jobs)
      .set({
        status: "failed",
        error: errorMessage,
        updatedAt: now(),
      })
      .where(eq(jobs.id, job.id));
  }
}

async function runWorker(): Promise<void> {
  while (!isShuttingDown) {
    try {
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.status, "pending"))
        .orderBy(asc(jobs.createdAt))
        .limit(1);

      if (job) {
        await processJob(job);
        await sleep(RATE_LIMIT_DELAY_MS);
      } else {
        await sleep(POLLING_INTERVAL_MS);
      }
    } catch (err) {
      console.error("[Worker] Loop error", {
        error: normalizeError(err),
      });
      await sleep(RETRY_DELAY_MS);
    }
  }
}
runWorker().catch((err) => {
  console.error("[Worker] Fatal error", normalizeError(err));
  process.exit(1);
});
