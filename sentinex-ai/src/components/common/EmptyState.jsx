import { Inbox } from "lucide-react";

// Shown when a request succeeds but returns no data.
export default function EmptyState({ message = "No data available yet.", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-ink-muted">
      <Icon className="w-6 h-6" />
      <p className="text-sm max-w-xs">{message}</p>
    </div>
  );
}
