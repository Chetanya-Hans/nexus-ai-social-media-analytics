import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { getNetworkData } from "../services/api";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import Badge from "../components/common/Badge";
import NetworkGraph from "../components/network/NetworkGraph";
import { X } from "lucide-react";

const LEGEND = [
  { label: "Technology Cluster", color: "#22d3ee" },
  { label: "News & Politics", color: "#ef4444" },
  { label: "Entertainment", color: "#a855f7" },
  { label: "Sports", color: "#22c55e" },
];

export default function Network() {
  const { data, loading, error, reload } = useAnalytics(getNetworkData);
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">
          Network &amp; Influence
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Discover who influences conversations and how information spreads.
        </p>
      </div>

      {loading && <Loading label="Mapping the influence network..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Graph */}
            <div className="xl:col-span-2 panel p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-display font-semibold text-ink-primary">Interaction Network</h3>
                <div className="flex gap-3 flex-wrap">
                  {LEGEND.map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
              <NetworkGraph
                nodes={data.nodes}
                links={data.links}
                onNodeClick={setSelectedNode}
                selectedId={selectedNode?.id}
              />
              <p className="text-xs text-ink-muted mt-2">
                Drag nodes to rearrange · scroll to zoom · click a node for details · size = influence score
              </p>
            </div>

            {/* Detail panel */}
            <div className="panel p-4 sm:p-5">
              <h3 className="font-display font-semibold text-ink-primary mb-4">Node Details</h3>
              {selectedNode ? (
                <div className="space-y-4 text-sm animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-display font-semibold text-accent-cyan">@{selectedNode.id}</p>
                    <button onClick={() => setSelectedNode(null)} className="text-ink-muted hover:text-ink-primary" aria-label="Clear selection">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Influence Score" value={selectedNode.influence.toFixed(2)} />
                    <Stat label="Followers" value={selectedNode.followers} />
                    <Stat label="Connections" value={selectedNode.connections.toLocaleString("en-IN")} />
                    <Stat label="Engagement" value={selectedNode.engagement} />
                  </div>
                  <div>
                    <p className="label-eyebrow mb-1.5">Primary Topics</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedNode.topics.map((t) => (
                        <Badge key={t} tone="info">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="label-eyebrow mb-1.5">Sentiment</p>
                    <Badge tone="positive">{selectedNode.sentiment}% Positive</Badge>
                  </div>
                  <div>
                    <p className="label-eyebrow mb-1.5">Community</p>
                    <p className="text-ink-primary">{selectedNode.community}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Click a node in the graph to view influencer details here.</p>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="panel p-4 sm:p-5 overflow-x-auto">
            <h3 className="font-display font-semibold text-ink-primary mb-4">Influence Leaderboard</h3>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-ink-muted label-eyebrow border-b border-base-border">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Influence Score</th>
                  <th className="pb-3 font-medium">Reach</th>
                  <th className="pb-3 font-medium">Engagement</th>
                  <th className="pb-3 font-medium">Community</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((row) => (
                  <tr key={row.rank} className="border-b border-base-border/60 last:border-0 hover:bg-base-surface2/60">
                    <td className="py-3 font-mono text-ink-muted">{row.rank}</td>
                    <td className="py-3 text-ink-primary font-medium">{row.user}</td>
                    <td className="py-3 font-mono text-accent-cyan">{row.influenceScore.toFixed(2)}</td>
                    <td className="py-3 text-ink-secondary">{row.reach}</td>
                    <td className="py-3 text-ink-secondary">{row.engagement}</td>
                    <td className="py-3 text-ink-secondary">{row.community}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      <p className="text-ink-primary font-mono">{value}</p>
    </div>
  );
}
