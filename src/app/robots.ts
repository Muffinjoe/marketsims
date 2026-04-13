import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/portfolio", "/admin"],
    },
    sitemap: "https://marketsims.com/sitemap.xml",
  };
}
