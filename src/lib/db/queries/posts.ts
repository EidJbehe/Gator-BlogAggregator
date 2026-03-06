import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts } from "../schema";

export async function createPost(
  title: string,
  url: string,
  description: string | null,
  publishedAt: Date | null,
  feedId: string
) {
  const [result] = await db
    .insert(posts)
    .values({
      title,
      url,
      description,
      publishedAt,
      feedId,
    })
    .returning();

  return result;
}

export async function getPostsForUser(userId: string, limit: number) {
  const results = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return results;
}
