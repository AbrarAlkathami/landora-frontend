"use client";
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translate, type Locale } from "@/lib/i18n/translate";
const event="sarj-language-change";
let fallback: Locale="en";
function subscribe(callback:()=>void){window.addEventListener(event,callback);window.addEventListener("storage",callback);return ()=>{window.removeEventListener(event,callback);window.removeEventListener("storage",callback);};}
function snapshot():Locale{try{return localStorage.getItem("sarj-locale")==="ar"?"ar":"en";}catch{return fallback;}}
export function setLanguage(locale:Locale){fallback=locale;try{localStorage.setItem("sarj-locale",locale);}catch{}window.dispatchEvent(new Event(event));}
export function useLanguage(){const locale=useSyncExternalStore(subscribe,snapshot,()=>"en" as Locale);const t=useMemo(()=>((value:ReactNode)=>translate(value,locale)) as { (value:string):string; (value:ReactNode):ReactNode },[locale]);return {locale,direction:locale==="ar"?"rtl" as const:"ltr" as const,t};}
export function LanguageRoot({children}:{children:ReactNode}){const {locale,direction}=useLanguage();useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;},[locale,direction]);return children;}
export function LanguageToggle(){const {locale}=useLanguage();return <Button variant="outline" size="sm" className="language-toggle" aria-label={locale==="ar"?"Switch to English":"التبديل إلى العربية"} onClick={()=>setLanguage(locale==="ar"?"en":"ar")}><Languages size={15}/><span>{locale==="ar"?"English":"Arabic"}</span></Button>;}
