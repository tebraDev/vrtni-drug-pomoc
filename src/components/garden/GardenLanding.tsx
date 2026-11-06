import { useEffect, useMemo, useState } from "react";
import {
  Leaf, Droplets, Scissors, Sprout, Fence, Trees, Trash2, Flower2,
  ShieldCheck, MapPin, Phone, Check, MessageCircle, Loader2,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { useI18n } from "@/i18n/I18nContext";
import { translations } from "@/i18n/translations";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import BeforeAfter from "./BeforeAfter";
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
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide the header's quote button while the form itself is on screen — it would point to where the user already is.
  useEffect(() => {
    const el = document.getElementById("anfrage");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const showHeaderCta = scrolled && !formInView;

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t.toasts.missingDesc).max(100),
        phone: z
          .string()
          .trim()
          .min(6, t.send.phoneInvalid)
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
      // Take the user straight to the first field that needs fixing.
      const firstId = (["name", "phone", "consent"] as const).find((k) => errs[k]);
      const firstEl = firstId && document.getElementById(firstId);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
        firstEl.focus({ preventScroll: true });
      }
      toast({ title: t.toasts.missingTitle, description: errs[firstId ?? "name"], variant: "destructive" });
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

  const steps = [t.steps.s1, t.steps.s2, t.steps.s3].map((s) => ({
    title: s.title.replace(/^\d+\.\s*/, ""),
    desc: s.desc,
  }));
  const [lawn, ...otherPairs] = GALLERY_PAIRS;

  const tileBase =
    "flex items-center gap-3 rounded-md border px-3.5 py-3 text-left transition-colors duration-150";
  const tileOn = "border-primary bg-primary/10 text-foreground";
  const tileOff = "border-input bg-card hover:border-primary/60";

  const estimateBlock = (
    <>
      <p className="font-display text-4xl font-semibold tabular-nums tracking-tight text-foreground">
        ~{formatRSD(calc.total)}
      </p>
      <p className="mt-1 text-muted-foreground">
        {t.simple.perMonth} <span className="tabular-nums">({formatEurApprox(calc.total)})</span>
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#anfrage"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-card focus:px-4 focus:py-2"
      >
        {t.simple.heroCta}
      </a>

      {/* HEADER — quiet, always readable; the phone number is visible text, not hidden behind an icon */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
          <a href="#" className="flex items-center gap-2 text-foreground" aria-label="Zelena Oaza">
            <Leaf className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className={`font-display text-xl font-semibold tracking-tight ${showHeaderCta ? "hidden min-[420px]:inline" : ""}`}>
              Zelena Oaza
            </span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={`tel:+${BUSINESS_PHONE_INTL}`}
              className="hidden items-center gap-2 rounded px-2 py-1 font-medium text-foreground tabular-nums hover:text-primary md:inline-flex"
            >
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              {BUSINESS_PHONE_DISPLAY}
            </a>
            {showHeaderCta && (
              <a
                href="#anfrage"
                className="inline-flex h-9 items-center whitespace-nowrap rounded-md bg-accent px-3.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              >
                {t.simple.heroCta}
              </a>
            )}
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* HERO — the proof is the headline's partner: drag the lawn from overgrown to mown */}
      <header className="container px-4 pb-16 pt-10 sm:px-8 md:pb-24 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <div className="max-w-xl">
            <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.6rem]">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-md bg-accent px-7 text-lg font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <a href="#anfrage">{t.simple.heroCta}</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 gap-2 rounded-md border-input bg-transparent px-6 text-lg font-medium tabular-nums hover:bg-secondary"
              >
                <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                  <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </Button>
            </div>
            <p className="mt-8 flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{t.hero.serviceArea}</span>
            </p>
          </div>

          {lawn && (
            <figure>
              <BeforeAfter
                before={lawn.before}
                after={lawn.after}
                subject={t.gallery.items[0].title}
                beforeLabel={t.gallery.before}
                afterLabel={t.gallery.after}
                intro
                eager
                className="aspect-[4/3] w-full"
              />
              <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-muted-foreground">
                <span className="font-medium text-foreground">{t.gallery.items[0].title}</span>
                <span>{t.gallery.subtitle}</span>
              </figcaption>
            </figure>
          )}
        </div>
      </header>

      {/* HOW IT WORKS — a real three-step sequence, so it gets numbers */}
      <section className="border-y border-border bg-secondary/60">
        <div className="container px-4 py-14 sm:px-8 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t.steps.title}</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <li key={i} className="border-t-2 border-primary pt-5">
                <span className="font-display text-5xl font-semibold leading-none text-primary tabular-nums" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* MORE BEFORE / AFTER */}
      <section className="container px-4 py-16 sm:px-8 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t.gallery.title}</h2>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8">
          {otherPairs.map((pair, idx) => {
            const it = t.gallery.items[idx + 1];
            if (!it) return null;
            return (
              <figure key={idx}>
                <BeforeAfter
                  before={pair.before}
                  after={pair.after}
                  subject={it.title}
                  beforeLabel={t.gallery.before}
                  afterLabel={t.gallery.after}
                  className="aspect-[4/3] w-full"
                />
                <figcaption className="mt-3">
                  <span className="block font-medium text-foreground">{it.title}</span>
                  <span className="block text-muted-foreground">{it.desc}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="anfrage" className="scroll-mt-20 border-t border-border bg-card">
        <div className="container px-4 py-16 sm:px-8 md:py-24">
          {success ? (
            <div className="mx-auto max-w-xl py-6 text-center" role="status">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{t.send.successTitle}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t.send.successIntro}</p>
              <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
                {t.send.whatNextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display font-semibold text-primary tabular-nums">{i + 1}.</span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-12 gap-2 rounded-md bg-[#1f7a43] text-white hover:bg-[#1a6a3a]">
                  <a href={`https://wa.me/${BUSINESS_PHONE_INTL}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t.send.waBtn}
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 gap-2 rounded-md">
                  <a href={`tel:+${BUSINESS_PHONE_INTL}`}>
                    <Phone className="h-5 w-5" aria-hidden="true" /> {t.send.callBtn}
                  </a>
                </Button>
              </div>
              <button
                type="button"
                onClick={() => { setSuccess(false); setSelected([]); }}
                className="mt-8 font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                {t.send.newOrder}
              </button>
            </div>
          ) : (
            <>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t.simple.formTitle}</h2>
                <p className="mt-3 text-lg text-muted-foreground">{t.simple.formDesc}</p>
              </div>

              <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
                <div className="space-y-12">
                  {/* 1. Services */}
                  <fieldset>
                    <legend className="font-display text-xl font-semibold text-foreground">{t.simple.servicesQ}</legend>
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {SERVICES.map((svc) => {
                        const isSelected = selected.includes(svc.id);
                        const Icon = svc.icon;
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => toggleService(svc.id)}
                            aria-pressed={isSelected}
                            className={`${tileBase} ${isSelected ? tileOn : tileOff}`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 ${
                                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input"
                              }`}
                              aria-hidden="true"
                            >
                              {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                            </span>
                            <span className="flex-1 font-medium">{t.services.items[svc.id].name}</span>
                            <Icon className="h-5 w-5 shrink-0 text-primary/70" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* 2. Garden size */}
                  <fieldset>
                    <legend className="font-display text-xl font-semibold text-foreground">{t.simple.sizeQ}</legend>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {SIZES.map((size) => (
                        <button
                          key={size.key}
                          type="button"
                          onClick={() => setArea(size.value)}
                          aria-pressed={area === size.value}
                          className={`${tileBase} justify-center text-center font-medium ${area === size.value ? tileOn : tileOff}`}
                        >
                          {t.config.presets[size.key]}
                        </button>
                      ))}
                    </div>
                    {calc.total > 0 && (
                      <div className="mt-5 rounded-md border-l-4 border-primary bg-secondary/70 p-4 lg:hidden" aria-live="polite">
                        <p className="text-muted-foreground">{t.simple.estimate}</p>
                        {estimateBlock}
                        <p className="mt-2 text-sm text-muted-foreground">{t.summary.estimateNote}</p>
                      </div>
                    )}
                  </fieldset>

                  {/* 3. Contact */}
                  <fieldset>
                    <legend className="font-display text-xl font-semibold text-foreground">{t.simple.contactQ}</legend>
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name" className="text-base">{t.contact.name}</Label>
                        <Input
                          id="name"
                          value={contact.name}
                          onChange={(e) => { setContact({ ...contact, name: e.target.value }); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined }); }}
                          maxLength={100}
                          autoComplete="name"
                          aria-invalid={!!fieldErrors.name}
                          aria-describedby={fieldErrors.name ? "name-error" : undefined}
                          className={`mt-1.5 h-12 border-input bg-background text-base ${fieldErrors.name ? "border-destructive" : ""}`}
                        />
                        {fieldErrors.name && <p id="name-error" className="mt-1.5 text-sm text-destructive">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-base">{t.contact.phone}</Label>
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
                          className={`mt-1.5 h-12 border-input bg-background text-base ${fieldErrors.phone ? "border-destructive" : ""}`}
                        />
                        {fieldErrors.phone && <p id="phone-error" className="mt-1.5 text-sm text-destructive">{fieldErrors.phone}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="city" className="text-base">{t.contact.city}</Label>
                        <Select value={contact.city} onValueChange={(v) => setContact({ ...contact, city: v })}>
                          <SelectTrigger id="city" className="mt-1.5 h-12 border-input bg-background text-base">
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
                        <Label htmlFor="notes" className="text-base">{t.contact.notes}</Label>
                        <Textarea
                          id="notes"
                          value={contact.notes}
                          onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                          maxLength={1000}
                          placeholder={t.contact.notesPlaceholder}
                          rows={3}
                          className="mt-1.5 border-input bg-background text-base"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={consent}
                        onCheckedChange={(v) => { setConsent(v === true); if (v) setFieldErrors({ ...fieldErrors, consent: undefined }); }}
                        className="mt-1 h-5 w-5"
                      />
                      <Label htmlFor="consent" className="cursor-pointer text-base font-normal leading-relaxed">
                        {t.privacy.consentLabel}{" "}
                        <button type="button" onClick={() => setPrivacyOpen(true)} className="text-primary underline underline-offset-4 hover:no-underline">
                          {t.privacy.consentLink}
                        </button>
                        .
                        {fieldErrors.consent && <span className="mt-1.5 block text-sm text-destructive">{fieldErrors.consent}</span>}
                      </Label>
                    </div>

                    <Button
                      type="button"
                      onClick={sendOrder}
                      disabled={sending}
                      size="lg"
                      className="h-14 w-full gap-2 rounded-md bg-accent text-lg font-semibold text-accent-foreground hover:bg-accent/90 sm:w-auto sm:px-10"
                    >
                      {sending
                        ? (<><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {t.send.submitting}</>)
                        : t.simple.heroCta}
                    </Button>

                    <p className="text-muted-foreground">
                      {t.simple.orCall}{" "}
                      <a href={`tel:+${BUSINESS_PHONE_INTL}`} className="whitespace-nowrap font-semibold text-primary tabular-nums underline-offset-4 hover:underline">
                        {BUSINESS_PHONE_DISPLAY}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Running estimate — sticky alongside the form on wide screens */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-lg border border-border bg-background p-6" aria-live="polite">
                    <h3 className="text-lg font-semibold text-foreground">{t.summary.title}</h3>
                    {calc.items.length === 0 ? (
                      <p className="mt-3 text-muted-foreground">{t.summary.empty}</p>
                    ) : (
                      <>
                        <ul className="mt-4 space-y-2 border-b border-border pb-4">
                          {calc.items.map(({ def }) => (
                            <li key={def.id} className="flex gap-2 text-foreground">
                              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                              {t.services.items[def.id].name}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-muted-foreground">{t.simple.estimate}</p>
                        {estimateBlock}
                        <p className="mt-3 text-sm text-muted-foreground">{t.summary.estimateNote}</p>
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="container grid gap-8 px-4 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t.faq.title}</h2>
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {t.faq.items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="py-5 text-left text-lg font-semibold hover:no-underline">{it.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-band text-band-foreground">
        <div className="container grid gap-8 px-4 py-14 sm:px-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="flex items-center gap-2 font-display text-2xl font-semibold">
              <Leaf className="h-5 w-5" aria-hidden="true" /> Zelena Oaza
            </p>
            <p className="mt-3 max-w-md text-band-foreground/75">{t.footer.tagline}</p>
          </div>
          <div className="md:text-right">
            <a
              href={`tel:+${BUSINESS_PHONE_INTL}`}
              className="font-display text-3xl font-semibold tabular-nums underline-offset-4 hover:underline"
            >
              {BUSINESS_PHONE_DISPLAY}
            </a>
            <p className="mt-4 text-sm text-band-foreground/70">
              © {new Date().getFullYear()} Zelena Oaza
              <span className="mx-3" aria-hidden="true">/</span>
              <button type="button" onClick={() => setPrivacyOpen(true)} className="underline underline-offset-4 hover:no-underline">
                {t.privacy.footerLink}
              </button>
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={`https://wa.me/${BUSINESS_PHONE_INTL}`}
        target="_blank"
        rel="noreferrer"
        aria-label={t.footer.whatsapp}
        className={`fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a43] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-300 hover:bg-[#1a6a3a] ${
          // Wait until the hero (which has its own call button) is scrolled past, so it doesn't sit on the
          // slider. On phones also step aside while the form is on screen: it would cover the tile check
          // marks, and the form offers its own call option.
          !scrolled
            ? "pointer-events-none translate-y-4 opacity-0"
            : formInView ? "max-lg:pointer-events-none max-lg:translate-y-4 max-lg:opacity-0" : ""
        }`}
        tabIndex={scrolled ? undefined : -1}
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>

      {/* PRIVACY POLICY DIALOG */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> {t.privacy.dialogTitle}
            </DialogTitle>
            <DialogDescription>{t.privacy.lastUpdated}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            {t.privacy.sections.map((s, i) => (
              <div key={i}>
                <h3 className="font-sans text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
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
