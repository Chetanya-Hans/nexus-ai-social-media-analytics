import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User, FileText } from "lucide-react";
import { askAIAnalyst, generateIntelligenceBrief } from "../services/api";
import { aiSuggestedQuestions } from "../data/mockData";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Loading from "../components/common/Loading";

export default function AIAnalyst() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm the SentiNex AI Analyst. Ask me about trends, sentiment shifts, influencers, or audience behavior — I'll answer using your live social intelligence data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function sendMessage(text) {
    const question = text.trim();
    if (!question) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setThinking(true);
    const { answer } = await askAIAnalyst(question);
    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    setThinking(false);
  }

  async function handleGenerateBrief() {
    setBriefOpen(true);
    setBriefLoading(true);
    const result = await generateIntelligenceBrief();
    setBrief(result);
    setBriefLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      <div className="animate-fadeIn flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">AI Analyst</h1>
          <p className="text-sm text-ink-secondary mt-1">Ask questions about your audience and social conversations.</p>
        </div>
        <Button onClick={handleGenerateBrief} className="shrink-0">
          <Sparkles className="w-4 h-4" /> Generate Intelligence Brief
        </Button>
      </div>

      {/* Chat window */}
      <div className="panel flex flex-col flex-1 min-h-[440px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} text={m.text} />
          ))}
          {thinking && <ChatBubble role="assistant" text="Analyzing live signals..." isTyping />}
        </div>

        {/* Suggested questions */}
        <div className="px-4 sm:px-6 pt-2 flex gap-2 flex-wrap border-t border-base-border/60 pb-3">
          {aiSuggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-base-border text-ink-secondary hover:border-accent-cyan/40 hover:text-ink-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 p-4 border-t border-base-border"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI Analyst anything about your data..."
            className="flex-1 bg-base-surface2 border border-base-border rounded-lg px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent-cyan/50"
            aria-label="Ask the AI Analyst"
          />
          <Button type="submit" disabled={!input.trim()} aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Intelligence brief modal */}
      <Modal open={briefOpen} onClose={() => setBriefOpen(false)} title="Intelligence Brief">
        {briefLoading && <Loading label="Compiling intelligence brief..." />}
        {!briefLoading && brief && (
          <div className="space-y-4 text-sm">
            <BriefSection icon={FileText} title="Executive Summary" text={brief.executiveSummary} />
            <div>
              <p className="label-eyebrow mb-2">Top Trends</p>
              <ul className="space-y-1.5">
                {brief.topTrends.map((t) => (
                  <li key={t.rank} className="flex justify-between text-ink-secondary">
                    <span>{t.rank}. {t.topic}</span>
                    <span className="font-mono text-sentiment-positive">{t.growth}</span>
                  </li>
                ))}
              </ul>
            </div>
            <BriefSection title="Sentiment Changes" text={brief.sentimentChanges} />
            <BriefSection title="Audience Insights" text={brief.audienceInsights} />
            <BriefSection title="Influence Analysis" text={brief.influenceAnalysis} />
            <div>
              <p className="label-eyebrow mb-2">Recommended Actions</p>
              <ul className="list-disc list-inside space-y-1.5 text-ink-secondary">
                {brief.recommendedActions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ChatBubble({ role, text, isTyping }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-accent-blue/20 text-accent-blue" : "bg-accent-cyan/10 text-accent-cyan"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-accent-blue/15 text-ink-primary" : "bg-base-surface2 text-ink-secondary"
        } ${isTyping ? "animate-pulseSoft" : ""}`}
      >
        {text}
      </div>
    </div>
  );
}

function BriefSection({ icon: Icon, title, text }) {
  return (
    <div>
      <p className="label-eyebrow mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {title}
      </p>
      <p className="text-ink-secondary leading-relaxed">{text}</p>
    </div>
  );
}
