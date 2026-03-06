import { fetchFeed } from "./rss";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";

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
    console.log(item.title);
  }
}
