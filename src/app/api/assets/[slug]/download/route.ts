import { getAsset } from "@/lib/storage";
import { assetToMarkdown, toPublicAsset } from "@/lib/public-asset";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,180}$/.test(slug))
    return new Response("Invalid asset identifier", { status: 400 });
  const asset = await getAsset(slug);
  if (!asset) return new Response("Asset not found", { status: 404 });
  return new Response(assetToMarkdown(toPublicAsset(asset)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.md"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
