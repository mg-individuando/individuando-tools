import { EditorPost } from "@/components/posts/editor-post";

export const metadata = { title: "Posts — Individuando" };

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <p className="text-sm text-muted-foreground">
          Aniversário. A arte segue a identidade automaticamente — você ajusta foto, data e nome.
        </p>
      </header>
      <EditorPost />
    </div>
  );
}
