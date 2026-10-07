import type { Metadata } from "next";
import { AssetView } from "@/components/AssetView";
import { linearSupportAsset } from "@/lib/examples/linear-support";
import { toPublicAsset } from "@/lib/public-asset";
export const metadata: Metadata = {
  title: "A first-week support kit for Linear",
  description: linearSupportAsset.subtitle,
  robots: { index: false, follow: false },
};
export default function LinearSupportExample() {
  return <AssetView asset={toPublicAsset(linearSupportAsset)} />;
}
