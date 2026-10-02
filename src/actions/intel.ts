"use server";

import Parser from "rss-parser";

const parser = new Parser();

export async function fetchThreatIntel() {
  try {
    const feed = await parser.parseURL(
      "https://feeds.feedburner.com/TheHackersNews"
    );

    return feed.items.slice(0, 6).map((item) => ({
      source: "Hacker News",
      title: item.title || "Untitled threat intelligence",
      url: item.link || "#",
      time: item.pubDate
        ? new Date(item.pubDate).toLocaleDateString()
        : "Recent",
    }));
  } catch (error) {
    console.error("Threat Intel Error:", error);
    return [];
  }
}
