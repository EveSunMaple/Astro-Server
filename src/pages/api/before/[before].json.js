// File: src/pages/api/before/[before].json.js
import { getChannelInfo } from "../../../lib/telegram";

export async function GET({ params, request }) {
  const before = params.before;
  const limit = 10; // 每页消息数量
  const channel = await getChannelInfo({ request }, { before, limit });
  const messages = channel.posts.map((post) => ({
    id: post.id,
    datetime: post.datetime,
    content: post.content, // 已处理好的 HTML 内容
  }));
  const hasMore = messages.length === limit; // 如果返回数量等于 limit，假设还有更多
  return new Response(JSON.stringify({ messages, hasMore }), {
    headers: { "Content-Type": "application/json" },
  });
}