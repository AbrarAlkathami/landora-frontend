"use client";

import { useLanguage } from "@/components/shared/language";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, House, TrendingUp, Store, CheckCircle2, Compass, MapPin, KeyRound, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compactMoney, money, recommend, type Preferences } from "@/lib/investor/parcels";
import { usePortfolio } from "./portfolio";
import { ParcelCard } from "./parcel-card";
const steps = [{
  key: "intent",
  eyebrow: "FIRST, THE BIG PICTURE",
  title: "What would you like to make possible?",
  subtitle: "Every great investment starts with a vision.",
  options: [{
    value: "Build a home",
    label: "Build a home",
    description: "A place to call your own",
    icon: House
  }, {
    value: "Develop a project",
    label: "Develop a project",
    description: "Turn a concept into a destination",
    icon: Building2
  }, {
    value: "Open a showroom",
    label: "Open a showroom",
    description: "Give your business room to shine",
    icon: Store
  }, {
    value: "Long-term investment",
    label: "Invest for the future",
    description: "Build a thoughtful land portfolio",
    icon: TrendingUp
  }]
}, {
  key: "type",
  eyebrow: "THE RIGHT FOUNDATION",
  title: "What kind of land are you looking for?",
  subtitle: "Choose the setting that supports your ambition.",
  options: [{
    value: "Residential",
    label: "Residential",
    description: "Homes, communities, and living",
    icon: House
  }, {
    value: "Commercial",
    label: "Commercial",
    description: "Business, retail, and development",
    icon: Building2
  }]
}, {
  key: "listing",
  eyebrow: "AN INVESTMENT THAT FITS",
  title: "Would you like to buy or lease?",
  subtitle: "Ownership for the future, or flexibility for today.",
  options: [{
    value: "Sale",
    label: "Buy land",
    description: "Make it part of your portfolio",
    icon: KeyRound
  }, {
    value: "Lease",
    label: "Lease land",
    description: "Space for your next venture",
    icon: Compass
  }]
}, {
  key: "area",
  eyebrow: "LOCATION MATTERS",
  title: "Where in Riyadh feels right?",
  subtitle: "Choose a preferred area, or keep your options open.",
  options: [{
    value: "North",
    label: "North Riyadh",
    description: "Explore the city's northern districts",
    icon: MapPin
  }, {
    value: "East",
    label: "East Riyadh",
    description: "Discover possibilities in the east",
    icon: MapPin
  }, {
    value: "West",
    label: "West Riyadh",
    description: "Find your place in the west",
    icon: MapPin
  }, {
    value: "South",
    label: "South Riyadh",
    description: "Explore established southern districts",
    icon: MapPin
  }, {
    value: "Central",
    label: "Central Riyadh",
    description: "Explore the heart of the city",
    icon: MapPin
  }, {
    value: "Anywhere",
    label: "I’m open to possibilities",
    description: "Let the opportunity guide me",
    icon: Compass
  }]
}, {
  key: "budget",
  eyebrow: "YOUR COMFORT ZONE",
  title: "What budget do you have in mind?",
  subtitle: "A starting point to help us find the right fit.",
  options: []
}] as const;
export function MatchWizard() {
  const {
    t,
    direction
  } = useLanguage();
  const {
    parcels, loading, error
  } = usePortfolio();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    intent: "",
    type: "",
    listing: "",
    area: "",
    budget: 5000000
  });
  const current = steps[step];
  const selected = preferences[current.key];
  const matches = recommend(preferences, parcels);
  const isLease = preferences.listing === "Lease";
  const eligible = parcels.filter(p => p.available && (!preferences.intent || p.uses.includes(preferences.intent)) && (!preferences.type || p.type === preferences.type) && (!preferences.listing || p.listing === preferences.listing) && (!preferences.area || preferences.area === "Anywhere" || p.area === preferences.area) && (step < 4 || p.price !== null && p.price <= preferences.budget));
  function select(value: string) {
    setPreferences(prev => ({
      ...prev,
      [current.key]: value,
      ...(current.key === "listing" ? {
        budget: value === "Lease" ? 750000 : 5000000
      } : {})
    }));
  }
  if (done) return <section className="match-page" dir={direction}>
    <div className="site-width">
      <div className="recommendations-intro">
        <span className="eyebrow">{t("YOUR VISION, MEET YOUR SHORTLIST")}</span>
        <h1>{t(matches.length === 3 ? "Three possibilities." : matches.length ? `${matches.length} ${matches.length === 1 ? "possibility" : "possibilities"}.` : "New possibilities ahead.")}<br /><em>{t("A little closer to your ambition.")}</em></h1>
        <p>
          {t(matches.filter(m => m.score === 100).length ? `${matches.filter(m => m.score === 100).length} exact ${matches.filter(m => m.score === 100).length === 1 ? "match" : "matches"} and your next best options.` : "Your closest available options, with the tradeoffs made clear.")}
        </p>
        <div className="preference-summary">
          {[preferences.intent, preferences.type, preferences.listing === "Sale" ? "Buy" : "Lease", preferences.area === "Anywhere" ? "All Riyadh" : `${preferences.area} Riyadh`, `SAR ${compactMoney(preferences.budget)}${isLease ? " / year" : ""}`].map(x => <span key={x}>
            {t(x)}
          </span>)}
        </div>
      </div>
      {!loading && !error && matches.length === 0 && <div className="empty-state"><p>{t("No parcels are currently available. Contact Sarj to explore upcoming opportunities.")}</p><Link href="/explore" className="cta cta-outline mt-4">{t("View the portfolio")}</Link></div>}
      <div className="parcel-grid">
        {matches.map(({
          parcel,
          score,
          reasons,
          tradeoffs
        }, index) => <motion.div initial={{
          opacity: 0,
          y: 15
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: .4,
          delay: index * .1
        }} key={parcel.id}>
          <ParcelCard parcel={parcel} score={score} reasons={reasons} tradeoffs={tradeoffs} />
        </motion.div>)}
      </div>
      <p className="score-explanation">{t("Match score: 20% each for your intended use, land type, buy/lease preference, area, and budget. Based on live listing attributes, not an investment assessment.")}</p>
      <div className="match-results-actions">
        <Button className="cta cta-outline" onClick={() => {
          setDone(false);
          setStep(0);
        }}><ArrowLeft size={15} />{t("Refine my preferences")}</Button>
        <Link href="/explore" className="text-link">{t("Explore all opportunities")}<ArrowUpRight size={15} /></Link>
      </div>
    </div>
  </section>;
  return <section className="match-page" dir={direction}>
    <div className="wizard-container">
      <div className="wizard-top">
        <Link href="/" className="flex items-center gap-2"><Compass size={13} />{t("FIND MY MATCH")}</Link>
        <span>{t("Step ")}{t(step + 1)}{t(" of 5")}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-label={t("Matching progress")} aria-valuenow={step + 1} aria-valuemin={0} aria-valuemax={5}>
        <motion.div className="progress-fill" animate={{
          width: `${(step + 1) * 20}%`
        }} transition={{
          duration: .4
        }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} transition={{
          duration: .22
        }}>
          <div className="wizard-heading">
            <span className="eyebrow">
              {t(current.eyebrow)}
            </span>
            <h1>
              {t(current.title)}
            </h1>
            <p>
              {t(current.subtitle)}
            </p>
          </div>
          {current.key === "budget" ? <div className="budget-control">
            <div className="budget-value">
              <small>{t("SAR")}</small>
              {t(money(preferences.budget))}
              {isLease && <small>{t(" / year")}</small>}
            </div>
            <label htmlFor="match-budget" className="sr-only">{t(isLease ? "Annual lease budget" : "Purchase budget (SAR)")}</label>
            <input id="match-budget" type="range" min={isLease ? 100000 : 1000000} max={isLease ? 2000000 : 20000000} step={isLease ? 50000 : 500000} value={preferences.budget} onChange={e => setPreferences(prev => ({
              ...prev,
              budget: Number(e.target.value)
            }))} />
            <div className="budget-range">
              <span>{t("SAR ")}{t(isLease ? "100K" : "1M")}</span>
              <span>{t("SAR ")}{t(isLease ? "2M" : "20M")}</span>
            </div>
            <div className="budget-presets">
              {(isLease ? [250000, 500000, 750000, 1000000] : [3000000, 5000000, 10000000, 15000000]).map(value => <button className={preferences.budget === value ? "selected" : ""} aria-pressed={preferences.budget === value} onClick={() => setPreferences(prev => ({
                ...prev,
                budget: value
              }))} key={value}>{t("SAR ")}{t(compactMoney(value))}</button>)}
            </div>
            <p>
              {t(isLease ? "Annual lease budget, excluding operating and development costs." : "Total land purchase budget, excluding fees and development costs.")}
            </p>
          </div> : <div className="wizard-choices" role="group" aria-label={t(current.title)}>
            {current.options.map(option => <button key={option.value} className={`choice-card ${selected === option.value ? "selected" : ""}`} aria-pressed={selected === option.value} onClick={() => select(option.value)}>
              <span className="choice-icon">
                <option.icon size={25} />
              </span>
              <span>
                <strong>
                  {t(option.label)}
                </strong>
                <small>
                  {t(option.description)}
                </small>
              </span>
              {selected === option.value && <CheckCircle2 size={16} className="choice-check" />}
            </button>)}
          </div>}
        </motion.div>
      </AnimatePresence>
      <div className="wizard-actions">
        <button className="wizard-back" disabled={step === 0} onClick={() => setStep(prev => prev - 1)}><ArrowLeft size={15} />{t("Back")}</button>
        <Button disabled={!selected} className="cta cta-green" onClick={() => step === 4 ? setDone(true) : setStep(prev => prev + 1)}>
          {t(step === 4 ? "See my matches" : "Continue")}
          {step === 4 ? <Sparkles size={16} /> : <ArrowRight size={16} />}
        </Button>
      </div>
      <div className="wizard-status" aria-live="polite">
        {loading ? <span>{t("Loading land opportunities")}</span> : error ? <span>{t("Try again")}</span> : eligible.length ? <><Check size={13} />{t(`${eligible.length} opportunities match your preferences so far`)}</> : <><Sparkles size={13} />{t("We’ll show the closest options and explain the tradeoffs.")}</>}
      </div>
    </div>
  </section>;
}
