"use client";

import { useLanguage } from "@/components/shared/language";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Parcel } from "@/features/parcels/types/parcel";
import type { Inquiry } from "@/features/inquiries/types/inquiry";
import { getBusinessData, saveInquiryStatus } from "../lib/api";
import { analyze, insights } from "../lib/analytics";
type Data = {
  parcels: Parcel[];
  inquiries: Inquiry[];
};
type BusinessData = Data & {
  loading: boolean;
  error: string;
  updatedAt: string;
  refresh: () => void;
  updateStatus: (id: string, status: string) => Promise<void>;
  analysis: ReturnType<typeof analyze>;
  observations: ReturnType<typeof insights>;
};
type DetailActions = {
  openParcel: (id: string) => void;
  openInquiry: (id: string) => void;
};
type Selection = {
  parcelId: string | null;
  inquiryId: string | null;
  closeDetail: () => void;
};
const DataContext = createContext<BusinessData | null>(null);
const DetailActionsContext = createContext<DetailActions | null>(null);
const SelectionContext = createContext<Selection | null>(null);
export function useBusiness() {
  const data = useContext(DataContext);
  const actions = useContext(DetailActionsContext);
  if (!data || !actions) throw new Error("Business provider is missing");
  return {
    ...data,
    ...actions
  };
}
export function useDetailSelection() {
  const selection = useContext(SelectionContext);
  if (!selection) throw new Error("Detail selection provider is missing");
  return selection;
}
// Selection is isolated: opening a drawer does not invalidate dashboard/chart consumers.
function DetailProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useLanguage();
  const [parcelId, setParcelId] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const openParcel = useCallback((id: string) => {
    setInquiryId(null);
    setParcelId(id);
  }, []);
  const openInquiry = useCallback((id: string) => {
    setParcelId(null);
    setInquiryId(id);
  }, []);
  const closeDetail = useCallback(() => {
    setParcelId(null);
    setInquiryId(null);
  }, []);
  const actions = useMemo(() => ({
    openParcel,
    openInquiry
  }), [openParcel, openInquiry]);
  const selection = useMemo(() => ({
    parcelId,
    inquiryId,
    closeDetail
  }), [parcelId, inquiryId, closeDetail]);
  return <DetailActionsContext.Provider value={actions}><SelectionContext.Provider value={selection}>{t(children)}</SelectionContext.Provider></DetailActionsContext.Provider>;
}
export function BusinessProvider({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useLanguage();
  const [data, setData] = useState<Data>({
    parcels: [],
    inquiries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [attempt, setAttempt] = useState(0);
  const mutation = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    getBusinessData(controller.signal).then(result => {
      if (!controller.signal.aborted) {
        setData(result);
        setUpdatedAt(new Date().toLocaleTimeString("en-SA", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Riyadh"
        }));
      }
    }).catch(error => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Couldn’t load business data.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);
  const refresh = useCallback(() => {
    setError("");
    setLoading(true);
    setAttempt(value => value + 1);
  }, []);
  const updateStatus = useCallback(async (id: string, status: string) => {
    if (mutation.current) throw new Error("Another status update is in progress.");
    mutation.current = true;
    try {
      const updated = await saveInquiryStatus(id, status);
      setData(prev => ({
        ...prev,
        inquiries: prev.inquiries.map(q => q.inquiry_id === id ? updated : q)
      }));
    } finally {
      mutation.current = false;
    }
  }, []);
  // Compute the portfolio analysis once per dataset update, not once per consumer.
  const analysis = useMemo(() => analyze(data.parcels, data.inquiries), [data.parcels, data.inquiries]);
  const observations = useMemo(() => insights(data.parcels, data.inquiries, analysis), [data.parcels, data.inquiries, analysis]);
  const value = useMemo(() => ({
    ...data,
    loading,
    error,
    updatedAt,
    refresh,
    updateStatus,
    analysis,
    observations
  }), [data, loading, error, updatedAt, refresh, updateStatus, analysis, observations]);
  return <DataContext.Provider value={value}><DetailProvider>{t(children)}</DetailProvider></DataContext.Provider>;
}
export function DataBoundary({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useLanguage();
  const {
    loading,
    error,
    refresh
  } = useBusiness();
  if (loading) return <div className="bi-loading" role="status" aria-label={t("Loading portfolio and investor demand")}><div className="bi-skeleton bi-loading-title" /><div className="bi-stat-grid">{[0, 1, 2, 3].map(i => <div key={i} className="bi-skeleton" style={{
        height: 140
      }} />)}</div><div className="bi-skeleton" style={{
      height: 330,
      marginTop: 24
    }} /></div>;
  if (error) return <div className="bi-empty" role="alert"><h2>{t("Let’s reconnect to the business.")}</h2><p>{t(error)}</p><button className="bi-button" onClick={refresh}>{t("Try again")}</button></div>;
  return children;
}
