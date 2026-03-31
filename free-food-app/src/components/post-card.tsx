"use client";

import { useState } from "react";
import type { Post } from "@/db/schema";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  running_low: "bg-orange-100 text-orange-800",
  gone: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  running_low: "Running Low",
  gone: "Gone",
};

const foodTypeEmojis: Record<string, string> = {
  pizza: "🍕",
  sandwiches: "🥪",
  snacks: "🍿",
  drinks: "🥤",
  dessert: "🍰",
  fruit: "🍎",
  coffee: "☕",
  other: "🍽️",
};

function getEmoji(foodType: string) {
  const lower = foodType.toLowerCase();
  return foodTypeEmojis[lower] || "🍽️";
}

export function PostCard({ post }: { post: Post }) {
  const [confirming, setConfirming] = useState(false);
  const isExpired = new Date(post.expiresAt) < new Date();
  const displayStatus = isExpired && post.status === "available" ? "gone" : post.status;

  async function handleConfirm(stillAvailable: boolean) {
    setConfirming(true);
    try {
      await fetch(`/api/posts/${post.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stillAvailable }),
      });
      window.location.reload();
    } catch {
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEmoji(post.foodType)}</span>
            <h3 className="font-semibold text-lg">{post.title}</h3>
          </div>
          {post.description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {post.description}
            </p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusColors[displayStatus]
          )}
        >
          {statusLabels[displayStatus]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
        <span>📍 {post.location}</span>
        {post.building && <span>🏢 {post.building}</span>}
        {post.roomNumber && <span>🚪 Room {post.roomNumber}</span>}
        <span>🍽️ {post.foodType}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>

        {displayStatus !== "gone" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">
              👍 {post.upvotes} · 👎 {post.downvotes}
            </span>
            <button
              onClick={() => handleConfirm(true)}
              disabled={confirming}
              className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
            >
              Still here
            </button>
            <button
              onClick={() => handleConfirm(false)}
              disabled={confirming}
              className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              Gone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
