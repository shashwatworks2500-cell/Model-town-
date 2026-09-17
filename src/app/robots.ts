import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/site-url";

const base = siteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
