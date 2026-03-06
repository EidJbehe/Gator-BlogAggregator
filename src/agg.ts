import { fetchFeed } from "./rss";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { createPost } from "./lib/db/queries/posts";

function parsePublishedDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);

  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export async function scrapeFeeds(): Promise<void> {
  const nextFeed = await getNextFeedToFetch();

  if (!nextFeed) {
    console.log("No feeds found to fetch.");
    return;
  }

  console.log(`Fetching feed: ${nextFeed.name}`);
  console.log(`URL: ${nextFeed.url}`);

  await markFeedFetched(nextFeed.id);

  const feed = await fetchFeed(nextFeed.url);

  for (const item of feed.channel.item) {
    try {
      await createPost(
        item.title,
        item.link,
        item.description ?? null,
        parsePublishedDate(item.pubDate),
        nextFeed.id
      );

      console.log(`Saved post: ${item.title}`);
    } catch (err: any) {
      // duplicate post بسبب unique url
      if (err?.code === "23505") {
        continue;
      }

      console.error(
        "Error saving post:",
        err instanceof Error ? err.message : String(err)
      );
    }
  }
}
