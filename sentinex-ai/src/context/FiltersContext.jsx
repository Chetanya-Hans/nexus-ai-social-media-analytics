import { createContext, useContext, useState } from "react";
import { platformOptions, dateRangeOptions } from "../data/mockData";

// A very small global state used only for the top navbar filters
// (platform + date range + selected project). Kept simple with plain
// React Context - no external state library needed.
const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [dateRange, setDateRange] = useState(dateRangeOptions[2]); // "Last 24 hours"
  const [project, setProject] = useState("Social Media Analytics \u2014 NTRO SIH");

  const value = { platform, setPlatform, dateRange, setDateRange, project, setProject };
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
}
