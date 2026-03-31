"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/db/schema";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activePosts = posts.filter(
    (p) => p.status !== "gone" && new Date(p.expiresAt) > new Date()
  );
  const expiredPosts = posts.filter(
    (p) => p.status === "gone" || new Date(p.expiresAt) <= new Date()
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Free Food Right Now</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            See what&apos;s available on campus
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            Loading...
          </div>
        ) : activePosts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] py-12 text-center">
            <p className="text-4xl">🍕</p>
            <p className="mt-2 font-medium">No free food right now</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Be the first to post!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {expiredPosts.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-[var(--muted-foreground)]">
              Recently Expired
            </h2>
            <div className="space-y-3 opacity-60">
              {expiredPosts.slice(0, 5).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
