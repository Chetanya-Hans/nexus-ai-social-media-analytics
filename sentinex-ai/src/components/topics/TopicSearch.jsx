import { useEffect, useState } from "react";
import { Search, X, ArrowRight, Hash } from "lucide-react";
import { searchTopics } from "../../services/api";

export default function TopicSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await searchTopics(value);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Topic search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const popularTopics = [
    "AI",
    "Politics",
    "Cricket",
    "Climate",
    "Cybersecurity",
    "Bitcoin",
  ];

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-ink-primary">
            Topic Search
          </h3>

          <p className="text-xs text-ink-muted mt-1">
            Explore conversations directly from the dataset
          </p>
        </div>

        {query && (
          <button
            onClick={() => setQuery("")}
            className="p-1.5 rounded-lg hover:bg-base-subtle text-ink-muted"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />

       <input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search AI, Politics, Cricket..."
  className="topic-search-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-base-border bg-base-subtle text-sm outline-none focus:ring-2 focus:ring-cyan-400/30"
  style={{
    color: "#111827",
    caretColor: "#111827",
  }}
/>
      </div>

      {!query && (
        <div className="flex flex-wrap gap-2 mt-3">
          {popularTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setQuery(topic)}
              className="px-3 py-1.5 rounded-full text-xs border border-base-border hover:border-cyan-400/50 hover:bg-cyan-400/5 transition"
            >
              <span className="flex items-center gap-1">
                <Hash size={12} />
                {topic}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-xs text-ink-muted mt-4">
          Searching topics...
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-sm text-ink-muted mt-4">
          No matching topics found in the dataset.
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.topic}
              onClick={() => onSelect?.(item)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-base-border hover:border-cyan-400/50 hover:bg-cyan-400/5 transition text-left"
            >
              <div>
                <div className="text-sm font-medium text-ink-primary">
                  {item.parentTopic}
                  {item.subtopic && (
                    <span className="text-ink-secondary">
                      {" — "}
                      {item.subtopic}
                    </span>
                  )}
                </div>

                <div className="text-xs text-ink-muted mt-0.5">
                  {item.count.toLocaleString("en-IN")} mentions
                </div>
              </div>

              <ArrowRight
                size={16}
                className="text-ink-muted"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}