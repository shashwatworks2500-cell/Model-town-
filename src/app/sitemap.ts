import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/site-url";

const base = siteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
