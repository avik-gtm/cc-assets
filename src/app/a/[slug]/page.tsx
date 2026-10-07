import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetView } from "@/components/AssetView";
import { getAsset } from "@/lib/storage";
import { toPublicAsset } from "@/lib/public-asset";

type AssetPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AssetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAsset(slug);
  return asset
    ? { title: asset.title, description: asset.subtitle }
    : { title: "Asset not found" };
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) notFound();
  return <AssetView asset={toPublicAsset(asset)} />;
}
