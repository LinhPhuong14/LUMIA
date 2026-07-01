import { BoxesShowcaseClient } from "@/components/landing/sections/boxes-showcase-client";
import { getLandingBoxCards } from "@/lib/landing-plans";

export async function BoxesShowcaseSection() {
  const boxes = await getLandingBoxCards();
  return <BoxesShowcaseClient boxes={boxes} />;
}
