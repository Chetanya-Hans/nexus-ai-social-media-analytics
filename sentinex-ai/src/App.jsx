import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FiltersProvider } from "./context/FiltersContext";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Sentiment from "./pages/Sentiment";
import Audience from "./pages/Audience";
import Trends from "./pages/Trends";
import Network from "./pages/Network";
import Timeline from "./pages/Timeline";
import AIAnalyst from "./pages/AIAnalyst";
import DataSources from "./pages/DataSources";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

// All page routes live here. Every route is wrapped by <Layout /> which
// renders the sidebar + navbar around whichever page is active.
export default function App() {
  return (
    <FiltersProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sentiment" element={<Sentiment />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/network" element={<Network />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/ai-analyst" element={<AIAnalyst />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FiltersProvider>
  );
}
