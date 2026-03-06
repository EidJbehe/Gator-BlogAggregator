import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // 1) Fetch XML
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  if (!isNonEmptyString(xml)) {
    throw new Error("feed response was empty");
  }

  // 2) Parse XML -> JS object
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const parsed = parser.parse(xml) as any;

  // RSS root can be parsed.rss.channel
  const channel = parsed?.rss?.channel;
  if (!channel || typeof channel !== "object") {
    throw new Error("invalid RSS: missing channel");
  }

  // 3) Extract channel metadata
  const title = channel?.title;
  const link = channel?.link;
  const description = channel?.description;

  if (!isNonEmptyString(title)) {
    throw new Error("invalid RSS: missing channel title");
  }
  if (!isNonEmptyString(link)) {
    throw new Error("invalid RSS: missing channel link");
  }
  if (!isNonEmptyString(description)) {
    throw new Error("invalid RSS: missing channel description");
  }

  // 4) Extract items (might be object or array or missing)
  let rawItems: any[] = [];
  if (channel.item) {
    rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
  }

  const items: RSSItem[] = [];

  for (const it of rawItems) {
    const itTitle = it?.title;
    const itLink = it?.link;
    const itDesc = it?.description;
    const itPubDate = it?.pubDate;

    // Skip invalid items
    if (
      !isNonEmptyString(itTitle) ||
      !isNonEmptyString(itLink) ||
      !isNonEmptyString(itDesc) ||
      !isNonEmptyString(itPubDate)
    ) {
      continue;
    }

    items.push({
      title: itTitle,
      link: itLink,
      description: itDesc,
      pubDate: itPubDate,
    });
  }

  // 5) Assemble result
  return {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
}
