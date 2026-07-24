import type { MetadataRoute } from "next";
import { curriculumDays } from "./curriculum";
import { SITE_URL, absoluteUrl, lessonPath } from "./seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...curriculumDays.map((day) => ({
      url: absoluteUrl(lessonPath(day)),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
