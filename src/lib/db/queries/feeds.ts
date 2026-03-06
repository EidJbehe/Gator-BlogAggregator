import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";
export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return result;
}
export async function markFeedFetched(feedId: string) {
  const [result] = await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId))
    .returning();

  return result;
}
export async function getNextFeedToFetch() {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} NULLS FIRST`)
    .limit(1);

  return result;
}
export async function getFeeds() {
  const results = await db
    .select({
      id: feeds.id,
      createdAt: feeds.createdAt,
      updatedAt: feeds.updatedAt,
      name: feeds.name,
      url: feeds.url,
      userId: feeds.userId,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));

  return results;
}
export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}
