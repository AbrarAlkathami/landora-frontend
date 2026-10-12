"use client";

import { useLanguage } from "@/components/shared/language";
import Link from "next/link";
import { LanguageToggle } from "@/components/shared/language";
import { SarjLogo } from "@/components/shared/sarj-logo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { LayoutDashboard, Map, Users, ChartNoAxesCombined, Lightbulb, ArrowUpRight, RefreshCw, Sparkles, Send, Menu, X, Loader2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BusinessProvider, useBusiness } from "./provider";
import { DetailDrawers } from "./details";
import { adminPrompts } from "../lib/advisor";
import { askAdminAdvisor } from "../lib/api";
import type { ChatResponse } from "@/features/chat/api/chat";
import { title } from "../lib/analytics";
const items = [{
  href: "/admin",
  label: "Overview",
  icon: LayoutDashboard
}, {
  href: "/admin/insights",
  label: "Business insights",
  icon: Lightbulb
}, {
  href: "/admin/demand",
  label: "Demand & inventory",
  icon: ChartNoAxesCombined
}, {
  href: "/admin/parcels",
  label: "Land portfolio",
  icon: Map
}, {
  href: "/admin/inquiries",
  label: "Investor inquiries",
  icon: Users
}];
export function AdminExperience({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useLanguage();
  return <MotionConfig reducedMotion="user">
    <BusinessProvider>
      <AdminShell>
        {t(children)}
      </AdminShell>
    </BusinessProvider>
  </MotionConfig>;
}
function AdminShell({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useLanguage();
  const pathname = usePathname();
  const {
    loading,
    error,
    refresh,
    updatedAt,
    analysis
  } = useBusiness();
  const [mobile, setMobile] = useState(false);
  const current = items.find(i => i.href === pathname)?.label ?? "Overview";
  return <div className="bi-app">
    <a href="#admin-content" className="bi-skip">{t("Skip to overview")}</a>
    <aside className={`bi-sidebar ${mobile ? "is-open" : ""}`}>
      <div className="bi-brand-container"><SarjLogo href="/admin" /></div>
      <div className="bi-workspace"><span className="bi-live-dot" />{t("LEADERSHIP WORKSPACE")}</div>
      <nav aria-label={t("Admin navigation")}>
        {items.map(({
          href,
          label,
          icon: Icon
        }) => <Link key={href} href={href} onClick={() => setMobile(false)} className={pathname === href ? "active" : ""}>
          <Icon size={17} />
          {t(label)}
          {href === "/admin/inquiries" && !loading && !error && <span className="bi-nav-count">
            {t(analysis.open.length)}
          </span>}
        </Link>)}
      </nav>
      <div className="bi-sidebar-note">
        <div className="bi-note-icon">
          <ChartNoAxesCombined size={21} />
        </div>
        <h3>{t("Your next decision.")}</h3>
        <p>{t("Connect your land, your investors, and your next decision.")}</p>
        <Link href="/admin/demand">{t("Understand the opportunity")}<ArrowRight size={13} /></Link>
      </div>
      <Link href="/" className="bi-investor-link">{t("View investor experience")}<ArrowUpRight size={15} /></Link>
      <div className="bi-sidebar-bottom">
        <span className="bi-avatar">{t("SL")}</span>
        <span>{t("Sarj leadership")}<small>{t("Riyadh, Saudi Arabia")}</small></span>
      </div>
    </aside>
    {mobile && <button className="bi-mobile-backdrop" onClick={() => setMobile(false)} aria-label={t("Close navigation")} />}
    <div className="bi-workspace-main">
      <header className="bi-header">
        <div>
          <button className="bi-menu" aria-label={mobile ? "Close navigation" : "Open navigation"} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="bi-header-breadcrumb">{t("Workspace ")}<span>{t("/")}</span> <strong>
              {t(current)}
            </strong></span>
        </div>
        <div className="bi-header-actions"><LanguageToggle />
          <span className="bi-data-status">
            <span className="bi-live-dot" />
            {t(loading ? "Updating data" : error ? "Connection interrupted" : `Live records · ${updatedAt} AST`)}
          </span>
          <button aria-label={t("Refresh business data")} onClick={refresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <span className="bi-avatar">{t("SL")}</span>
        </div>
      </header>
      <main id="admin-content" className="bi-main">
        <motion.div key={pathname} initial={{
          opacity: .6,
          y: 5
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: .2
        }}>
          {t(children)}
        </motion.div>
        <footer className="bi-footer">{t("Sarj Real Estate ")}<span>{t("Local knowledge. Better decisions.")}</span></footer>
      </main>
    </div>
    <DetailDrawers />
    <AdminAssistant />
  </div>;
}
function AdminAssistant() {
  const {
    t,
    locale
  } = useLanguage();
  const {
    loading,
    error,
    openInquiry,
    openParcel
  } = useBusiness();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  type Answer = ChatResponse;
  const [messages, setMessages] = useState<{
    question: string;
    answer?: Answer;
    error?: string;
  }[]>([]);
  const lock = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, [messages, busy]);
  async function send(text: string, retryIndex?: number) {
    const question = text.trim();
    if (!question || lock.current || loading || error) return;
    lock.current = true;
    const index = retryIndex ?? messages.length;
    if(retryIndex === undefined) setMessages(prev => [...prev, {question}]);
    else setMessages(prev => prev.map((m,i) => i === index ? {...m,error:undefined} : m));
    setInput(""); setBusy(true);
    try {
      const answer = await askAdminAdvisor(question);
      setMessages(prev => prev.map((m,i) => i === index ? {...m,answer,error:undefined} : m));
    } catch(e) {
      setMessages(prev => prev.map((m,i) => i === index ? {...m,error:e instanceof Error ? e.message : "Couldn’t complete the request."} : m));
    } finally { lock.current = false; setBusy(false); }
  }
  return <>
    <button className="bi-ai-fab" onClick={() => setOpen(true)}><Sparkles size={17} />{t("Ask Sarj intelligence")}<span className="bi-ai-dot" /></button>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="bi-drawer bi-ai-drawer w-full! sm:max-w-[480px]! gap-0">
        <div className="bi-drawer-head">
          <div className="bi-ai-icon">
            <Sparkles size={23} />
          </div>
          <div>
            <SheetTitle>{t("Sarj intelligence")}</SheetTitle>
            <SheetDescription>{t("A second perspective on your business.")}</SheetDescription>
          </div>
        </div>
        <div className="bi-assistant-label">{t("AI ASSISTANT · LIVE BUSINESS DATA")}</div>
        <div className="bi-ai-scroll">
          <h3>{t("How can I help?")}</h3>
          <p className="bi-muted">{t("Explore demand, find opportunities, and turn a business signal into an action.")}</p>
          {!messages.length && <div className="bi-prompt-list">
            {adminPrompts.map(p => <button key={p} onClick={() => void send(t(p))} disabled={loading || !!error}>
              {t(p)}
              <ArrowUpRight size={14} />
            </button>)}
          </div>}
          <AnimatePresence>
            {messages.map((m, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 6
            }} animate={{
              opacity: 1,
              y: 0
            }}>
              <div className="bi-ai-question">
                {t(m.question)}
              </div>
              {m.answer && <div className="bi-ai-answer">
                <span>{t("SARJ INTELLIGENCE")}</span>
                <p>
                  {m.answer.answer}
                </p>
                {m.answer.parcels.map(p => <button className="bi-ai-record" key={p.parcel_id} onClick={() => {
                  setOpen(false);
                  openParcel(p.parcel_id);
                }}>
                  <span>
                    {locale === "ar" ? p.district_ar : p.district_en}
                    <small>{t(title(p.land_type))}{t(" · ")}{t(p.listing_type)}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>)}
                {m.answer.inquiries.map(q => <button className="bi-ai-record" key={q.inquiry_id} onClick={() => {
                  setOpen(false);
                  openInquiry(q.inquiry_id);
                }}>
                  <span>
                    {q.investor_name}
                    <small>{t(q.area_of_city_wanted)}{t(" · ")}{t(q.land_type_wanted)}{t(" · ")}{t(q.status)}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>)}
              </div>}
              {m.error && <div className="bi-ai-answer" role="alert"><p className="bi-error">{t(m.error)}</p><Button variant="outline" size="sm" disabled={busy} onClick={() => void send(m.question,index)}>{t("Try again")}</Button></div>}
            </motion.div>)}
          </AnimatePresence>
          {busy && <div className="bi-thinking" role="status"><Loader2 size={14} className="animate-spin" />{t("Considering the business signals…")}</div>}
          <div ref={bottom} />
        </div>
        <form className="bi-ai-form" onSubmit={e => {
          e.preventDefault();
          send(input);
        }}>
          <Input value={input} onChange={e => setInput(e.target.value)} aria-label={t("Question for leadership assistant")} placeholder={t("Ask about your portfolio…")} />
          <Button type="submit" size="icon" disabled={!input.trim() || busy || loading || !!error} aria-label={t("Send question")}>
            <Send size={16} />
          </Button>
        </form>
        <p className="bi-ai-disclaimer">{t("AI-generated from current business records. Confirm important details before acting.")}</p>
      </SheetContent>
    </Sheet>
  </>;
}
