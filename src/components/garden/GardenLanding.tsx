import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Leaf, Droplets, Scissors, Sprout, Fence, Trees, Trash2, Flower2,
  ShieldCheck, MapPin, ArrowRight, Phone, CheckCircle2, MessageCircle, Send, Loader2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  frequency: Frequency;
  quantityScale?: number; // share of the garden area this service usually covers
}

const SERVICES: ServiceDef[] = [
  { id: "kosenje",    icon: Scissors, pricePerM2: 25, minPrice: 2500, unit: "m²", frequency: "1x_nedeljno", quantityScale: 1 },
  { id: "zalivanje",  icon: Droplets, pricePerM2: 8,  minPrice: 1500, unit: "m²", frequency: "2x_nedeljno", quantityScale: 1 },
  { id: "plevljenje", icon: Sprout,   pricePerM2: 35, minPrice: 2000, unit: "m²", frequency: "1x_mesecno", quantityScale: 0.3 },
  { id: "zivica",     icon: Fence, pricePerM2: 90, minPrice: 3000, unit: "m²", frequency: "1x_mesecno", quantityScale: 0.15 },
  { id: "drvece",     icon: Trees, perVisit: 1500, minPrice: 1500, unit: "kom", frequency: "po_potrebi" },
  { id: "ciscenje",   icon: Trash2,   pricePerM2: 12, minPrice: 2000, unit: "m²", frequency: "2x_mesecno", quantityScale: 1 },
  { id: "cvece",      icon: Flower2,  pricePerM2: 60, minPrice: 2500, unit: "m²", frequency: "po_potrebi", quantityScale: 0.2 },
  { id: "djubrenje",  icon: Leaf,     pricePerM2: 15, minPrice: 1800, unit: "m²", frequency: "1x_mesecno", quantityScale: 1 },
];

const VISITS_PER_MONTH: Record<Frequency, number> = {
  "2x_nedeljno": 8,
  "1x_nedeljno": 4,
  "2x_mesecno": 2,
  "1x_mesecno": 1,
  "po_potrebi": 1,
};

const SIZES = [
  { value: 50, key: "small" as const },
  { value: 150, key: "medium" as const },
  { value: 400, key: "large" as const },
  { value: 800, key: "estate" as const },
];

const quantityFor = (def: ServiceDef, area: number) =>
  def.unit === "kom" ? 1 : Math.max(10, Math.round(area * (def.quantityScale ?? 1)));

const monthlyFor = (def: ServiceDef, quantity: number) => {
  const perVisit = def.perVisit
    ? def.perVisit * quantity
    : Math.max(def.minPrice, (def.pricePerM2 || 0) * quantity);
  return perVisit * VISITS_PER_MONTH[def.frequency];
};

// Fades content in once it scrolls into view (skipped for reduced-motion users via CSS).
const Reveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "is-shown" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const GardenLanding = () => {
  const { t, formatPrice: formatRSD, formatEurApprox } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [area, setArea] = useState<number>(150);
  const [contact, setContact] = useState({ name: "", phone: "", city: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "phone" | "consent", string>>>({});
  const [success, setSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t.toasts.missingDesc).max(100),
        phone: z
          .string()
          .trim()
          .min(6, t.toasts.missingDesc)
          .max(30)
          .regex(/^[+\d][\d\s\-()]{5,}$/, t.send.phoneInvalid),
        consent: z.literal(true, { errorMap: () => ({ message: t.privacy.consentRequired }) }),
      }),
    [t],
  );

  const toggleService = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const calc = useMemo(() => {
    const items = SERVICES.filter((d) => selected.includes(d.id)).map((def) => {
      const quantity = quantityFor(def, area);
      return { def, quantity, monthly: monthlyFor(def, quantity) };
    });
    return { items, total: items.reduce((sum, i) => sum + i.monthly, 0) };
  }, [selected, area]);

  const validateBeforeSend = () => {
    const result = contactSchema.safeParse({ name: contact.name, phone: contact.phone, consent });
    if (!result.success) {
      const errs: Partial<Record<"name" | "phone" | "consent", string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as "name" | "phone" | "consent";
        if (!errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      toast({ title: t.toasts.missingTitle, description: Object.values(errs)[0], variant: "destructive" });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const buildOrderMessage = () => {
    // Telegram messages are always sent in Serbian (Latin), regardless of UI locale,
    // so the business owner gets a consistent format.
    const srT = translations["sr-Latn"];
    const lines: string[] = [srT.send.greeting, ""];
    lines.push(`${srT.config.areaLabel}: ${area} m²`);
    lines.push("");
    lines.push(srT.send.summaryHeader);
    if (calc.items.length === 0) lines.push("• —");
    for (const { def } of calc.items) lines.push(`• ${srT.services.items[def.id].name}`);
    lines.push("");
    lines.push(`${srT.send.totalLabel}: ~${formatRSD(calc.total)} / ${srT.send.monthlySuffix}`);
    lines.push("");
    lines.push(srT.send.contactHeader);
    lines.push(`• ${srT.contact.name.replace(" *", "")}: ${contact.name}`);
    lines.push(`• ${srT.contact.phone.replace(" *", "")}: ${contact.phone}`);
    if (contact.city) lines.push(`• ${srT.contact.city}: ${contact.city}`);
    if (contact.notes) {
      lines.push("");
      lines.push(srT.send.notesHeader);
      lines.push(contact.notes);
    }
    lines.push("");
    lines.push(srT.send.closing);
    return lines.join("\n");
  };

  // Submit the order to our Cloudflare Worker, which forwards it to our Telegram bot.
  // The Worker is the only thing that holds the bot token / chat id — the static
  // GitHub Pages site stores no secrets and no data.
  const sendOrder = async () => {
    if (!validateBeforeSend()) return;
    setSending(true);
    try {
      const srT = translations["sr-Latn"];
      const payload = {
        message: buildOrderMessage(),
        contact: {
          name: contact.name,
          phone: contact.phone,
          city: contact.city || null,
          address: null,
          notes: contact.notes || null,
        },
        areaM2: area,
        items: calc.items.map(({ def, quantity, monthly }) => ({
          id: def.id,
          name: srT.services.items[def.id].name,
          quantity,
          unit: def.unit,
          frequency: def.frequency,
          monthlyRSD: Math.round(monthly),
        })),
        totalMonthlyRSD: Math.round(calc.total),
        locale: "sr-Latn",
        userLocale: typeof navigator !== "undefined" ? navigator.language : "sr-RS",
        source: "zelena-oaza-web",
        sentAt: new Date().toISOString(),
      };

      const res = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Worker responded ${res.status}`);

      setSuccess(true);
      setConsent(false);
      setTimeout(() => {
        document.getElementById("anfrage")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      console.error("Order submission failed", err);
      toast({ title: t.send.errorTitle, description: t.send.errorDesc, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const questionClass = "text-lg font-semibold text-foreground tracking-tight";

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* HERO */}
      {/* STICKY TOP BAR — transparent over the hero, solid once scrolled */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-[hsl(142_40%_12%/0.88)] backdrop-blur-md shadow-elevated" : "bg-transparent"
        }`}
      >
        <div className={`container flex items-center justify-between gap-3 transition-all duration-300 ${scrolled ? "py-2.5" : "py-5"}`}>
          <a href="#" className="flex items-center gap-2.5 text-white" aria-label="Zelena Oaza">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">Zelena Oaza</span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#anfrage"
              className={`hidden sm:inline-flex h-9 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-soft transition-all duration-300 hover:brightness-105 ${
                scrolled ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
              }`}
              tabIndex={scrolled ? 0 : -1}
            >
              {t.simple.heroCta}
            </a>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Uređena bašta u Srbiji"
            width={1600}
            height={900}
            className="h-full w-full object-cover animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(142_45%_8%/0.85)] via-[hsl(142_45%_8%/0.55)] to-[hsl(142_45%_8%/0.15)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative z-10 container pt-32 pb-24 md:pt-44 md:pb-36">
          <div className="max-w-2xl">
            <h1 className="animate-fade-in-up text-balance text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm">
              {t.hero.title}
            </h1>
            <p className="animate-fade-in-up [animation-delay:120ms] mt-5 text-lg md:text-xl text-white/90 leading-relaxed text-balance">
              {t.hero.subtitle}
            </p>
            <div className="animate-fade-in-up [animation-delay:240ms] mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group h-12 px-8 rounded-full text-base font-semibold bg-accent text-accent-foreground shadow-glow hover:bg-accent hover:brightness-105 hover:-translate-y-0.5 transition-all"
              >
                <a href="#anfrage">
                  {t.simple.heroCta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-7 rounded-full text-base bg-white/10 text-white border-white/50 hover:bg-white/20 hover:text-white"
              >
                <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                  <Phone className="h-5 w-5" /> {BUSINESS_PHONE_DISPLAY}
                </a>
              </Button>
            </div>
            <p className="animate-fade-in-up [animation-delay:360ms] mt-7 inline-flex items-start gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/20 backdrop-blur">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              {t.hero.serviceArea}
            </p>
          </div>
        </div>
      </header>

      {/* BEFORE/AFTER GALLERY */}
      <section className="bg-gradient-soft border-b border-border/60">
        <div className="container py-14 md:py-20">
          <Reveal>
            <h2 className="text-center max-w-2xl mx-auto mb-10 text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
              {t.gallery.title}
            </h2>
          </Reveal>
          <div className="max-w-4xl mx-auto space-y-10">
            {t.gallery.items.map((it, i) => {
              const pair = GALLERY_PAIRS[i];
              if (!pair) return null;
              return (
                <Reveal key={i}>
                <figure className="group">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { src: pair.before, label: t.gallery.before, badge: "bg-background/90 text-foreground" },
                      { src: pair.after, label: t.gallery.after, badge: "bg-primary text-primary-foreground" },
                    ].map((img) => (
                      <div key={img.label} className="relative overflow-hidden rounded-2xl ring-1 ring-border/60 aspect-[4/3] bg-muted shadow-soft">
                        <img
                          src={img.src}
                          alt={`${it.title} — ${img.label}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <span className={`absolute top-2 left-2 rounded-full px-3 py-1 text-sm font-semibold shadow-soft ${img.badge}`}>
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <figcaption className="mt-3 px-1 flex items-center gap-2 font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {it.title}
                  </figcaption>
                </figure>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="anfrage" className="relative bg-mesh py-14 md:py-24 scroll-mt-16">
        <div className="container max-w-2xl">
          {success ? (
            <Card className="p-6 md:p-10 text-center shadow-elevated animate-scale-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-foreground tracking-tight text-balance">
                {t.send.successTitle}
              </h2>
              <p className="mt-3 text-muted-foreground text-balance">{t.send.successIntro}</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <Button asChild size="lg" className="gap-2 rounded-full bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_34%)] text-white">
                  <a href={`https://wa.me/${BUSINESS_PHONE_INTL}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" /> {t.send.waBtn}
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 rounded-full">
                  <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                    <Phone className="h-5 w-5" /> {t.send.callBtn}
                  </a>
                </Button>
              </div>
              <button
                type="button"
                onClick={() => { setSuccess(false); setSelected([]); }}
                className="mt-6 text-sm text-primary hover:underline font-medium"
              >
                {t.send.newOrder}
              </button>
            </Card>
          ) : (
            <>
              <Reveal className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{t.simple.formTitle}</h2>
                <p className="mt-3 text-muted-foreground text-lg text-balance">{t.simple.formDesc}</p>
              </Reveal>

              <Reveal delay={100}>
              <Card className="p-5 md:p-8 space-y-8 shadow-elevated border-border/60">
                {/* 1. Services */}
                <div>
                  <h3 className={questionClass}>{t.simple.servicesQ}</h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                    {SERVICES.map((svc) => {
                      const isSelected = selected.includes(svc.id);
                      const Icon = svc.icon;
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => toggleService(svc.id)}
                          aria-pressed={isSelected}
                          className={`flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-soft"
                              : "border-border hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-soft"
                          }`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                            isSelected ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-primary"
                          }`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="flex-1 font-medium text-foreground">{t.services.items[svc.id].name}</span>
                          {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary animate-scale-in" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Garden size */}
                <div>
                  <h3 className={questionClass}>{t.simple.sizeQ}</h3>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SIZES.map((size) => (
                      <button
                        key={size.key}
                        type="button"
                        onClick={() => setArea(size.value)}
                        aria-pressed={area === size.value}
                        className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                          area === size.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-foreground/80 hover:border-primary/50"
                        }`}
                      >
                        {t.config.presets[size.key]}
                      </button>
                    ))}
                  </div>
                  {calc.total > 0 && (
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 ring-1 ring-primary/20 p-4 animate-fade-in">
                      <p className="text-foreground">
                        {t.simple.estimate}{" "}
                        <strong className="text-primary text-lg tabular-nums">~{formatRSD(calc.total)}</strong>{" "}
                        {t.simple.perMonth}{" "}
                        <span className="text-sm text-muted-foreground tabular-nums">({formatEurApprox(calc.total)})</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.summary.estimateNote}</p>
                    </div>
                  )}
                </div>

                {/* 3. Contact */}
                <div>
                  <h3 className={questionClass}>{t.simple.contactQ}</h3>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t.contact.name}</Label>
                      <Input
                        id="name"
                        value={contact.name}
                        onChange={(e) => { setContact({ ...contact, name: e.target.value }); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined }); }}
                        maxLength={100}
                        autoComplete="name"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? "name-error" : undefined}
                        className={`mt-1.5 h-12 text-base ${fieldErrors.name ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.name && <p id="name-error" className="text-sm text-destructive mt-1">{fieldErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.contact.phone}</Label>
                      <Input
                        id="phone"
                        value={contact.phone}
                        onChange={(e) => { setContact({ ...contact, phone: e.target.value }); if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined }); }}
                        maxLength={30}
                        placeholder="+381 ..."
                        inputMode="tel"
                        autoComplete="tel"
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                        className={`mt-1.5 h-12 text-base ${fieldErrors.phone ? "border-destructive" : ""}`}
                      />
                      {fieldErrors.phone && <p id="phone-error" className="text-sm text-destructive mt-1">{fieldErrors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="city">{t.contact.city}</Label>
                      <Select value={contact.city} onValueChange={(v) => setContact({ ...contact, city: v })}>
                        <SelectTrigger id="city" className="mt-1.5 h-12 text-base">
                          <SelectValue placeholder={t.contact.cityPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="notes">{t.contact.notes}</Label>
                      <Textarea
                        id="notes"
                        value={contact.notes}
                        onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                        maxLength={1000}
                        placeholder={t.contact.notesPlaceholder}
                        rows={3}
                        className="mt-1.5 text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={(v) => { setConsent(v === true); if (v) setFieldErrors({ ...fieldErrors, consent: undefined }); }}
                      className="mt-0.5 h-5 w-5"
                    />
                    <Label htmlFor="consent" className="text-sm leading-relaxed font-normal cursor-pointer">
                      {t.privacy.consentLabel}{" "}
                      <button type="button" onClick={() => setPrivacyOpen(true)} className="text-primary underline hover:no-underline">
                        {t.privacy.consentLink}
                      </button>
                      .
                      {fieldErrors.consent && <span className="block text-destructive mt-1">{fieldErrors.consent}</span>}
                    </Label>
                  </div>

                  <Button
                    type="button"
                    onClick={sendOrder}
                    disabled={sending}
                    size="lg"
                    className="w-full gap-2 h-14 rounded-full text-lg font-semibold bg-gradient-primary shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                  >
                    {sending
                      ? (<><Loader2 className="h-5 w-5 animate-spin" /> {t.send.submitting}</>)
                      : (<><Send className="h-5 w-5" /> {t.send.submit}</>)}
                  </Button>

                  <p className="text-center text-muted-foreground">
                    {t.simple.orCall}{" "}
                    <a href={`tel:+${BUSINESS_PHONE_INTL}`} className="font-semibold text-primary whitespace-nowrap hover:underline">
                      {BUSINESS_PHONE_DISPLAY}
                    </a>
                  </p>
                </div>
              </Card>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-soft border-y border-border/60">
        <div className="container py-14 md:py-20 max-w-2xl">
          <Reveal>
          <h2 className="text-3xl font-bold text-foreground text-center mb-8 tracking-tight">{t.faq.title}</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {t.faq.items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border/60 rounded-xl px-5 bg-card transition-shadow data-[state=open]:shadow-soft data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">{it.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container py-10 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Leaf className="h-5 w-5 text-primary" /> Zelena Oaza
        </div>
        <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
        <a href={`tel:+${BUSINESS_PHONE_INTL}`} className="text-sm font-medium text-primary hover:underline">
          {BUSINESS_PHONE_DISPLAY}
        </a>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zelena Oaza ·{" "}
          <button type="button" onClick={() => setPrivacyOpen(true)} className="hover:underline">
            {t.privacy.footerLink}
          </button>
        </p>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${BUSINESS_PHONE_INTL}`}
        target="_blank"
        rel="noreferrer"
        aria-label={t.footer.whatsapp}
        className="fixed right-4 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142_70%_38%)] text-white shadow-elevated hover:scale-105 transition-transform"
      >
        <MessageCircle className="h-7 w-7" />
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
