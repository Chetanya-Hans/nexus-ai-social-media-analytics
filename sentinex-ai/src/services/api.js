// =====================================================================================
// api.js — single data access layer for SentiNex AI
// Tries the FastAPI backend first; falls back to rich demo data if unavailable.
// =====================================================================================

import * as mock from "../data/mockData.js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const MOCK_DELAY = 450;

function mockDelay(data, ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

async function safeFetch(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function withFallback(fetcher, fallback) {
  try {
    return await fetcher();
  } catch (err) {
    console.warn("[SentiNex] API unavailable — using demo dataset:", err.message);
    return fallback();
  }
}

function toPercentDistribution(items, labelKey) {
  if (!items?.length) return [];
  const total = items.reduce((sum, item) => sum + (item.count ?? item.value ?? 0), 0);
  if (!total) {
    return items.map((item) => ({
      [labelKey]: item[labelKey],
      value: 0,
    }));
  }
  return items.map((item) => ({
    [labelKey]: item[labelKey],
    value: Math.round(((item.count ?? item.value ?? 0) / total) * 100),
  }));
}

function mapIntelligenceCards(items = []) {
  const icons = ["Flame", "AlertTriangle", "Star", "Globe"];
  return items.map((item, i) => ({
    id: item.id ?? i,
    icon: item.icon ?? icons[i % icons.length],
    title: item.title ?? "Intelligence Update",
    description: item.description ?? item.message ?? "",
    time: item.time ?? "Recently",
    severity: String(item.severity ?? "info").toLowerCase(),
  }));
}

// ---------------------------------------------------------------------------
// GET /api/intelligence/overview
// ---------------------------------------------------------------------------
export async function getDashboardData() {
  return withFallback(
    async () => {
      const data = await safeFetch(`${BASE_URL}/intelligence/overview`);

      return {
        kpis: data.kpis?.length
          ? data.kpis
          : [
              {
                id: "total-posts",
                label: "Total Posts",
                value: String(data.summary?.total_posts ?? 0),
                icon: "MessageSquare",
              },
              {
                id: "positive",
                label: "Positive Posts",
                value: String(data.summary?.positive ?? 0),
                trend: "up",
                icon: "Smile",
              },
              {
                id: "negative",
                label: "Negative Posts",
                value: String(data.summary?.negative ?? 0),
                trend: "down",
                icon: "Frown",
              },
              {
                id: "neutral",
                label: "Neutral Posts",
                value: String(data.summary?.neutral ?? 0),
                icon: "Minus",
              },
            ],
        sentimentTimeline: data.sentimentTimeline ?? [],
        trendingTopics: (data.trendingTopics ?? []).map((t, index) => ({
          rank: t.rank ?? index + 1,
          topic: t.topic,
          category: t.category ?? "Uncategorized",
          growth:
            typeof t.growth === "number"
              ? `${t.growth >= 0 ? "+" : ""}${t.growth}%`
              : t.growth ?? "+0%",
          mentions: t.count ?? t.mentions ?? 0,
          sentiment: t.sentiment ?? "neutral",
        })),
        topicCategories: data.topicCategories?.categories ?? [],
        platformDistribution: data.platformDistribution ?? [],
        emotionDistribution: (data.emotionDistribution ?? []).map((e) => ({
          name: e.name ?? e.emotion,
          value: e.value ?? e.count ?? 0,
        })),
        latestIntelligence: mapIntelligenceCards(data.latestIntelligence),
      };
    },
    () =>
      mockDelay({
        kpis: mock.kpiData,
        sentimentTimeline: mock.sentimentTimeline,
        trendingTopics: mock.trendingTopics,
        topicCategories: [
          { category: "Technology & Innovation", value: 42, count: 3856, color: "#22d3ee", topics: ["AI", "Technology", "Cybersecurity"] },
          { category: "Society & Education", value: 18, count: 1650, color: "#3b82f6", topics: ["Education"] },
          { category: "Environment & Policy", value: 8, count: 734, color: "#22c55e", topics: ["Climate"] },
          { category: "Uncategorized", value: 32, count: 2934, color: "#5b6579", topics: [] },
        ],
        platformDistribution: mock.platformDistribution,
        emotionDistribution: mock.emotionDistribution.map((e) => ({
          name: e.emotion,
          value: e.value,
        })),
        latestIntelligence: mock.latestIntelligence,
      })
  );
}

// ---------------------------------------------------------------------------
// GET /api/sentiment
// ---------------------------------------------------------------------------
export async function getSentimentData() {
  return withFallback(
    async () => {
      const [summary, timeline, emotions, byTopic] = await Promise.all([
        safeFetch(`${BASE_URL}/analytics/sentiment`),
        safeFetch(`${BASE_URL}/analytics/sentiment/timeline`),
        safeFetch(`${BASE_URL}/analytics/emotions`),
        safeFetch(`${BASE_URL}/analytics/sentiment/by-topic`),
      ]);

      const dominantEmotion =
        emotions.length > 0
          ? emotions.reduce((best, current) =>
              (current.count ?? 0) > (best.count ?? 0) ? current : best
            ).emotion
          : "neutral";

      return {
        summary: {
          positive: summary.percentages?.positive ?? 0,
          negative: summary.percentages?.negative ?? 0,
          neutral: summary.percentages?.neutral ?? 0,
          dominantEmotion,
        },
        timeline: timeline.map((item) => ({
          date: item.date ?? item.time,
          positive: item.positive ?? 0,
          negative: item.negative ?? 0,
          neutral: item.neutral ?? 0,
        })),
        emotions: emotions.map((item) => ({
          emotion: item.emotion,
          value: item.count ?? item.value ?? 0,
        })),
        byTopic: byTopic.length ? byTopic : mock.sentimentByTopic,
        shiftAlert: byTopic.length
          ? (() => {
              const worst = [...byTopic].sort((a, b) => b.negative - a.negative)[0];
              return {
                topic: worst.topic,
                previous: Math.max(0, worst.negative - 15),
                current: worst.negative,
                change: 15,
                window: "last 24 hours",
              };
            })()
          : mock.sentimentShiftAlert,
      };
    },
    () =>
      mockDelay({
        summary: mock.sentimentSummary,
        timeline: mock.sentimentTimeline.map((item) => ({
          date: item.time,
          positive: item.positive,
          negative: item.negative,
          neutral: item.neutral,
        })),
        emotions: mock.emotionBreakdown,
        byTopic: mock.sentimentByTopic,
        shiftAlert: mock.sentimentShiftAlert,
      })
  );
}

// ---------------------------------------------------------------------------
// GET /api/audience
// ---------------------------------------------------------------------------
export async function getAudienceData() {
  return withFallback(
    async () => {
      const [interests, languages, locations] = await Promise.all([
        safeFetch(`${BASE_URL}/analytics/demographics/interests`),
        safeFetch(`${BASE_URL}/analytics/demographics/languages`),
        safeFetch(`${BASE_URL}/analytics/demographics/locations`),
      ]);

      return {
        ageDistribution: mock.ageDistribution,
        locationDistribution: toPercentDistribution(
          locations.filter((l) => l.location),
          "location"
        ),
        languageDistribution: toPercentDistribution(languages, "language"),
        interestDistribution: toPercentDistribution(interests, "interest"),
        activeHoursHeatmap: mock.activeHoursHeatmap,
      };
    },
    () =>
      mockDelay({
        ageDistribution: mock.ageDistribution,
        locationDistribution: mock.locationDistribution,
        languageDistribution: mock.languageDistribution,
        interestDistribution: mock.interestDistribution,
        activeHoursHeatmap: mock.activeHoursHeatmap,
      })
  );
}

// ---------------------------------------------------------------------------
// GET /api/trends
// ---------------------------------------------------------------------------
export async function getTrendData() {
  return withFallback(
    async () => {
      const [trends, apiDetails, topicCats, velocitySeries] = await Promise.all([
        safeFetch(`${BASE_URL}/analytics/trends`),
        safeFetch(`${BASE_URL}/analytics/trends/details`),
        safeFetch(`${BASE_URL}/analytics/topics/categories`),
        safeFetch(`${BASE_URL}/analytics/trends/velocity`),
      ]);

      const active = trends.filter((t) => t.trend_status !== "falling").length;
      const emerging = trends.filter((t) => t.trend_status === "rising").length;
      const viral = trends.filter((t) => t.trend_score >= 100).length;
      const declining = trends.filter((t) => t.trend_status === "falling").length;

      const catMap = {};
      (topicCats?.topics ?? []).forEach((t) => {
        catMap[t.topic] = t.category;
      });

      const leaderboard = trends.map((trend, index) => {
        let status = "Steady";
        if (trend.trend_status === "rising") status = "Rising";
        if (trend.trend_status === "falling") status = "Declining";

        return {
          rank: index + 1,
          topic: trend.topic,
          category: catMap[trend.topic] ?? "Uncategorized",
          growth: `${trend.growth_rate >= 0 ? "+" : ""}${trend.growth_rate}%`,
          velocity:
            trend.growth_rate >= 200
              ? "Very High"
              : trend.growth_rate >= 100
              ? "High"
              : trend.growth_rate >= 50
              ? "Medium"
              : "Low",
          engagement: `${(trend.current_count / 1000).toFixed(1)}K`,
          platforms: [],
sentiment: "unknown",
          status,
        };
      });

      const details =
  apiDetails && Object.keys(apiDetails).length
    ? apiDetails
    : {};


     return {
  stats: { active, emerging, viral, declining },
  leaderboard,
  velocitySeries: velocitySeries ?? [],
  details,
  topicCategories: topicCats?.categories ?? [],
};
    },
    () =>
      mockDelay({
        stats: mock.trendStats,
        leaderboard: mock.trendLeaderboard,
        velocitySeries: mock.trendVelocitySeries,
        details: mock.trendDetails,
        topicCategories: [
          { category: "Technology & Innovation", value: 42, count: 3856, color: "#22d3ee", topics: ["AI", "Technology"] },
          { category: "Society & Education", value: 18, count: 1650, color: "#3b82f6", topics: ["Education"] },
        ],
      })
  );
}

// ---------------------------------------------------------------------------
// GET /api/network
// ---------------------------------------------------------------------------
export async function getNetworkData() {
  return withFallback(
    async () => {
      const data = await safeFetch(`${BASE_URL}/analytics/network`);

      const nodes = (data.nodes ?? []).map((node, i) => ({
        ...node,
        group: node.group ?? (i % 4) + 1,
        followers:
          typeof node.followers === "number"
            ? node.followers >= 1000
              ? `${(node.followers / 1000).toFixed(1)}K`
              : String(node.followers)
            : node.followers,
        topics: node.topics?.length ? node.topics : ["Social Media"],
        sentiment: node.sentiment || 65,
        community: node.community ?? "General",
        engagement:
          typeof node.engagement === "number" ? `${node.engagement}%` : node.engagement,
      }));

      if (!nodes.length) throw new Error("No network data");

      return {
        nodes,
        links: data.links ?? [],
        leaderboard: (data.leaderboard ?? []).map((row) => ({
          ...row,
          user: row.user?.startsWith("@") ? row.user : `@${row.user}`,
          reach:
            typeof row.reach === "number"
              ? row.reach >= 1000
                ? `${(row.reach / 1000).toFixed(0)}K`
                : String(row.reach)
              : row.reach,
        })),
      };
    },
    () =>
      mockDelay({
        nodes: mock.networkNodes,
        links: mock.networkLinks,
        leaderboard: mock.influenceLeaderboard,
      })
  );
}

// ---------------------------------------------------------------------------
// GET /api/timeline
// ---------------------------------------------------------------------------
export async function getTimelineData() {
  return withFallback(
    async () => {
      const data = await safeFetch(`${BASE_URL}/analytics/timeline`);
      if (!data.events?.length) throw new Error("No timeline events");
      return data;
    },
    () => mockDelay({ events: mock.timelineEvents })
  );
}

// ---------------------------------------------------------------------------
// GET /api/alerts
// ---------------------------------------------------------------------------
export async function getAlertsData() {
  return withFallback(
    async () => {
      const alerts = await safeFetch(`${BASE_URL}/analytics/alerts`);
      return {
        alerts: alerts.map((alert) => ({
          id: alert.id,
          time: alert.created_at
            ? new Date(alert.created_at).toLocaleString("en-IN")
            : "Recently",
          description: alert.message ?? alert.description,
          topic: alert.topic ?? "General",
          severity:
            alert.severity?.toLowerCase() === "high"
              ? "critical"
              : alert.severity?.toLowerCase() ?? "warning",
          resolved: alert.resolved ?? false,
        })),
      };
    },
    () => mockDelay({ alerts: mock.alertsData })
  );
}

// ---------------------------------------------------------------------------
// GET /api/sources
// ---------------------------------------------------------------------------
export async function getDataSources() {
  return withFallback(
    async () => {
      const data = await safeFetch(`${BASE_URL}/analytics/sources`);
      if (!data.sources?.length) throw new Error("No data sources");
      return {
        sources: data.sources.map((source) => ({
          ...source,
          posts:
            typeof source.posts === "number"
              ? source.posts.toLocaleString("en-IN")
              : source.posts,
          apiStatus: source.apiStatus ?? "Healthy",
        })),
      };
    },
    () => mockDelay({ sources: mock.dataSources })
  );
}

// ---------------------------------------------------------------------------
// POST /api/ai/query
// ---------------------------------------------------------------------------
export async function askAIAnalyst(question) {
  return withFallback(
    async () => safeFetch(`${BASE_URL}/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }),
    async () => {
      await mockDelay(null, 700);
      const q = question.toLowerCase();
      const match = mock.aiMockResponses.find((entry) =>
        entry.keywords.some((kw) => q.includes(kw))
      );
      return {
        answer:
          match?.response ??
          "Based on current intelligence, sentiment is net positive with strong engagement around AI and technology topics. Try asking about trends, sentiment, influencers, or audience segments.",
      };
    }
  );
}

// ---------------------------------------------------------------------------
// POST /api/ai/brief
// ---------------------------------------------------------------------------
export async function generateIntelligenceBrief() {
  return withFallback(
    async () =>
      safeFetch(`${BASE_URL}/ai/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    () => mockDelay(mock.intelligenceBrief, 900)
  );
}


// ---------------------------------------------------------------------------
// GET /api/topics/search?q=AI
// ---------------------------------------------------------------------------
export async function searchTopics(query) {
  const q = String(query ?? "").trim();

  if (!q) return [];

  return safeFetch(
    `${BASE_URL}/topics/search?q=${encodeURIComponent(q)}`
  );
}


// ---------------------------------------------------------------------------
// GET /api/topics/intelligence?topic=AI
// ---------------------------------------------------------------------------
export async function getTopicIntelligence(topic) {
  const value = String(topic ?? "").trim();

  if (!value) {
    return null;
  }

  return safeFetch(
    `${BASE_URL}/topics/intelligence?topic=${encodeURIComponent(value)}`
  );
}
