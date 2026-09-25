import { useState } from "react";
import { User, Database, Radio, Bot, Bell, Palette, KeyRound } from "lucide-react";
import Button from "../components/common/Button";
import { platformOptions } from "../data/mockData";

// Small reusable toggle switch (no external UI library needed).
function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
        checked ? "bg-accent-cyan" : "bg-base-surface2 border border-base-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-base-bg transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// Wrapper for each settings section - keeps consistent spacing/typography.
function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent-cyan" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-ink-primary">{title}</h3>
          {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-secondary">{label}</span>
      {children}
    </div>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState({ critical: true, warning: true, info: false });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [aiModel, setAiModel] = useState("SentiNex NLP v2 (Sentiment + Emotion)");
  const [defaultPlatform, setDefaultPlatform] = useState(platformOptions[0]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-[28px] font-display font-semibold text-ink-primary">Settings</h1>
        <p className="text-sm text-ink-secondary mt-1">Configure your account, data, and AI preferences.</p>
      </div>

      {/* Profile */}
      <SettingsSection icon={User} title="Profile" description="Your analyst account details.">
        <Row label="Name">
          <input
            defaultValue="SIH Analyst"
            className="bg-base-surface2 border border-base-border rounded-lg px-3 py-1.5 text-sm text-ink-primary w-48 focus:outline-none focus:border-accent-cyan/50"
          />
        </Row>
        <Row label="Email">
          <input
            defaultValue="analyst@sentinex.ai"
            className="bg-base-surface2 border border-base-border rounded-lg px-3 py-1.5 text-sm text-ink-primary w-48 focus:outline-none focus:border-accent-cyan/50"
          />
        </Row>
      </SettingsSection>

      {/* Data preferences */}
      <SettingsSection icon={Database} title="Data Preferences" description="Control how much historical data is analyzed.">
        <Row label="Default platform filter">
          <select
            value={defaultPlatform}
            onChange={(e) => setDefaultPlatform(e.target.value)}
            className="bg-base-surface2 border border-base-border rounded-lg px-3 py-1.5 text-sm text-ink-primary focus:outline-none focus:border-accent-cyan/50"
          >
            {platformOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Row>
        <Row label="Auto-refresh live data">
          <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Auto-refresh live data" />
        </Row>
      </SettingsSection>

      {/* Platform settings */}
      <SettingsSection icon={Radio} title="Platform Settings" description="Manage which platforms feed analysis.">
        <p className="text-sm text-ink-secondary">
          Connect or configure individual platforms from the{" "}
          <a href="/data-sources" className="text-accent-cyan hover:underline">Data Sources</a> page.
        </p>
      </SettingsSection>

      {/* AI model settings */}
      <SettingsSection icon={Bot} title="AI Model Settings" description="Choose the model powering sentiment and trend analysis.">
        <Row label="Active model">
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="bg-base-surface2 border border-base-border rounded-lg px-3 py-1.5 text-sm text-ink-primary focus:outline-none focus:border-accent-cyan/50"
          >
            <option>SentiNex NLP v2 (Sentiment + Emotion)</option>
            <option>SentiNex NLP v1 (Sentiment only)</option>
            <option>Custom fine-tuned model</option>
          </select>
        </Row>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notification Settings" description="Choose which alerts should notify you.">
        <Row label="Critical alerts">
          <Toggle checked={notifications.critical} onChange={(v) => setNotifications((n) => ({ ...n, critical: v }))} label="Critical alerts" />
        </Row>
        <Row label="Warning alerts">
          <Toggle checked={notifications.warning} onChange={(v) => setNotifications((n) => ({ ...n, warning: v }))} label="Warning alerts" />
        </Row>
        <Row label="Informational alerts">
          <Toggle checked={notifications.info} onChange={(v) => setNotifications((n) => ({ ...n, info: v }))} label="Informational alerts" />
        </Row>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection icon={Palette} title="Theme" description="SentiNex AI is optimized for a dark interface.">
        <Row label="Appearance">
          <div className="flex gap-2">
            {["dark", "light"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                disabled={t === "light"}
                className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                  theme === t
                    ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                    : "border-base-border text-ink-secondary disabled:opacity-40"
                }`}
                title={t === "light" ? "Light theme coming soon" : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
      </SettingsSection>

      {/* API configuration placeholder */}
      <SettingsSection icon={KeyRound} title="API Configuration" description="Connect the FastAPI backend once it's deployed.">
        <Row label="Backend base URL">
          <input
            defaultValue="http://localhost:8000/api"
            className="bg-base-surface2 border border-base-border rounded-lg px-3 py-1.5 text-sm text-ink-primary w-56 font-mono focus:outline-none focus:border-accent-cyan/50"
          />
        </Row>
        <p className="text-xs text-ink-muted">
          For security, real API keys should never be stored in the frontend. Configure keys and secrets in your
          FastAPI backend's environment variables instead.
        </p>
      </SettingsSection>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
