"use client";

import { useLanguage } from "@/components/shared/language";
import { Suspense, createContext, useContext, useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/shared/language";
import { SarjLogo } from "@/components/shared/sarj-logo";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, ArrowRight, Sparkles, Send, Menu, X, CheckCircle2, MapPin, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money, compactMoney, type InvestorParcel } from "@/lib/investor/parcels";
import { advisorPrompts, type ChatMessage } from "@/lib/investor/advisor";
import { usePortfolio } from "./portfolio";
import { askInvestorAdvisor, getInvestorParcel, submitInvestorInquiry } from "@/lib/investor/api";
import { buildInquiry } from "@/lib/investor/inquiry";
import { InquiryFields } from "./inquiry-fields";
type AdvisorContextValue = {
  ask: (prompt?: string, parcel?: InvestorParcel) => void;
  inquire: (parcel?: InvestorParcel) => void;
};
const AdvisorContext = createContext<AdvisorContextValue>({
  ask: () => {},
  inquire: () => {}
});
export const useInvestor = () => useContext(AdvisorContext);
export function AdvisorEntry({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const {
    t
  } = useLanguage();
  const {
    ask
  } = useInvestor();
  return <button className={className} onClick={() => ask()}>
    {t(children)}
  </button>;
}
function NavigationLinks({ pathname = "" }: { pathname?: string }) {
  const { t } = useLanguage();
  return <nav aria-label={t("Main navigation")} className="desktop-nav">
              <Link className={pathname === "/" ? "active" : ""} href="/">{t("Home")}</Link>
              <Link className={pathname.startsWith("/explore") ? "active" : ""} href="/explore">{t("Explore lands")}</Link>
              <Link className={pathname.startsWith("/match") ? "active" : ""} href="/match">{t("Find my match")}<span className="nav-new">{t("FOR YOU")}</span></Link>
            </nav>;
}
function ActiveNavigation() {
  const pathname = usePathname();
  return <NavigationLinks pathname={pathname} />;
}

export function InvestorShell({
  children
}: {
  children: ReactNode;
}) {
  const {
    t,
    locale
  } = useLanguage();
  const {
    parcels, loading: portfolioLoading, error: portfolioError, retry: retryPortfolio
  } = usePortfolio();
  const [mobile, setMobile] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [contextParcel, setContextParcel] = useState<InvestorParcel>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [compare, setCompare] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selected, setSelected] = useState<InvestorParcel>();
  const [success, setSuccess] = useState(false);
  const chatBusy = useRef(false);
  const inquiryBusy = useRef(false);
  const [chatError, setChatError] = useState("");
  const [failedChat, setFailedChat] = useState<{
    text: string;
    ids?: string[];
  }>();
  const [submitting, setSubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [inquiryId, setInquiryId] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, thinking]);
  const requestAnswer = useCallback(async (text: string, ids?: string[]) => {
    if (chatBusy.current) return;
    chatBusy.current = true;
    setThinking(true);
    setChatError("");
    try {
      const response = await askInvestorAdvisor(text, ids);
      const lands = await Promise.all(response.parcels.map(result => parcels.find(p => p.id === result.parcel_id) ?? getInvestorParcel(result.parcel_id)));
      setMessages(prev => [...prev, {
        role: "advisor",
        text: response.answer,
        lands
      }]);
      setFailedChat(undefined);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "The advisor couldn’t respond. Please try again.");
      setFailedChat({
        text,
        ids
      });
    } finally {
      chatBusy.current = false;
      setThinking(false);
    }
  }, [parcels]);
  const send = useCallback((text: string, parcel = contextParcel, selectedIds = compareIds) => {
    if (!text.trim() || chatBusy.current) return;
    setMessages(prev => [...prev, {
      role: "user",
      text
    }]);
    setInput("");
    setChatError("");
    const comparing = /(compare|قارن|مقارنة)/i.test(text);
    if (comparing) setCompare(true);
    if (comparing && (!selectedIds[0] || !selectedIds[1])) {
      setMessages(prev => [...prev, {
        role: "advisor",
        text: t("Choose two opportunities below to compare their current listing details.")
      }]);
      return;
    }
    void requestAnswer(text, comparing ? selectedIds : parcel ? [parcel.id] : undefined);
  }, [contextParcel, compareIds, requestAnswer, t]);
  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inquiryBusy.current) return;
    const data = new FormData(event.currentTarget);
    inquiryBusy.current = true;
    setSubmitting(true);
    setInquiryError("");
    try {
      await submitInvestorInquiry(buildInquiry(data, inquiryId));
      setSuccess(true);
    } catch (error) {
      setInquiryError(error instanceof Error ? error.message : "Your inquiry couldn’t be submitted. Please try again.");
    } finally {
      inquiryBusy.current = false;
      setSubmitting(false);
    }
  }
  const ask = useCallback((prompt?: string, parcel?: InvestorParcel) => {
    setContextParcel(parcel);
    setAdvisorOpen(true);
    if (prompt) send(prompt, parcel);
  }, [send]);
  const inquire = useCallback((parcel?: InvestorParcel) => {
    setSelected(parcel);
    setInquiryId(`INQ-${crypto.randomUUID()}`);
    setInquiryError("");
    setSuccess(false);
    setInquiryOpen(true);
  }, []);
  const actions = useMemo(() => ({
    ask,
    inquire
  }), [ask, inquire]);
  return <MotionConfig reducedMotion="user">
    <AdvisorContext.Provider value={actions}>
      <div className="investor-app">
        <a href="#main-content" className="skip-link">{t("Skip to content")}</a>
        <header className="site-header">
          <div className="site-width header-inner">
            <SarjLogo />
            <Suspense fallback={<NavigationLinks />}><ActiveNavigation /></Suspense>
            <div className="header-actions"><LanguageToggle />
              <button className="header-contact" onClick={() => inquire()}>{t("Let’s talk")}<ArrowUpRight size={16} /></button>
              <button className="mobile-menu" onClick={() => setMobile(!mobile)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}>
                {mobile ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {mobile && <motion.nav initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: "auto",
              opacity: 1
            }} exit={{
              height: 0,
              opacity: 0
            }} className="mobile-nav" aria-label={t("Mobile navigation")}>
              {[["/", "Home"], ["/explore", "Explore lands"], ["/match", "Find my match"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setMobile(false)}>
                {t(label)}
                <ArrowUpRight size={16} />
              </Link>)}
            </motion.nav>}
          </AnimatePresence>
        </header>
        <main id="main-content" aria-busy={portfolioLoading}>
          {portfolioError && <div className="site-width portfolio-note" role="alert">
            <p>{t("Let’s reconnect to your next opportunity.")}</p>
            <p>{t(portfolioError)}</p>
            <button className="text-link" onClick={retryPortfolio}>{t("Try again")}</button>
          </div>}
          {t(children)}
        </main>
        <footer className="site-footer" id="about">
          <div className="site-width footer-top">
            <div>
              <SarjLogo />
              <p>{t("Grounded in local knowledge.")}<br />{t("Built around your ambitions.")}</p>
            </div>
            <div>
              <span className="eyebrow">{t("YOUR NEXT OPPORTUNITY STARTS HERE")}</span>
              <h3>{t("Let’s find your place in Riyadh.")}</h3>
              <button onClick={() => inquire()} className="text-link">{t("Start a conversation")}<ArrowUpRight size={17} /></button>
            </div>
          </div>
          <div className="site-width footer-bottom">
            <span>{t("© 2026 Sarj Real Estate. All rights reserved.")}</span>
            <span><MapPin size={13} />{t("Riyadh, Saudi Arabia")}</span>
            <span>{t("Investor experience · Sarj Real Estate")}</span>
          </div>
        </footer>
        <button className="advisor-fab" onClick={() => ask()} aria-label={t("Open AI advisor")}>
          <Sparkles size={19} />
          <span>{t("Ask Sarj AI")}</span>
          <span className="fab-dot" />
        </button>
        <Sheet open={advisorOpen} onOpenChange={setAdvisorOpen}>
          <SheetContent className="advisor-drawer w-full! sm:max-w-[460px]! gap-0">
            <div className="drawer-header">
              <div className="advisor-avatar">
                <Sparkles size={22} />
              </div>
              <div>
                <SheetTitle>{t("Sarj AI advisor")}</SheetTitle>
                <SheetDescription>{t("Your next opportunity, a little clearer.")}</SheetDescription>
              </div>
            </div>
            <div className="mock-status"><span />{t("SARJ ADVISOR · LIVE PORTFOLIO")}</div>
            <div className="chat-scroll">
              <div className="chat-welcome">
                <h3>{t("What’s your vision?")}</h3>
                <p>{t("Let’s explore the land that could bring it to life. I can help you discover, compare, and shortlist.")}</p>
              </div>
              {messages.length === 0 && <div className="suggested-prompts">
                {advisorPrompts.map(prompt => <button key={prompt} onClick={() => send(t(prompt))}>
                  {t(prompt)}
                  <ArrowUpRight size={14} />
                </button>)}
              </div>}
              {messages.map((message, i) => <motion.div key={i} initial={{
                opacity: 0,
                y: 6
              }} animate={{
                opacity: 1,
                y: 0
              }} className={`chat-message ${message.role}`}>
                <span className="message-role">
                  {t(message.role === "advisor" ? "SARJ AI" : "YOU")}
                </span>
                <p>
                  {message.text}
                </p>
                {message.lands?.map(p => <Link href={`/lands/${p.id}`} onClick={() => setAdvisorOpen(false)} key={p.id} className="chat-land">
                  <span>
                    {locale === "ar" ? p.districtAr : p.district}
                    <small>{t(p.type)}{t(" · ")}{t(money(p.size))}{t(" m² · ")}{t(p.listing)}{t(p.listing === "Lease" ? " · annual rent" : "")}</small>
                  </span>
                  <strong>
                    {t(p.price === null ? "Price on request" : `SAR ${compactMoney(p.price)}`)}
                    <ArrowUpRight size={15} />
                  </strong>
                </Link>)}
              </motion.div>)}
              {compare && <div className="comparison-picker">
                <label htmlFor="compare-a">{t("Choose two parcels")}</label>
                {[0, 1].map(index => <select key={index} id={index === 0 ? "compare-a" : "compare-b"} aria-label={`Comparison parcel ${index + 1}`} value={compareIds[index] ?? ""} onChange={e => setCompareIds(prev => {
                  const next = [...prev];
                  next[index] = e.target.value;
                  return next;
                })}>
                  <option value="">{t("Select parcel ")}{t(index + 1)}</option>
                  {parcels.filter(p => p.id !== compareIds[1 - index]).map(p => <option key={p.id} value={p.id}>{locale === "ar" ? p.districtAr : p.district}{t(" · ")}{t(p.type)}{t(" · ")}{t(p.listing)}</option>)}
                </select>)}
                <Button className="compare-submit" disabled={!compareIds[0] || !compareIds[1] || thinking} onClick={() => send(t("Compare these two parcels"))}>{t("Compare selected parcels")}<ArrowRight size={14} /></Button>
              </div>}
              {thinking && <div className="chat-thinking" role="status"><Loader2 size={15} className="animate-spin" />{t("Considering the opportunities…")}</div>}
              {chatError && <div className="portfolio-note" role="alert">
                <p>
                  {t(chatError)}
                </p>
                {failedChat && <button className="text-link mt-2" disabled={thinking} onClick={() => requestAnswer(failedChat.text, failedChat.ids)}>{t("Try again")}</button>}
              </div>}
              <div ref={bottom} />
            </div>
            <form className="chat-form" onSubmit={e => {
              e.preventDefault();
              send(input);
            }}>
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder={t("Ask about land in Riyadh…")} aria-label={t("Message to AI advisor")} />
              <Button type="submit" disabled={!input.trim() || thinking} size="icon" aria-label={t("Send message")}>
                <Send size={17} />
              </Button>
            </form>
            <p className="chat-disclaimer">{t("AI can make mistakes. Confirm permitted uses and listing details with the Sarj team.")}</p>
          </SheetContent>
        </Sheet>
        <Dialog open={inquiryOpen} onOpenChange={open => {
          if (!submitting) setInquiryOpen(open);
        }}>
          <DialogContent className="inquiry-dialog">
            {success ? <div className="inquiry-success">
              <div className="success-icon">
                <CheckCircle2 size={35} />
              </div>
              <DialogTitle>{t("Your next chapter starts here.")}</DialogTitle>
              <DialogDescription>{t("Your interest in ")}{t(selected?.district ?? "Riyadh land opportunities")}{t(" has been sent to the Sarj team.")}</DialogDescription>
              <p>{t("A Sarj advisor can now follow up to understand your plans and discuss the next steps.")}</p>
              <Button className="cta cta-green" onClick={() => setInquiryOpen(false)}>{t("Continue exploring")}<ArrowRight size={16} /></Button>
              <small>{t("Reference: ")}{t(inquiryId)}</small>
            </div> : <>
              <div className="inquiry-intro">
                <p className="inquiry-eyebrow">{t("LET’S TAKE THE NEXT STEP")}</p>
                <DialogTitle className="inquiry-title">{t("A new possibility starts with a conversation.")}</DialogTitle>
                <DialogDescription className="inquiry-description">{t("Tell us what you have in mind.")}</DialogDescription>
              </div>
              <form className="inquiry-form" onSubmit={submitInquiry}>
                <fieldset disabled={submitting} className="contents">
                  <InquiryFields key={inquiryId} parcels={parcels} selected={selected} onSelect={setSelected} />
                </fieldset>
                {inquiryError && <p className="form-error" role="alert">
                  {t(inquiryError)}
                </p>}
                <Button disabled={submitting} type="submit" className="cta cta-green">
                  {t(submitting ? "Submitting…" : "Submit my interest")}
                  <ArrowUpRight size={17} />
                </Button>
                <p className="form-note">{t("We’ll use your details to follow up on your inquiry.")}</p>
              </form>
            </>}
          </DialogContent>
        </Dialog>
      </div>
    </AdvisorContext.Provider>
  </MotionConfig>;
}
