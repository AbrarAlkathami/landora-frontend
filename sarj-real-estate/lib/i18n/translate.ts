import type { ReactNode } from "react";
import { arabic } from "./ar";
export type Locale = "en" | "ar";
const messages = new Map(Object.entries(arabic).map(([key,value])=>[key.toLowerCase(),value]));
export function translate(value: string, locale: Locale): string;
export function translate(value: ReactNode, locale: Locale): ReactNode;
export function translate(value: ReactNode, locale: Locale): ReactNode {
  if(locale!=="ar" || typeof value!=="string")return value;
  const key=value.trim();
  const direct=messages.get(key.toLowerCase());
  if(direct)return value.replace(key,direct);
  const regions:Record<string,string>={North:"الشمال",East:"الشرق",West:"الغرب",South:"الجنوب",Central:"الوسط"};
  const patterns:[RegExp,(m:RegExpMatchArray)=>string][]=[
    [/^([\d,.]+)(M|K)$/,m=>`${m[1]} ${m[2]==="M"?"مليون":"ألف"}`],
    [/^SAR ([\d,.]+[MK])(?: \/ year)?$/,m=>`${translate(m[1],locale)} ر.س${m[0].endsWith("/ year")?" سنويًا":""}`],
    [/^(Residential|Commercial) rather than (residential|commercial) land$/,m=>`أرض ${translate(m[1],locale)} بدلًا من ${translate(m[2],locale)}`],
    [/^Located in (North|East|West|South|Central) Riyadh$/,m=>`تقع في ${regions[m[1]]} — الرياض`],
    [/^(North|East|West|South|Central) Riyadh — open to your preferred location$/,m=>`${regions[m[1]]} في الرياض — ضمن خياراتك المفتوحة للموقع`],
    [/^(\d+) opportunities match your preferences so far$/,m=>`${m[1]} فرص توافق تفضيلاتك حتى الآن`],
    [/^(\d+) opportunities$/,m=>`${m[1]} فرص`],
    [/^(\d+) exact (?:match|matches) and your next best options\.$/,m=>`${m[1]} مطابقات كاملة وأقرب الخيارات التالية.`],
    [/^(North|East|West|South|Central) Riyadh$/,m=>`${regions[m[1]]} — الرياض`],
    [/^Commercial demand leads in (.+) Riyadh\.$/,m=>`أعلى طلب تجاري في ${m[1].split(" & ").map(x=>regions[x]??x).join(" و")} — الرياض.`],
    [/^(\d+) open commercial inquiries per leading area\..*$/,m=>`${m[1]} استفسارات تجارية مفتوحة في كل منطقة متصدرة. راجع المستثمرين وميزانياتهم.`],
    [/^(North|East|West|South|Central) (commercial|residential) (sale|lease): (\d+) investors without a fit\.$/,m=>`${regions[m[1]]}، ${translate(m[2],locale)} ${translate(m[3],locale)}: ${m[4]} مستثمرين دون فرصة مناسبة.`],
    [/^(\d+) open inquiries against (\d+) available parcels\..*$/,m=>`${m[1]} استفسارات مفتوحة مقابل ${m[2]} أرضًا متاحة. تُفحص المنطقة والنوع والمعاملة والميزانية المعلنة.`],
    [/^(.+): (\d+) reported days on market\.$/,m=>`${m[1]}: ${m[2]} يومًا في السوق بحسب السجل.`],
    [/^Review the (\d+) oldest available parcels.*$/,m=>`راجع أقدم ${m[1]} أراضٍ متاحة وحدد المستثمرين المناسبين قبل تعديل العرض.`],
    [/^(\d+) buyers and (\d+) lease prospects.*$/,m=>`${m[1]} مستثمرين للشراء و${m[2]} للإيجار ضمن فئة الجاهزين أو المؤهلين أو قيد التفاوض. ابدأ بقائمة فرص مخصصة والمتابعة.`],
    [/^(\d+) open inquiries need a different approach\.$/,m=>`${m[1]} استفسارات مفتوحة تحتاج خيارات بديلة.`],
    [/^No currently available parcel meets all supplied preferences.*$/,()=>"لا توجد أرض متاحة تطابق جميع التفضيلات والميزانية. ناقش البدائل أو مرونة المستثمر."],
    [/^([\d,]+) m² with access to a ([\d.]+)m street$/,m=>`${m[1]} م² على شارع بعرض ${m[2]} متر`],
    [/^(North|East|West|South|Central) Riyadh matches the area preference$/,m=>`منطقة ${regions[m[1]]} في الرياض توافق التفضيل`],
    [/^(Residential|Commercial) land aligns with the requested type$/,m=>`الأرض ${translate(m[1],locale)} توافق النوع المطلوب`],
    [/^Available for (sale|lease)$/,m=>`متاحة ${m[1]==="sale"?"للبيع":"للإيجار"}`],
    [/^Within the (annual lease|purchase) budget$/,m=>`ضمن ميزانية ${m[1]==="purchase"?"الشراء":"الإيجار السنوي"}`],
    [/^Within your SAR (.+?) (annual )?budget$/,m=>`ضمن ميزانيتك ${translate(m[1].trim(),locale)} ر.س${m[2]?" سنويًا":""}`],
    [/^Above your budget by SAR (.+)$/,m=>`تتجاوز الميزانية بمقدار ${m[1]} ر.س`],
    [/^Land type aligned with your goal: (.+) \(subject to use approval\)$/,m=>`نوع الأرض يتوافق مبدئيًا مع هدفك: ${translate(m[1],locale)}، بشرط موافقة الاستخدام`],
    [/^(Residential|Commercial) land, as requested$/,m=>`أرض ${translate(m[1],locale)} كما طلبت`],
    [/^Available to (buy|lease)$/,m=>`متاحة ${m[1]==="buy"?"للشراء":"للإيجار"}`],
    [/^Offered for (sale|lease)$/,m=>`معروضة ${m[1]==="sale"?"للبيع":"للإيجار"}`],
    [/^(North|East|West|South|Central) Riyadh, your preferred area$/,m=>`${regions[m[1]]} في الرياض، منطقتك المفضلة`],
    [/^(\d+) possibilities\.$/,m=>`${m[1]} فرص ممكنة.`],
  ];
  for(const [pattern,render] of patterns){const match=key.match(pattern);if(match)return value.replace(key,render(match));}
  const short:Record<string,string>={"Budget not provided — confirm with investor":"الميزانية غير محددة — تأكد من المستثمر","Budget basis differs from the listing":"أساس الميزانية يختلف عن العرض","Parcel price requires confirmation":"السعر يحتاج تأكيدًا","Above the stated budget":"يتجاوز الميزانية المعلنة","Price on request — budget fit needs confirmation":"السعر عند الطلب — يلزم تأكيد ملاءمة الميزانية","Your intended use needs a closer review":"الاستخدام المقصود يحتاج مراجعة"};
  if(short[key])return value.replace(key,short[key]);
  return value.replace(/\b(North|East|West|South|Central) Riyadh\b/g,(_,r:string)=>`${regions[r]} — الرياض`).replace(/\bSAR\b/g,"ر.س").replace(/\/ year\b/g,"/ سنويًا");
}
