"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function ViewCounter({
  slug,
  initialViews,
}: {
  slug: string;
  initialViews: number;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((r) => r.json())
      .then(() => setViews((v) => v + 1))
      .catch(() => {});
  }, [slug]);

  return (
    <span className="flex items-center gap-1.5">
      <Eye size={12} />
      {views.toLocaleString("tr-TR")} görüntülenme
    </span>
  );
}
