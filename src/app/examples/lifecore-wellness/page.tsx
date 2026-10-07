import type { Metadata } from "next";
import { AssetView } from "@/components/AssetView";
import { lifecoreWellnessAsset } from "@/lib/examples/lifecore-wellness";
import { toPublicAsset } from "@/lib/public-asset";

export const metadata: Metadata = {
  title: "LifeCore | Wellness coverage plan for Northstar Software",
  description: lifecoreWellnessAsset.subtitle,
  robots: { index: false, follow: false },
};

export default function LifeCoreWellnessExample() {
  return <AssetView asset={toPublicAsset(lifecoreWellnessAsset)} />;
}
