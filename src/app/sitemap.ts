import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/diagnostic"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // /apply is intentionally omitted: on its own it is a form, and the useful
    // version of it is always reached with a diagnostic attached.
  ];
}
