import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "../consts";

export async function GET(context) {
  const blog = (await getCollection("blog", ({ data }) => !data.draft)).map((p) => ({
    ...p,
    base: "/blog",
  }));
  const research = (await getCollection("research", ({ data }) => !data.draft)).map((p) => ({
    ...p,
    base: "/research",
  }));

  const items = [...blog, ...research].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: items.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `${p.base}/${p.id}/`,
    })),
  });
}
