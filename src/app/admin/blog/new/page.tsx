import type { Metadata } from "next";
import BlogEditor from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "Yeni Yazı" };

export default function NewPostPage() {
  return <BlogEditor />;
}
