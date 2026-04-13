export function marketUrl(id: string, question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
  return `/market/${id}-${slug}`;
}
