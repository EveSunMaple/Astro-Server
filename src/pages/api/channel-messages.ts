import type { APIRoute } from "astro";
import { load } from "cheerio";
import { ofetch } from "ofetch";

export const GET: APIRoute = async ({ url }) => {
  // 从环境变量获取频道名称
  const CHANNEL = import.meta.env.CHANNEL || "saroprock";
  const STATICS_PROXY = import.meta.env.STATICS_PROXY || "/static/";

  // 从查询参数获取分页参数 before 和 limit
  const before = url.searchParams.get("before") || "";
  const limit = Number.parseInt(url.searchParams.get("limit") || "20", 10);

  try {
    // 构建 t.me URL，带上 before 参数以支持分页
    const telegramUrl = `https://t.me/s/${CHANNEL}${before ? `?before=${before}` : ""}`;
    const html = await ofetch(telegramUrl, { method: "GET" });

    // 使用 cheerio 解析 HTML
    const $ = load(html);
    const messagesElements = $(".tgme_channel_history .tgme_widget_message_wrap");
    const messages: any[] = [];

    messagesElements.each((_, element) => {
      const $el = $(element);
      const messageId = $el.find(".tgme_widget_message").attr("data-post")?.split("/")[1];
      const date = $el.find(".tgme_widget_message_date time").attr("datetime");
      const text = $el.find(".tgme_widget_message_text").text().trim();

      // 处理媒体文件（图片或视频）
      let media = "";
      const photo = $el.find(".tgme_widget_message_photo_wrap").attr("style");
      const video = $el.find(".tgme_widget_message_video").attr("src");
      if (photo) {
        const match = photo.match(/background-image:url\('(.+?)'\)/);
        if (match)
          media = STATICS_PROXY + match[1];
      }
      else if (video) {
        media = STATICS_PROXY + video;
      }

      if (messageId) {
        messages.push({
          id: messageId,
          date,
          text,
          media: media || undefined,
        });
      }
    });

    // 按 ID 降序排序，确保最新消息在前
    messages.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id));

    // 限制消息数量
    const limitedMessages = messages.slice(0, limit);

    // 判断是否还有更多消息
    const hasMore = messages.length > limit || (before && messages.length > 0);

    return new Response(
      JSON.stringify({
        messages: limitedMessages,
        hasMore,
        total: messages.length,
        page: before ? Number.parseInt(before) : 1,
        limit,
        chat: { id: CHANNEL, title: CHANNEL, type: "channel" },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  catch (error) {
    console.error("Error fetching Telegram messages:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch messages" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
