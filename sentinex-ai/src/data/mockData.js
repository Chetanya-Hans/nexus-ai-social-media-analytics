// =====================================================================================
// mockData.js
// -------------------------------------------------------------------------------------
// ALL fake/sample data for SentiNex AI lives in this single file.
// When the real FastAPI backend is ready, the functions in `src/services/api.js`
// will stop returning this data and will instead `fetch()` it from the backend.
// Nothing in the components needs to change - they only ever talk to `api.js`.
// =====================================================================================

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Generates a time-series array. `points` = number of samples, `stepMinutes` = gap.
function buildTimeSeries(points, stepMinutes, generator) {
  const now = new Date();
  const series = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * stepMinutes * 60000);
    const label = t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    series.push({ time: label, ...generator(points - i, i) });
  }
  return series;
}

// ---------------------------------------------------------------------------
// 1. OVERVIEW DASHBOARD
// ---------------------------------------------------------------------------

export const kpiData = [
  { id: "posts", label: "Total Posts", value: "128,542", change: "+18.4%", trend: "up", icon: "MessageSquare" },
  { id: "users", label: "Active Users", value: "34,821", change: "+12.7%", trend: "up", icon: "Users" },
  { id: "trends", label: "Trending Topics", value: "24", change: "+6", trend: "up", icon: "TrendingUp" },
  { id: "sentiment", label: "Average Sentiment", value: "68% Positive", change: "+4.2%", trend: "up", icon: "Smile" },
  { id: "nodes", label: "Influential Nodes", value: "187", change: "+9", trend: "up", icon: "Share2" },
  { id: "engagement", label: "Engagement Rate", value: "8.42%", change: "+15.8%", trend: "up", icon: "Activity" },
];

export const sentimentTimeline = buildTimeSeries(24, 60, (i) => {
  const base = 50 + Math.sin(i / 3) * 15;
  return {
    positive: Math.round(base + 10 + Math.random() * 5),
    negative: Math.round(35 - Math.sin(i / 4) * 10 + Math.random() * 5),
    neutral: Math.round(20 + Math.cos(i / 5) * 5),
  };
});

export const trendingTopics = [
  { rank: 1, topic: "AI Phone Update", growth: "+312%", mentions: 24821, sentiment: "positive" },
  { rank: 2, topic: "Battery Drain", growth: "+241%", mentions: 18234, sentiment: "negative" },
  { rank: 3, topic: "Camera Quality", growth: "+187%", mentions: 14092, sentiment: "positive" },
  { rank: 4, topic: "Pricing Discussion", growth: "+145%", mentions: 11284, sentiment: "neutral" },
  { rank: 5, topic: "Software Update", growth: "+121%", mentions: 9820, sentiment: "positive" },
];

export const platformDistribution = [
  { name: "X", value: 42, color: "#22d3ee" },
  { name: "Telegram", value: 26, color: "#3b82f6" },
  { name: "Reddit", value: 18, color: "#a855f7" },
  { name: "YouTube", value: 14, color: "#22c55e" },
];

export const emotionDistribution = [
  { emotion: "Excitement", value: 78 },
  { emotion: "Anger", value: 42 },
  { emotion: "Anxiety", value: 35 },
  { emotion: "Joy", value: 64 },
  { emotion: "Sadness", value: 21 },
  { emotion: "Neutral", value: 55 },
];

export const latestIntelligence = [
  {
    id: 1,
    icon: "Flame",
    title: "Emerging Trend",
    description: "\"AI Phone Update\" mentions surged 312% in the last 6 hours across X and Telegram.",
    time: "4 min ago",
    severity: "info",
  },
  {
    id: 2,
    icon: "AlertTriangle",
    title: "Sentiment Shift",
    description: "Negative sentiment around battery performance increased by 38% in 3 hours.",
    time: "12 min ago",
    severity: "warning",
  },
  {
    id: 3,
    icon: "Star",
    title: "Influencer Detected",
    description: "@TechExplorer (124K followers) shared the trending topic, reaching 890K impressions.",
    time: "25 min ago",
    severity: "info",
  },
  {
    id: 4,
    icon: "Globe",
    title: "Cross-community Spread",
    description: "Conversation has spread from Tech clusters into 3 new regional communities.",
    time: "41 min ago",
    severity: "critical",
  },
];

// ---------------------------------------------------------------------------
// 2. SENTIMENT INTELLIGENCE
// ---------------------------------------------------------------------------

export const sentimentSummary = {
  positive: 68,
  negative: 22,
  neutral: 10,
  dominantEmotion: "Excitement",
};

export const emotionBreakdown = [
  { emotion: "Excitement", value: 82 },
  { emotion: "Anger", value: 48 },
  { emotion: "Anxiety", value: 39 },
  { emotion: "Joy", value: 71 },
  { emotion: "Sadness", value: 24 },
  { emotion: "Fear", value: 18 },
  { emotion: "Sarcasm", value: 33 },
];

export const sentimentByTopic = [
  { topic: "AI Update", positive: 72, negative: 18, neutral: 10, totalPosts: 12421 },
  { topic: "Battery", positive: 21, negative: 68, neutral: 11, totalPosts: 8421 },
  { topic: "Camera", positive: 61, negative: 25, neutral: 14, totalPosts: 6982 },
  { topic: "Pricing", positive: 38, negative: 41, neutral: 21, totalPosts: 5210 },
  { topic: "Software Update", positive: 66, negative: 20, neutral: 14, totalPosts: 4890 },
];

export const sentimentShiftAlert = {
  topic: "Battery Performance",
  previous: 31,
  current: 69,
  change: 38,
  window: "last 3 hours",
};

// ---------------------------------------------------------------------------
// 3. AUDIENCE INTELLIGENCE
// (Framed as an ESTIMATED aggregate profile - not exact fact)
// ---------------------------------------------------------------------------

export const ageDistribution = [
  { group: "18\u201324", value: 46 },
  { group: "25\u201334", value: 32 },
  { group: "35\u201344", value: 15 },
  { group: "45+", value: 7 },
];

export const locationDistribution = [
  { region: "Delhi NCR", value: 31 },
  { region: "Mumbai", value: 14 },
  { region: "Bangalore", value: 12 },
  { region: "Pune", value: 8 },
  { region: "Other", value: 35 },
];

export const languageDistribution = [
  { language: "Hindi", value: 38 },
  { language: "English", value: 34 },
  { language: "Hinglish", value: 21 },
  { language: "Other", value: 7 },
];

export const interestDistribution = [
  { interest: "Technology", value: 84 },
  { interest: "AI", value: 76 },
  { interest: "Automobile", value: 58 },
  { interest: "Gaming", value: 51 },
  { interest: "Entertainment", value: 47 },
  { interest: "Education", value: 39 },
  { interest: "Sports", value: 28 },
];

// 24-hour activity heatmap - value = relative activity intensity (0-100)
export const activeHoursHeatmap = Array.from({ length: 24 }, (_, hour) => {
  // Simulate two peaks: morning ~10am and evening ~9pm
  const morningPeak = Math.exp(-Math.pow(hour - 10, 2) / 8) * 100;
  const eveningPeak = Math.exp(-Math.pow(hour - 21, 2) / 10) * 100;
  return { hour, value: Math.round(Math.max(morningPeak, eveningPeak, 8)) };
});

// ---------------------------------------------------------------------------
// 4. TREND INTELLIGENCE
// ---------------------------------------------------------------------------

export const trendStats = {
  active: 24,
  emerging: 8,
  viral: 5,
  declining: 11,
};

export const trendLeaderboard = [
  { rank: 1, topic: "AI Phone Update", growth: "+312%", velocity: "Very High", engagement: "8.4K", platforms: ["X", "Telegram"], sentiment: "positive", status: "Rising" },
  { rank: 2, topic: "Battery Issue", growth: "+241%", velocity: "High", engagement: "6.2K", platforms: ["X", "Reddit"], sentiment: "negative", status: "Critical" },
  { rank: 3, topic: "Camera Quality", growth: "+187%", velocity: "High", engagement: "5.1K", platforms: ["YouTube", "X"], sentiment: "positive", status: "Rising" },
  { rank: 4, topic: "Pricing Discussion", growth: "+145%", velocity: "Medium", engagement: "3.9K", platforms: ["Reddit", "Telegram"], sentiment: "neutral", status: "Steady" },
  { rank: 5, topic: "Software Update", growth: "+121%", velocity: "Medium", engagement: "3.2K", platforms: ["X", "YouTube"], sentiment: "positive", status: "Rising" },
  { rank: 6, topic: "Delivery Delay", growth: "-18%", velocity: "Low", engagement: "1.1K", platforms: ["Reddit"], sentiment: "negative", status: "Declining" },
];

export const trendVelocitySeries = buildTimeSeries(12, 60, (i) => ({
  "AI Phone Update": Math.round(20 + i * 6 + Math.random() * 8),
  "Battery Issue": Math.round(15 + i * 4 + Math.random() * 6),
  "Camera Quality": Math.round(10 + i * 3 + Math.random() * 5),
}));

export const trendDetails = {
  "AI Phone Update": {
    growth: "+312%",
    mentionVolume: "24,821",
    velocity: "Very High",
    platforms: ["X", "Telegram", "Reddit"],
    sentiment: { positive: 61, negative: 29, neutral: 10 },
    keywords: ["AI", "update", "phone", "battery", "performance"],
    communities: ["Tech Enthusiasts India", "Gadget Reviewers", "AI Builders"],
    influencers: ["@TechExplorer", "@GadgetGuru", "@AIWithRaj"],
    prediction: "+42% expected growth in the next 6 hours",
  },
};

// ---------------------------------------------------------------------------
// 5. NETWORK & INFLUENCE
// ---------------------------------------------------------------------------

// Simple synthetic social graph. `group` = community id used for node color.
export const networkNodes = [
  { id: "TechExplorer", influence: 0.87, followers: "124K", connections: 4820, engagement: "8.4%", group: 1, topics: ["AI", "Technology", "Automobile"], sentiment: 72, community: "Technology Cluster" },
  { id: "GadgetGuru", influence: 0.74, followers: "88K", connections: 3210, engagement: "6.1%", group: 1, topics: ["Gadgets", "Reviews"], sentiment: 65, community: "Technology Cluster" },
  { id: "AIWithRaj", influence: 0.69, followers: "61K", connections: 2650, engagement: "9.2%", group: 1, topics: ["AI", "ML"], sentiment: 80, community: "Technology Cluster" },
  { id: "PoliticalPulse", influence: 0.81, followers: "210K", connections: 6100, engagement: "5.5%", group: 2, topics: ["Politics", "News"], sentiment: 34, community: "News & Politics" },
  { id: "DesiMemes", influence: 0.58, followers: "340K", connections: 5400, engagement: "12.1%", group: 3, topics: ["Entertainment", "Memes"], sentiment: 58, community: "Entertainment" },
  { id: "CricketCentral", influence: 0.63, followers: "180K", connections: 4100, engagement: "7.8%", group: 4, topics: ["Sports", "Cricket"], sentiment: 76, community: "Sports" },
  { id: "user_2231", influence: 0.21, followers: "3.2K", connections: 210, engagement: "3.4%", group: 1, topics: ["AI"], sentiment: 62, community: "Technology Cluster" },
  { id: "user_5510", influence: 0.18, followers: "1.8K", connections: 140, engagement: "2.1%", group: 2, topics: ["Politics"], sentiment: 40, community: "News & Politics" },
  { id: "user_9021", influence: 0.34, followers: "12K", connections: 980, engagement: "5.0%", group: 3, topics: ["Entertainment"], sentiment: 55, community: "Entertainment" },
  { id: "user_1187", influence: 0.29, followers: "8.4K", connections: 640, engagement: "4.2%", group: 4, topics: ["Sports"], sentiment: 70, community: "Sports" },
  { id: "user_4432", influence: 0.15, followers: "900", connections: 80, engagement: "1.9%", group: 1, topics: ["AI"], sentiment: 58, community: "Technology Cluster" },
  { id: "user_7765", influence: 0.24, followers: "5.1K", connections: 320, engagement: "3.8%", group: 2, topics: ["Politics"], sentiment: 30, community: "News & Politics" },
];

export const networkLinks = [
  { source: "TechExplorer", target: "GadgetGuru", type: "mentions" },
  { source: "TechExplorer", target: "AIWithRaj", type: "shares" },
  { source: "TechExplorer", target: "user_2231", type: "replies" },
  { source: "GadgetGuru", target: "user_4432", type: "mentions" },
  { source: "AIWithRaj", target: "user_2231", type: "replies" },
  { source: "PoliticalPulse", target: "user_5510", type: "shares" },
  { source: "PoliticalPulse", target: "user_7765", type: "mentions" },
  { source: "DesiMemes", target: "user_9021", type: "forwards" },
  { source: "DesiMemes", target: "TechExplorer", type: "shares" },
  { source: "CricketCentral", target: "user_1187", type: "replies" },
  { source: "CricketCentral", target: "DesiMemes", type: "mentions" },
  { source: "user_9021", target: "user_7765", type: "shares" },
];

export const influenceLeaderboard = networkNodes
  .slice()
  .sort((a, b) => b.influence - a.influence)
  .map((n, i) => ({
    rank: i + 1,
    user: `@${n.id}`,
    influenceScore: n.influence,
    reach: n.followers,
    engagement: n.engagement,
    community: n.community,
  }));

// ---------------------------------------------------------------------------
// 6. TIMELINE EXPLORER
// ---------------------------------------------------------------------------

export const timelineEvents = [
  { id: 1, time: "10:00", type: "post", title: "Initial discussion", description: "First posts appear discussing the new AI phone launch.", },
  { id: 2, time: "10:24", type: "spike", title: "First spike", description: "Mention volume jumps 4x within 24 minutes as early reviewers post reactions." },
  { id: 3, time: "10:41", type: "influencer", title: "Influencer shares", description: "@TechExplorer shares the topic to 124K followers, amplifying reach significantly." },
  { id: 4, time: "11:05", type: "sentiment", title: "Sentiment changes", description: "Sentiment shifts negative as battery drain complaints begin trending." },
  { id: 5, time: "11:32", type: "trend", title: "Trend detected", description: "AI system flags \"AI Phone Update\" as an emerging trend with Very High velocity." },
  { id: 6, time: "12:10", type: "spread", title: "Cross-community spread", description: "Conversation spreads from Tech clusters into regional and entertainment communities." },
  { id: 7, time: "12:45", type: "alert", title: "Critical alert raised", description: "Negative sentiment spike triggers an automated critical alert for the brand team." },
];

// ---------------------------------------------------------------------------
// 7. AI ANALYST
// ---------------------------------------------------------------------------

export const aiSuggestedQuestions = [
  "What is trending right now?",
  "Why did negative sentiment increase?",
  "Who is driving this trend?",
  "Which audience segment is most engaged?",
  "How is this trend spreading?",
  "Summarize today's social conversation.",
];

// Simple keyword -> canned response map used by the mock AI service.
export const aiMockResponses = [
  {
    keywords: ["trending", "trend"],
    response:
      "\"AI Phone Update\" is currently the fastest-growing narrative, with a 312% increase in mentions over the last 6 hours. Negative sentiment is concentrated around battery performance, while positive sentiment is primarily associated with camera improvements.",
  },
  {
    keywords: ["negative", "sentiment increase", "why did"],
    response:
      "Negative sentiment increased by 38% in the last 3 hours, driven mainly by complaints about battery drain after the latest software update. The spike is concentrated on X and Reddit, with lower intensity on Telegram.",
  },
  {
    keywords: ["driving", "who is"],
    response:
      "The conversation is primarily being driven by @TechExplorer, @GadgetGuru and @AIWithRaj, three tech-cluster accounts with a combined reach of over 270K. @TechExplorer's share at 10:41 caused the largest single spike in volume.",
  },
  {
    keywords: ["audience segment", "most engaged"],
    response:
      "The 18\u201324 age group is the most engaged audience segment, generating 46% of total conversation volume with an average engagement rate of 9.1%, notably higher than the platform average of 8.42%.",
  },
  {
    keywords: ["spreading", "spread"],
    response:
      "The trend originated in Technology clusters and has spread into Entertainment and Regional-language communities over the past 2 hours, indicating cross-community narrative diffusion typical of viral tech stories.",
  },
  {
    keywords: ["summarize", "summary"],
    response:
      "Today's conversation is dominated by the AI Phone Update launch (+312% mentions). Overall sentiment is 68% positive. Camera quality is praised while battery performance is the main criticism. Five trends are currently viral, with cross-platform spread into 3 new communities.",
  },
];

export const intelligenceBrief = {
  executiveSummary:
    "Overall social sentiment remains net positive (68%) driven by the AI Phone Update launch, though a fast-growing negative narrative around battery performance requires monitoring.",
  topTrends: trendingTopics.slice(0, 3),
  sentimentChanges: "Negative sentiment on battery performance rose 38% in 3 hours.",
  audienceInsights: "18\u201324 age group leads engagement; Delhi NCR is the top contributing region.",
  influenceAnalysis: "@TechExplorer remains the top amplifier with an influence score of 0.87.",
  recommendedActions: [
    "Issue a public statement addressing battery performance concerns.",
    "Engage top positive-sentiment influencers to amplify camera-quality praise.",
    "Monitor cross-community spread into regional-language clusters over next 6 hours.",
  ],
};

// ---------------------------------------------------------------------------
// 8. DATA SOURCES
// ---------------------------------------------------------------------------

export const dataSources = [
  { platform: "X", status: "connected", posts: "52,412", lastSync: "8 seconds ago", apiStatus: "Healthy" },
  { platform: "Telegram", status: "connected", posts: "42,812", lastSync: "12 seconds ago", apiStatus: "Healthy" },
  { platform: "Reddit", status: "connected", posts: "21,904", lastSync: "34 seconds ago", apiStatus: "Healthy" },
  { platform: "YouTube", status: "connected", posts: "11,416", lastSync: "1 minute ago", apiStatus: "Healthy" },
  { platform: "Instagram", status: "available", posts: "0", lastSync: "\u2014", apiStatus: "Not configured" },
  { platform: "Facebook", status: "available", posts: "0", lastSync: "\u2014", apiStatus: "Not configured" },
];

// ---------------------------------------------------------------------------
// 9. ALERTS
// ---------------------------------------------------------------------------

export const alertsData = [
  { id: 1, severity: "critical", time: "4 min ago", description: "Negative sentiment spike detected on \"Battery Issue\".", topic: "Battery Issue", resolved: false },
  { id: 2, severity: "warning", time: "18 min ago", description: "New viral trend detected: \"AI Phone Update\".", topic: "AI Phone Update", resolved: false },
  { id: 3, severity: "info", time: "35 min ago", description: "Influencer activity increased around Technology Cluster.", topic: "Technology Cluster", resolved: false },
  { id: 4, severity: "warning", time: "52 min ago", description: "Cross-community spread detected into Entertainment cluster.", topic: "AI Phone Update", resolved: false },
  { id: 5, severity: "info", time: "2 hours ago", description: "Daily ingestion pipeline completed successfully.", topic: "System", resolved: true },
  { id: 6, severity: "critical", time: "3 hours ago", description: "API rate limit reached for X ingestion.", topic: "System", resolved: true },
];

// ---------------------------------------------------------------------------
// Misc / global filters used across pages
// ---------------------------------------------------------------------------

export const platformOptions = ["All", "X", "Telegram", "Reddit", "YouTube", "Instagram"];
export const dateRangeOptions = ["Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 7 days", "Last 30 days"];
