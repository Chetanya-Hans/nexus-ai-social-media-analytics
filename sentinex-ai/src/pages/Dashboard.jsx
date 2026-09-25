import { useAnalytics } from "../hooks/useAnalytics";
import { getDashboardData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import KPICard from "../components/cards/KPICard";
import TrendCard from "../components/cards/TrendCard";
import IntelligenceCard from "../components/cards/IntelligenceCard";
import SentimentChart from "../components/charts/SentimentChart";
import PlatformChart from "../components/charts/PlatformChart";
import EmotionChart from "../components/charts/EmotionChart";
import TopicCategoryChart from "../components/charts/TopicCategoryChart";
import { useNavigate } from "react-router-dom";
import DemoBanner from "../components/demo/DemoBanner";
import CapabilityGrid from "../components/demo/CapabilityGrid";
import TopicSearch from "../components/topics/TopicSearch";
import TopicIntelligence from "../components/topics/TopicIntelligence";
import { useState } from "react";

export default function Dashboard() {
  const { data, loading, error, reload } = useAnalytics(getDashboardData);
  const [selectedTopic, setSelectedTopic] = useState("");
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Page header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Social Intelligence Overview
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Data-driven audience and narrative intelligence
        </p>
      </div>

      {loading && <Loading label="Loading overview metrics..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          <DemoBanner />
          <CapabilityGrid />

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {data.kpis.map((kpi) => (
              <KPICard key={kpi.id} {...kpi} />
            ))}
          </div>


          {/* Topic Search */}

<TopicSearch
  onSelect={(item) => {
    setSelectedTopic(item.topic);
  }}
/>

<TopicIntelligence
  topic={selectedTopic}
/>

          {/* Main charts grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 panel p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink-primary">Sentiment Timeline</h3>
                <span className="label-eyebrow">All data</span>
              </div>
              <SentimentChart data={data.sentimentTimeline} />
            </div>

            <div className="panel p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-ink-primary">Trending Topics</h3>
                <span className="label-eyebrow">Live</span>
              </div>
              <div className="divide-y divide-base-border">
                {data.trendingTopics.map((t) => (
                  <TrendCard key={t.rank} {...t} onClick={() => navigate("/trends")} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-1">Topic Categories</h3>
              <p className="text-xs text-ink-muted mb-3">How conversations are distributed across narrative themes</p>
              <TopicCategoryChart data={data.topicCategories} />
            </div>
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-4">Platform Distribution</h3>
              <PlatformChart data={data.platformDistribution} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-4">Emotion Distribution</h3>
              <EmotionChart data={data.emotionDistribution} dataKey="name" layout="horizontal" />
            </div>
          </div>

          {/* Latest intelligence */}
          <div>
            <h3 className="font-display font-semibold text-ink-primary mb-4">Latest Intelligence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.latestIntelligence.map((item) => (
                <IntelligenceCard key={item.id} {...item} onViewAnalysis={() => navigate("/trends")} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
