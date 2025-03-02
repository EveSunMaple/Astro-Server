import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { marked } from "marked";

export async function GET(context: any) {
  const blogs = await getCollection("blog");
  const sortedblogs = blogs.sort((a: any, b: any) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  function replacePath(content: string, siteUrl: string): string {
    return content.replace(/(src|img|r|l)="([^"]+)"/g, (match, attr, src) => {
      if (!src.startsWith("http") && !src.startsWith("//") && !src.startsWith("data:")) {
        return `${attr}="${new URL(src, siteUrl).toString()}"`;
      }
      return match;
    });
  }

  const items = await Promise.all(sortedblogs.map(async (blog: any) => {
    const { data: { title, description, pubDate }, body, slug } = blog;

    const content = body
      ? replacePath(await marked(body), context.site)
      : "No content available.";

    const blogURL = new URL(`/blog/${slug}/`, context.site);

    return {
      title,
      description,
      link: blogURL.toString(),
      guid: blogURL.toString(),
      content: `<blockquote>This rendering was automatically generated by RSS Feed and may have formatting issues. For the best experience, please visit: <a href="${blogURL}">${blogURL}</a></blockquote> ${content}`,
      customData: `
        <dc:creator><![CDATA[SunMaple(https://www.saroprock.com)]]></dc:creator>
        <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
      `,
    };
  }));

  return rss({
    title: "SaroProck",
    description: "Personal blog about technology, programming, and life.",
    site: context.site,
    items,
    customData: `
      <language>zh</language>
    `,
    xmlns: {
      dc: "http://purl.org/dc/elements/1.1/",
      content: "http://purl.org/rss/1.0/modules/content/",
      atom: "http://www.w3.org/2005/Atom",
      version: "2.0",
    },
  });
}
