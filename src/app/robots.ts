import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing under /api is a page, and an indexed POST endpoint is only ever
      // noise in search results.
      disallow: ["/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
