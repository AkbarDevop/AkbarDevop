import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { db } from "@/db";
import { posts, confirmations } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

const app = new Hono().basePath("/api");

// Validation schema for creating a post
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  foodType: z.string().min(1).max(100),
  location: z.string().min(1).max(300),
  building: z.string().max(200).optional(),
  roomNumber: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
  expiresInHours: z.number().min(0.5).max(24).default(2),
});

// GET /api/posts — list active posts
app.get("/posts", async (c) => {
  const showArchived = c.req.query("archived") === "true";

  const result = await db
    .select()
    .from(posts)
    .where(
      showArchived ? eq(posts.archived, true) : eq(posts.archived, false)
    )
    .orderBy(desc(posts.createdAt));

  return c.json(result);
});

// GET /api/posts/:id — single post
app.get("/posts/:id", async (c) => {
  const id = c.req.param("id");
  const [post] = await db.select().from(posts).where(eq(posts.id, id));

  if (!post) return c.json({ error: "Post not found" }, 404);
  return c.json(post);
});

// POST /api/posts — create a new post
app.post("/posts", async (c) => {
  const body = await c.req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { expiresInHours, ...data } = parsed.data;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const [post] = await db
    .insert(posts)
    .values({ ...data, expiresAt })
    .returning();

  return c.json(post, 201);
});

// PATCH /api/posts/:id/status — update post status
app.patch("/posts/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!["available", "running_low", "gone"].includes(status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const [updated] = await db
    .update(posts)
    .set({
      status,
      archived: status === "gone" ? true : undefined,
    })
    .where(eq(posts.id, id))
    .returning();

  if (!updated) return c.json({ error: "Post not found" }, 404);
  return c.json(updated);
});

// POST /api/posts/:id/confirm — confirm food is still there (or not)
app.post("/posts/:id/confirm", async (c) => {
  const postId = c.req.param("id");
  const { stillAvailable } = await c.req.json();

  const [confirmation] = await db
    .insert(confirmations)
    .values({ postId, stillAvailable: Boolean(stillAvailable) })
    .returning();

  // Update upvote/downvote counts
  if (stillAvailable) {
    await db
      .update(posts)
      .set({ upvotes: (await db.select().from(posts).where(eq(posts.id, postId)))[0].upvotes + 1 })
      .where(eq(posts.id, postId));
  } else {
    await db
      .update(posts)
      .set({ downvotes: (await db.select().from(posts).where(eq(posts.id, postId)))[0].downvotes + 1 })
      .where(eq(posts.id, postId));
  }

  return c.json(confirmation, 201);
});

// POST /api/posts/:id/archive — manually archive
app.post("/posts/:id/archive", async (c) => {
  const id = c.req.param("id");
  const [updated] = await db
    .update(posts)
    .set({ archived: true, status: "gone" })
    .where(eq(posts.id, id))
    .returning();

  if (!updated) return c.json({ error: "Post not found" }, 404);
  return c.json(updated);
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
