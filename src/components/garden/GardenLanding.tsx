import { useEffect, useMemo, useState } from "react";
import {
  Leaf, Droplets, Scissors, Sprout, TreePine, Trash2, Flower2, Sparkles,
  ShieldCheck, Clock, MapPin, Phone, CheckCircle2, Star, Plus, Minus,
  ArrowRight, MessageCircle, ChevronDown, Send, Loader2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import heroImg from "@/assets/garden-hero.jpg";
import { useI18n } from "@/i18n/I18nContext";
import { translations } from "@/i18n/translations";
import LanguageSwitcher from "./LanguageSwitcher";
import BeforeAfterSlider from "./BeforeAfterSlider";
import ThemeToggle from "@/components/ThemeToggle";
import lawnBefore from "@/assets/gallery/lawn-before.jpg";
import lawnAfter from "@/assets/gallery/lawn-after.jpg";
import hedgeBefore from "@/assets/gallery/hedge-before.jpg";
import hedgeAfter from "@/assets/gallery/hedge-after.jpg";
import bedsBefore from "@/assets/gallery/beds-before.jpg";
import bedsAfter from "@/assets/gallery/beds-after.jpg";

const GALLERY_PAIRS = [
  { before: lawnBefore, after: lawnAfter },
  { before: hedgeBefore, after: hedgeAfter },
  { before: bedsBefore, after: bedsAfter },
];

const SERVICE_CITIES = ["Trstenik", "Kruševac", "Vrnjačka Banja", "Aleksandrovac"];

// Business contact channels (placeholders — replace with real numbers/email)
const BUSINESS_PHONE_INTL = "381600000000"; // E.164 without +
const BUSINESS_PHONE_DISPLAY = "+381 60 000 0000";

// Cloudflare Worker endpoint that forwards the form to our Telegram bot.
// Replace with your actual Worker URL once deployed (see /worker/README.md).
const WORKER_ENDPOINT = "https://zelena-oaza-order.zelena-oaza.workers.dev";

type Frequency = "1x_nedeljno" | "2x_nedeljno" | "1x_mesecno" | "2x_mesecno" | "po_potrebi";

interface ServiceDef {
  id: string;
  icon: typeof Leaf;
  pricePerM2?: number;
  perVisit?: number;
  minPrice: number;
  unit: "m²" | "kom";
  defaultFrequency: Frequency;
  defaultQuantityScale?: number; // multiplier of base area, e.g. 1, 0.3
}

const SERVICES: ServiceDef[] = [
  { id: "zalivanje",  icon: Droplets, pricePerM2: 8,  minPrice: 1500, unit: "m²", defaultFrequency: "2x_nedeljno", defaultQuantityScale: 1 },
  { id: "kosenje",    icon: Scissors, pricePerM2: 25, minPrice: 2500, unit: "m²", defaultFrequency: "1x_nedeljno", defaultQuantityScale: 1 },
  { id: "plevljenje", icon: Sprout,   pricePerM2: 35, minPrice: 2000, unit: "m²", defaultFrequency: "1x_mesecno", defaultQuantityScale: 0.3 },
  { id: "zivica",     icon: TreePine, pricePerM2: 90, minPrice: 3000, unit: "m²", defaultFrequency: "1x_mesecno", defaultQuantityScale: 0.15 },
  { id: "drvece",     icon: TreePine, perVisit: 1500, minPrice: 1500, unit: "kom", defaultFrequency: "po_potrebi" },
  { id: "ciscenje",   icon: Trash2,   pricePerM2: 12, minPrice: 2000, unit: "m²", defaultFrequency: "2x_mesecno", defaultQuantityScale: 1 },
  { id: "cvece",      icon: Flower2,  pricePerM2: 60, minPrice: 2500, unit: "m²", defaultFrequency: "po_potrebi", defaultQuantityScale: 0.2 },
  { id: "djubrenje",  icon: Leaf,     pricePerM2: 15, minPrice: 1800, unit: "m²", defaultFrequency: "1x_mesecno", defaultQuantityScale: 1 },
];

const FREQUENCIES: { value: Frequency; multiplier: number }[] = [
  { value: "2x_nedeljno", multiplier: 8 },
  { value: "1x_nedeljno", multiplier: 4 },
  { value: "2x_mesecno", multiplier: 2 },
  { value: "1x_mesecno", multiplier: 1 },
  { value: "po_potrebi", multiplier: 1 },
];

const PRESET_AREAS = [
  { value: 50, key: "small" as const },
  { value: 150, key: "medium" as const },
  { value: 400, key: "large" as const },
  { value: 800, key: "estate" as const },
];

interface SelectedService {
  id: string;
  quantity: number;
  frequency: Frequency;
}

const computeMonthly = (def: ServiceDef, s: SelectedService) => {
  const freq = FREQUENCIES.find((f) => f.value === s.frequency)!;
  const perVisit = def.perVisit
    ? def.perVisit * s.quantity
    : Math.max(def.minPrice, (def.pricePerM2 || 0) * s.quantity);
  return { perVisit, monthly: perVisit * freq.multiplier, freq };
};

const GardenLanding = () => {
  const { t, formatPrice: formatRSD } = useI18n();
  const [selected, setSelected] = useState<Record<string, SelectedService>>({});
  const [area, setArea] = useState<number>(150);
  const [contact, setContact] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "phone" | "consent", string>>>({});
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Phone format check (used for live inline validation)
  const isPhoneValid = (val: string) => /^[+\d][\d\s\-()]{5,}$/.test(val.trim()) && val.replace(/\D/g, "").length >= 6;

  // Scroll-spy: highlight the section currently in view in the header nav.
  useEffect(() => {
    const ids = ["usluge", "porucivanje", "kontakt"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Zod schema for contact step — keeps validation centralized & consistent.
  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t.toasts.missingDesc).max(100),
        // Permissive phone: digits, spaces, +, -, parens, min 6 digits total
        phone: z
          .string()
          .trim()
          .min(6, t.toasts.missingDesc)
          .max(30)
          .regex(/^[+\d][\d\s\-()]{5,}$/, t.toasts.missingDesc),
        consent: z.literal(true, { errorMap: () => ({ message: t.privacy.consentRequired }) }),
      }),
    [t],
  );

  const toggleService = (def: ServiceDef) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[def.id]) {
        delete next[def.id];
      } else {
        const qty = def.unit === "kom"
          ? 1
          : Math.max(10, Math.round(area * (def.defaultQuantityScale ?? 1)));
        next[def.id] = { id: def.id, quantity: qty, frequency: def.defaultFrequency };
      }
      return next;
    });
  };

  const updateService = (id: string, patch: Partial<SelectedService>) => {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  // Re-scale areas when global area changes (only for area-based services)
  useEffect(() => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        const def = SERVICES.find((d) => d.id === id)!;
        if (def.unit === "m²" && def.defaultQuantityScale) {
          next[id] = { ...next[id], quantity: Math.max(10, Math.round(area * def.defaultQuantityScale)) };
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  const calc = useMemo(() => {
    const items = Object.values(selected).map((s) => {
      const def = SERVICES.find((d) => d.id === s.id)!;
      const { perVisit, monthly, freq } = computeMonthly(def, s);
      return { def, s, freq, perVisit, monthly };
    });
    const total = items.reduce((sum, i) => sum + i.monthly, 0);
    return { items, total };
  }, [selected]);

  const submit = () => {
    // Scroll to the inline contact form
    document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateBeforeSend = () => {
    const result = contactSchema.safeParse({
      name: contact.name,
      phone: contact.phone,
      consent,
    });
    if (!result.success) {
      const errs: Partial<Record<"name" | "phone" | "consent", string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as "name" | "phone" | "consent";
        if (!errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      toast({ title: t.toasts.missingTitle, description: t.toasts.missingDesc, variant: "destructive" });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const buildOrderMessage = () => {
    // Telegram messages are always sent in Serbian (Latin), regardless of UI locale,
    // so the business owner gets a consistent format.
    const srT = translations["sr-Latn"];
    const lines: string[] = [];
    lines.push(srT.send.greeting);
    lines.push("");
    lines.push(srT.send.summaryHeader);
    for (const { def, s, freq, monthly } of calc.items) {
      const unit = def.unit === "m²" ? srT.services.units.m2 : srT.services.units.kom;
      lines.push(
        `• ${srT.services.items[def.id].name} — ${s.quantity} ${unit}, ${srT.freq[freq.value]} (${formatRSD(monthly)} / ${srT.send.monthlySuffix})`
      );
    }
    lines.push("");
    lines.push(`${srT.send.totalLabel}: ${formatRSD(calc.total)} / ${srT.send.monthlySuffix}`);
    lines.push("");
    lines.push(srT.send.contactHeader);
    lines.push(`• ${srT.contact.name.replace(" *", "")}: ${contact.name}`);
    lines.push(`• ${srT.contact.phone.replace(" *", "")}: ${contact.phone}`);
    if (contact.city) lines.push(`• ${srT.contact.city}: ${contact.city}`);
    if (contact.address) lines.push(`• ${srT.contact.address}: ${contact.address}`);
    if (contact.notes) {
      lines.push("");
      lines.push(srT.send.notesHeader);
      lines.push(contact.notes);
    }
    lines.push("");
    lines.push(srT.send.closing);
    return lines.join("\n");
  };

  // Open URL via a real anchor click — needed for tel: schemes inside sandboxed iframes.
  const openExternal = (url: string, newTab = false) => {
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener noreferrer";
    a.target = newTab ? "_blank" : "_top";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendViaCall = () => {
    openExternal(`tel:+${BUSINESS_PHONE_INTL}`);
  };

  // Submit the order to our Cloudflare Worker, which forwards it to our Telegram bot.
  // The Worker is the only thing that holds the bot token / chat id — the static
  // GitHub Pages site stores no secrets and no data.
  const sendOrder = async () => {
    if (!validateBeforeSend()) return;
    setSending(true);
    try {
      const srT = translations["sr-Latn"];
      const userLocale = typeof navigator !== "undefined" ? navigator.language : "sr-RS";
      const payload = {
        // Pre-rendered, human-readable message — always Serbian (Latin) for the business owner
        message: buildOrderMessage(),
        // Structured fields, useful if you later want to format it server-side
        contact: {
          name: contact.name,
          phone: contact.phone,
          city: contact.city || null,
          address: contact.address || null,
          notes: contact.notes || null,
        },
        items: calc.items.map(({ def, s, freq, monthly, perVisit }) => ({
          id: def.id,
          name: srT.services.items[def.id].name,
          quantity: s.quantity,
          unit: def.unit,
          frequency: freq.value,
          perVisitRSD: Math.round(perVisit),
          monthlyRSD: Math.round(monthly),
        })),
        totalMonthlyRSD: Math.round(calc.total),
        // Locale of the message body (always Serbian Latin). User's UI locale is kept separately
        // so you can still see which language the visitor was browsing in.
        locale: "sr-Latn",
        userLocale,
        source: "zelena-oaza-web",
        sentAt: new Date().toISOString(),
      };

      const res = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Worker responded ${res.status}`);

      // Show inline success state (replaces the form). Reset consent for next order.
      setSuccess(true);
      setConsent(false);
      // Scroll to the success card so the user sees it on mobile too
      setTimeout(() => {
        document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      console.error("Order submission failed", err);
      toast({
        title: t.send.errorTitle,
        description: t.send.errorDesc,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-soft antialiased ${calc.items.length > 0 ? "pb-24 lg:pb-0" : ""}`}>
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Uređena bašta u Srbiji"
            width={1600}
            height={900}
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          {/* Aurora glow */}
          <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-aurora blur-3xl animate-aurora" />
          <div className="absolute top-20 right-0 h-[24rem] w-[24rem] rounded-full bg-gradient-aurora blur-3xl animate-aurora [animation-delay:2s] opacity-70" />
        </div>
        <nav className="relative z-10 container flex items-center justify-between py-5">
          <div className="flex items-center gap-2.5 text-primary-foreground animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl glass-dark shadow-glow">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Zelena Oaza</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:flex items-center gap-1 mr-1">
              {[
                { id: "usluge", label: t.nav.services },
                { id: "porucivanje", label: t.nav.order },
                { id: "kontakt", label: t.contact.title },
              ].map((it) => (
                <a
                  key={it.id}
                  href={`#${it.id}`}
                  className={`relative inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors text-primary-foreground/80 hover:text-primary-foreground ${
                    activeSection === it.id ? "text-primary-foreground bg-white/15 backdrop-blur" : ""
                  }`}
                >
                  {it.label}
                </a>
              ))}
            </div>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </nav>
        <div className="relative z-10 container py-20 md:py-32">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft">
              <Sparkles className="h-4 w-4 text-accent" /> {t.hero.badge}
            </span>
            <h1 className="mt-7 text-balance text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-primary-foreground drop-shadow-lg">
              {t.hero.title}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/95 leading-relaxed max-w-xl text-balance">
              {t.hero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] shadow-glow text-base font-semibold h-12 px-8 rounded-full transition-spring"
                style={{ transition: "var(--transition-spring)" }}
              >
                <a href="#porucivanje">
                  {t.hero.ctaPrimary} <ArrowRight className="ml-1 h-5 w-5" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-primary-foreground border border-white/40 hover:bg-white/20 hover:border-white/60 hover:text-primary-foreground h-12 px-7 rounded-full text-base font-medium transition-colors"
              >
                <a href="#usluge">{t.hero.ctaSecondary}</a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
              {[
                { icon: ShieldCheck, label: t.hero.trust.reliable },
                { icon: Clock, label: t.hero.trust.onTime },
                { icon: MapPin, label: t.hero.trust.allSerbia },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl glass-dark px-3 py-4 text-primary-foreground animate-fade-in-up text-center"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* SERVICE AREA BAND */}
      <div className="bg-primary/5 border-b border-primary/10 backdrop-blur">
        <div className="container py-3 flex items-center justify-center gap-2 text-center">
          <MapPin className="h-4 w-4 text-primary shrink-0 animate-pulse" />
          <p className="text-xs sm:text-sm font-medium text-foreground/90 tracking-tight">
            {t.hero.serviceArea}
          </p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="container py-16 md:py-24 bg-mesh">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
            {t.steps.title}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">{t.steps.subtitle}</h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-6">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          {[t.steps.s1, t.steps.s2, t.steps.s3].map((step, i) => (
            <div key={i} className="relative">
              <Card className="relative p-7 shadow-ring1 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur border-border/60 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-5 ring-4 ring-card">
                  <span className="text-xl font-bold">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg tracking-tight">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE/AFTER GALLERY */}
      <section className="bg-gradient-to-b from-secondary/40 via-secondary/20 to-background border-y border-border/60">
        <div className="container py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
              {t.gallery.before} / {t.gallery.after}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">{t.gallery.title}</h2>
            <p className="mt-3 text-muted-foreground text-balance">{t.gallery.subtitle}</p>
            <p className="mt-3 text-xs text-muted-foreground/80">{t.gallery.dragHint}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.gallery.items.map((it, i) => {
              const pair = GALLERY_PAIRS[i];
              if (!pair) return null;
              return (
                <div key={i} className="group space-y-3 rounded-2xl p-3 transition-all duration-300 hover:bg-card hover:shadow-elevated">
                  <div className="overflow-hidden rounded-xl ring-1 ring-border/60">
                    <BeforeAfterSlider
                      beforeSrc={pair.before}
                      afterSrc={pair.after}
                      beforeLabel={t.gallery.before}
                      afterLabel={t.gallery.after}
                      alt={it.title}
                    />
                  </div>
                  <div className="px-2 pb-1">
                    <h3 className="font-semibold text-foreground text-sm tracking-tight">{it.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES + CALCULATOR */}
      <section id="porucivanje" className="container py-16 md:py-24 scroll-mt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
            {t.summary.orderBtn}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">{t.config.sectionTitle}</h2>
          <p className="mt-4 text-muted-foreground text-lg text-balance">{t.config.sectionDesc}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Area card */}
            <Card className="p-7 shadow-elevated border-border/60 bg-gradient-to-br from-card to-secondary/30 backdrop-blur">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
                <Label htmlFor="area" className="text-base font-semibold tracking-tight">
                  {t.config.areaLabel}
                </Label>
              </div>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mt-3">
                <p className="text-sm text-muted-foreground">{t.config.areaHelp}</p>
                <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                  {area}<span className="text-lg text-muted-foreground font-medium ml-1">m²</span>
                </span>
              </div>

              <div className="mt-6">
                <Slider
                  value={[area]}
                  min={20}
                  max={1500}
                  step={10}
                  onValueChange={([v]) => setArea(v)}
                />
              </div>

              <div className="mt-6">
                <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">{t.config.presetsTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AREAS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setArea(p.value)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ring-1 active:scale-95 ${
                        area === p.value
                          ? "bg-gradient-primary text-primary-foreground ring-primary shadow-glow scale-105"
                          : "bg-card text-foreground/80 ring-border hover:ring-primary/40 hover:bg-secondary/50"
                      }`}
                    >
                      {t.config.presets[p.key]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Services grid */}
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t.services.add}
              </h3>
            </div>
            <div id="usluge" className="grid sm:grid-cols-2 gap-4">
              {SERVICES.map((svc) => {
                const isSelected = !!selected[svc.id];
                const Icon = svc.icon;
                const current = selected[svc.id];
                const item = t.services.items[svc.id];
                const liveMonthly = current
                  ? computeMonthly(svc, current).monthly
                  : 0;
                return (
                  <Card
                    key={svc.id}
                    onClick={() => toggleService(svc)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleService(svc);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    className={`group relative p-5 cursor-pointer overflow-hidden border-border/60 transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-primary shadow-elevated bg-gradient-to-br from-secondary/70 via-card to-card -translate-y-0.5"
                        : "hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 bg-card/80 backdrop-blur"
                    }`}
                  >
                    {/* Subtle glow on selected */}
                    {isSelected && (
                      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-aurora blur-2xl opacity-60" />
                    )}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground gap-1 pointer-events-none animate-scale-in shadow-soft flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" /> {t.services.selected}
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-primary text-primary-foreground shadow-glow scale-110 rotate-3"
                          : "bg-secondary text-primary group-hover:scale-105 group-hover:rotate-3"
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight pr-20 tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-2 font-medium">
                          {svc.perVisit
                            ? t.services.pricePerUnit(formatRSD(svc.perVisit))
                            : t.services.pricePerM2(svc.pricePerM2 ?? 0, formatRSD(svc.minPrice))}
                        </p>
                      </div>
                    </div>

                    {isSelected && current && (
                      <div
                        className="mt-4 pt-4 border-t border-border/60 space-y-3 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs text-muted-foreground">
                              {svc.unit === "m²" ? t.services.quantityM2 : t.services.quantityKom}
                            </Label>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button" variant="outline" size="icon"
                                className="h-7 w-7"
                                onClick={() => updateService(svc.id, { quantity: Math.max(1, current.quantity - (svc.unit === "kom" ? 1 : 10)) })}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                value={current.quantity}
                                onChange={(e) => updateService(svc.id, { quantity: parseInt(e.target.value) || 0 })}
                                className="h-7 w-20 text-center text-sm"
                              />
                              <Button
                                type="button" variant="outline" size="icon"
                                className="h-7 w-7"
                                onClick={() => updateService(svc.id, { quantity: current.quantity + (svc.unit === "kom" ? 1 : 10) })}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">
                            {t.services.frequency}
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {FREQUENCIES.map((f) => (
                              <button
                                key={f.value}
                                type="button"
                                onClick={() => updateService(svc.id, { frequency: f.value })}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-smooth ring-1 ${
                                  current.frequency === f.value
                                    ? "bg-primary text-primary-foreground ring-primary"
                                    : "bg-card text-muted-foreground ring-border hover:bg-secondary"
                                }`}
                              >
                                {t.freq[f.value]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">{t.summary.monthlyEstimate}</span>
                          <span className="text-sm font-bold text-primary tabular-nums">
                            {formatRSD(liveMonthly)} <span className="text-xs text-muted-foreground font-normal">{t.services.monthlyMini}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="lg:col-span-1">
            <Card className="p-7 shadow-elevated lg:sticky lg:top-6 bg-card/90 backdrop-blur border-border/60 overflow-hidden relative">
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-aurora blur-2xl opacity-50" />
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{t.summary.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.summary.itemsCount(calc.items.length)} · {t.summary.monthlyEstimate}
              </p>

              <div className="mt-6 space-y-3 max-h-72 overflow-y-auto pr-1 -mr-1">
                {calc.items.length === 0 && (
                  <div className="text-center py-8 px-3 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60 text-primary/60 mx-auto mb-3">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.summary.empty}</p>
                  </div>
                )}
                {calc.items.map(({ def, s, freq, monthly, perVisit }) => (
                  <div key={def.id} className="rounded-xl bg-secondary/30 p-3 animate-fade-in">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-sm text-foreground tracking-tight">{t.services.items[def.id].name}</span>
                      <span className="font-semibold text-sm text-primary tabular-nums">{formatRSD(monthly)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.quantity} {def.unit === "m²" ? t.services.units.m2 : t.services.units.kom} · {t.freq[freq.value]} · {formatRSD(perVisit)} {t.summary.perVisitSuffix}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-foreground tracking-tight">{t.summary.totalMonthly}</span>
                  <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">{formatRSD(calc.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t.summary.estimateNote}</p>
              </div>

              <Button
                size="lg"
                onClick={submit}
                disabled={calc.items.length === 0}
                className="w-full mt-6 bg-gradient-primary text-primary-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] shadow-glow text-base font-semibold h-12 rounded-full transition-all duration-200 disabled:hover:scale-100"
              >
                {t.summary.continueToContact} <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {t.summary.noObligation}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* INLINE CONTACT FORM */}
      <section id="kontakt" className="container py-16 md:py-20 scroll-mt-4">
        <div className="max-w-2xl mx-auto">
          {!success && <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
              {t.contact.title}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
              {t.summary.continueToContact}
            </h2>
            <p className="mt-3 text-muted-foreground text-balance">
              {t.summary.itemsCount(calc.items.length)} · {t.summary.totalMonthly}:{" "}
              <strong className="text-primary tabular-nums">{formatRSD(calc.total)}</strong>
            </p>
          </div>}

          {success ? (
            <Card className="p-6 md:p-10 shadow-elevated border-primary/30 bg-gradient-to-br from-card via-secondary/30 to-card backdrop-blur text-center animate-fade-in-up overflow-hidden relative">
              <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-gradient-aurora blur-3xl opacity-70" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-gradient-aurora blur-3xl opacity-50" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow mb-5 animate-scale-in">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-balance">
                  {t.send.successTitle}
                </h2>
                <p className="mt-3 text-muted-foreground text-balance max-w-md mx-auto">
                  {t.send.successIntro}
                </p>

                <div className="mt-8 text-left rounded-2xl bg-card/70 border border-border/60 p-5 max-w-md mx-auto">
                  <h3 className="font-semibold text-foreground text-sm tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" /> {t.send.whatNextTitle}
                  </h3>
                  <ol className="mt-3 space-y-2.5">
                    {t.send.whatNextSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 max-w-md mx-auto rounded-2xl bg-secondary/40 border border-border/60 p-5">
                  <p className="text-sm font-semibold text-foreground tracking-tight">{t.send.contactNowTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.send.contactNowDesc}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="gap-2 bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_34%)] text-white rounded-full shadow-soft"
                    >
                      <a href={`https://wa.me/${BUSINESS_PHONE_INTL}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-5 w-5" /> {t.send.waBtn}
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="gap-2 rounded-full">
                      <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                        <Phone className="h-5 w-5" /> {t.send.callBtn} {BUSINESS_PHONE_DISPLAY}
                      </a>
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-xs text-primary hover:underline font-medium"
                >
                  {t.send.newOrder}
                </button>
              </div>
            </Card>
          ) : (
          <Card className="p-6 md:p-8 shadow-elevated border-border/60 bg-card/90 backdrop-blur">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.name}</Label>
                <Input
                  id="name"
                  value={contact.name}
                  onChange={(e) => { setContact({ ...contact, name: e.target.value }); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined }); }}
                  maxLength={100}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`mt-1.5 h-11 rounded-xl ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {fieldErrors.name && <p id="name-error" className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.phone}</Label>
                <Input
                  id="phone"
                  value={contact.phone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContact({ ...contact, phone: v });
                    // Live validation: clear error while typing if becomes valid; show only if user typed something
                    if (v.trim().length === 0) {
                      setFieldErrors({ ...fieldErrors, phone: undefined });
                    } else if (isPhoneValid(v)) {
                      setFieldErrors({ ...fieldErrors, phone: undefined });
                    }
                  }}
                  onBlur={() => {
                    if (contact.phone.trim().length > 0 && !isPhoneValid(contact.phone)) {
                      setFieldErrors((prev) => ({ ...prev, phone: t.send.phoneInvalid }));
                    }
                  }}
                  maxLength={30}
                  placeholder="+381 ..."
                  inputMode="tel"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  className={`mt-1.5 h-11 rounded-xl ${fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {fieldErrors.phone && <p id="phone-error" className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="city" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.city}</Label>
                <Select value={contact.city} onValueChange={(v) => setContact({ ...contact, city: v })}>
                  <SelectTrigger id="city" className="mt-1.5 h-11 rounded-xl">
                    <SelectValue placeholder={t.contact.cityPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.address}</Label>
                <Input id="address" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} maxLength={150} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.notes}</Label>
                <Textarea
                  id="notes"
                  value={contact.notes}
                  onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                  maxLength={1000}
                  placeholder={t.contact.notesPlaceholder}
                  rows={3}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-secondary/40 border border-border/60 p-3 text-xs text-muted-foreground leading-relaxed flex gap-2.5">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t.privacy.inlineNotice}</span>
            </div>

            <div className={`mt-3 flex items-start gap-2.5 rounded-xl p-3 transition-colors ${fieldErrors.consent ? "bg-destructive/5 ring-1 ring-destructive/40" : "hover:bg-secondary/30"}`}>
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(v) => { setConsent(v === true); if (v) setFieldErrors({ ...fieldErrors, consent: undefined }); }}
                className="mt-0.5"
              />
              <Label htmlFor="consent" className="text-xs leading-relaxed text-foreground font-normal cursor-pointer">
                {t.privacy.consentLabel}{" "}
                <button type="button" onClick={() => setPrivacyOpen(true)} className="text-primary underline hover:no-underline font-medium">
                  {t.privacy.consentLink}
                </button>
                .
                {fieldErrors.consent && <span className="block text-destructive mt-1">{fieldErrors.consent}</span>}
              </Label>
            </div>

            <Button
              type="button"
              onClick={sendOrder}
              disabled={sending || calc.items.length === 0}
              size="lg"
              className="w-full mt-6 gap-2 bg-gradient-primary text-primary-foreground shadow-glow font-semibold h-12 rounded-full"
            >
              {sending ? (<><Loader2 className="h-4 w-4 animate-spin" /> {t.send.submitting}</>) : (<><Send className="h-4 w-4" /> {t.send.submit}</>)}
            </Button>

            <div className="mt-4 rounded-xl bg-muted/40 border border-dashed border-border/60 p-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-muted-foreground flex-1 min-w-[10rem]">{t.send.chooseDesc}</p>
              <Button type="button" onClick={sendViaCall} size="sm" variant="outline" className="gap-2 rounded-full">
                <Phone className="h-4 w-4" /> {t.send.callFallback} {BUSINESS_PHONE_DISPLAY}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1 mt-4">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {t.summary.noObligation}
            </p>
          </Card>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10 tracking-tight text-balance">
            {t.faq.title}
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {t.faq.items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border/60 rounded-2xl px-5 bg-card/60 backdrop-blur data-[state=open]:shadow-soft data-[state=open]:border-primary/30 transition-all">
                <AccordionTrigger className="text-left font-semibold hover:no-underline tracking-tight py-5">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-gradient-to-b from-card to-secondary/30">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 text-foreground font-semibold tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-base">Zelena Oaza</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2 rounded-full border-border/60 hover:border-primary/40">
                <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                  <Phone className="h-4 w-4" /> {t.footer.call}
                </a>
              </Button>
              <Button asChild size="sm" className="gap-2 bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_34%)] text-primary-foreground rounded-full shadow-soft">
                <a href={`https://wa.me/${BUSINESS_PHONE_INTL}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> {t.footer.whatsapp}
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col items-center gap-2">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Zelena Oaza · {t.footer.tagline}
            </p>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {t.privacy.footerLink}
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      {calc.items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60 shadow-elevated animate-fade-in-up">
          <div className="container flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight uppercase tracking-wider">
                {t.summary.itemsCount(calc.items.length)} · {t.summary.totalMonthly}
              </p>
              <p className="text-xl font-bold text-primary leading-tight tabular-nums truncate tracking-tight">
                {formatRSD(calc.total)}
              </p>
            </div>
            <Button
              onClick={submit}
              size="lg"
              className="bg-gradient-primary text-primary-foreground shadow-glow font-semibold gap-1 shrink-0 rounded-full px-6 active:scale-95 transition-transform"
            >
              {t.summary.orderBtn} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${BUSINESS_PHONE_INTL}`}
        target="_blank"
        rel="noreferrer"
        aria-label={t.footer.whatsapp}
        className={`fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142_70%_38%)] text-white shadow-elevated hover:scale-110 active:scale-95 transition-transform ${
          calc.items.length > 0 ? "bottom-24 lg:bottom-6" : "bottom-6"
        }`}
      >
        <MessageCircle className="h-7 w-7" />
        <span className="sr-only">{t.footer.whatsapp}</span>
      </a>

      {/* PRIVACY POLICY DIALOG */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {t.privacy.dialogTitle}
            </DialogTitle>
            <DialogDescription>{t.privacy.lastUpdated}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {t.privacy.sections.map((s, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPrivacyOpen(false)}>
              {t.privacy.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GardenLanding;