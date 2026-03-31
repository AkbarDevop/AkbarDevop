"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/db/schema";

export default function ArchivePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts?archived=true")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Food Archive</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Past free food sightings — for the memories (and pattern spotting)
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] py-12 text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-2 font-medium">No archived posts yet</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Expired and finished posts will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4 opacity-80">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
