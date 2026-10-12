"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getInvestorPortfolio } from "@/lib/investor/api";
import { getPortfolioMetrics, type InvestorParcel } from "@/lib/investor/parcels";
const PortfolioContext = createContext<{
  parcels: InvestorParcel[];
  loading: boolean;
  error: string;
  retry: () => void;
}>({
  parcels: [], loading: true, error: "", retry: () => {}
});
export function usePortfolio() {
  const state = useContext(PortfolioContext);
  const { parcels } = state;
  return {
    ...state,
    portfolioMetrics: getPortfolioMetrics(parcels)
  };
}
export function PortfolioProvider({
  children
}: {
  children: ReactNode;
}) {
  const [parcels, setParcels] = useState<InvestorParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setLoading(true);
    setError("");
    setAttempt(value => value + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    getInvestorPortfolio(controller.signal).then(data => {
      if (!controller.signal.aborted) setParcels(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Couldn’t load the opportunities.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);
  return <PortfolioContext.Provider value={{
    parcels, loading, error, retry
  }}>
    {children}
  </PortfolioContext.Provider>;
}
