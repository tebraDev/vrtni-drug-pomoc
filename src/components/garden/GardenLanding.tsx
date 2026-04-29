import { useEffect, useMemo, useState } from "react";
import {
  Leaf, Droplets, Scissors, Sprout, TreePine, Trash2, Flower2, Sparkles,
  ShieldCheck, Clock, MapPin, Phone, CheckCircle2, Star, Plus, Minus,
  ArrowRight, MessageCircle, ChevronDown, Mail,
} from "lucide-react";
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
import LanguageSwitcher from "./LanguageSwitcher";
import BeforeAfterSlider from "./BeforeAfterSlider";
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
const BUSINESS_EMAIL = "kontakt@zelenaoaza.rs";

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
  const [contactOpen, setContactOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

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
    if (calc.items.length === 0) {
      toast({ title: t.toasts.selectTitle, description: t.toasts.selectDesc, variant: "destructive" });
      return;
    }
    setContactOpen(true);
  };

  const validateBeforeSend = () => {
    if (!contact.name || !contact.phone) {
      toast({ title: t.toasts.missingTitle, description: t.toasts.missingDesc, variant: "destructive" });
      return false;
    }
    if (!consent) {
      toast({ title: t.toasts.missingTitle, description: t.privacy.consentRequired, variant: "destructive" });
      return false;
    }
    return true;
  };

  const buildOrderMessage = () => {
    const lines: string[] = [];
    lines.push(t.send.greeting);
    lines.push("");
    lines.push(t.send.summaryHeader);
    for (const { def, s, freq, monthly } of calc.items) {
      const unit = def.unit === "m²" ? t.services.units.m2 : t.services.units.kom;
      lines.push(
        `• ${t.services.items[def.id].name} — ${s.quantity} ${unit}, ${t.freq[freq.value]} (${formatRSD(monthly)}/mo)`
      );
    }
    lines.push("");
    lines.push(`${t.send.totalLabel}: ${formatRSD(calc.total)}`);
    lines.push("");
    lines.push(t.send.contactHeader);
    lines.push(`• ${t.contact.name.replace(" *", "")}: ${contact.name}`);
    lines.push(`• ${t.contact.phone.replace(" *", "")}: ${contact.phone}`);
    if (contact.city) lines.push(`• ${t.contact.city}: ${contact.city}`);
    if (contact.address) lines.push(`• ${t.contact.address}: ${contact.address}`);
    if (contact.notes) {
      lines.push("");
      lines.push(t.send.notesHeader);
      lines.push(contact.notes);
    }
    lines.push("");
    lines.push(t.send.closing);
    return lines.join("\n");
  };

  const finalize = () => {
    setContactOpen(false);
    toast({ title: t.toasts.successTitle, description: t.toasts.successDesc(contact.phone) });
  };

  const sendViaWhatsApp = () => {
    if (!validateBeforeSend()) return;
    const url = `https://wa.me/${BUSINESS_PHONE_INTL}?text=${encodeURIComponent(buildOrderMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    finalize();
  };

  const sendViaViber = () => {
    if (!validateBeforeSend()) return;
    // viber://chat?number=+... opens Viber app on mobile/desktop with the chat
    const url = `viber://chat?number=%2B${BUSINESS_PHONE_INTL}&text=${encodeURIComponent(buildOrderMessage())}`;
    window.location.href = url;
    finalize();
  };

  const sendViaEmail = () => {
    if (!validateBeforeSend()) return;
    const url = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(t.send.subject)}&body=${encodeURIComponent(buildOrderMessage())}`;
    window.location.href = url;
    finalize();
  };

  const sendViaCall = () => {
    window.location.href = `tel:+${BUSINESS_PHONE_INTL}`;
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 lg:pb-0">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Uređena bašta u Srbiji"
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
        <nav className="relative z-10 container flex items-center justify-between py-5">
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Zelena Oaza</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#porucivanje"
              className="hidden sm:inline-flex h-9 items-center text-primary-foreground/90 hover:text-primary-foreground text-sm font-medium px-3"
            >
              {t.nav.order}
            </a>
            <LanguageSwitcher />
          </div>
        </nav>
        <div className="relative z-10 container py-16 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur ring-1 ring-primary-foreground/20">
              <Sparkles className="h-4 w-4" /> {t.hero.badge}
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-[1.1] text-primary-foreground drop-shadow-md">
              {t.hero.title}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/95 leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow text-base font-semibold h-12 px-7"
              >
                <a href="#porucivanje">
                  {t.hero.ctaPrimary} <ArrowRight className="ml-1 h-5 w-5" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 backdrop-blur h-12 px-6"
              >
                <a href="#usluge">{t.hero.ctaSecondary}</a>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: ShieldCheck, label: t.hero.trust.reliable },
                { icon: Clock, label: t.hero.trust.onTime },
                { icon: MapPin, label: t.hero.trust.allSerbia },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-primary-foreground/10 backdrop-blur ring-1 ring-primary-foreground/15 px-3 py-3 text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* SERVICE AREA BAND */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container py-3 flex items-center justify-center gap-2 text-center">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-foreground/90">
            {t.hero.serviceArea}
          </p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="container py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.steps.title}</h2>
          <p className="mt-3 text-muted-foreground">{t.steps.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[t.steps.s1, t.steps.s2, t.steps.s3].map((step, i) => (
            <Card key={i} className="p-6 shadow-soft hover:shadow-glow transition-smooth">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft mb-4">
                <span className="text-lg font-bold">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-foreground text-lg">{step.title.replace(/^\d+\.\s*/, "")}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* BEFORE/AFTER GALLERY */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.gallery.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.gallery.subtitle}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">{t.gallery.dragHint}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.gallery.items.map((it, i) => {
              const pair = GALLERY_PAIRS[i];
              if (!pair) return null;
              return (
                <div key={i} className="space-y-3">
                  <BeforeAfterSlider
                    beforeSrc={pair.before}
                    afterSrc={pair.after}
                    beforeLabel={t.gallery.before}
                    afterLabel={t.gallery.after}
                    alt={it.title}
                  />
                  <div className="px-1">
                    <h3 className="font-semibold text-foreground text-sm">{it.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES + CALCULATOR */}
      <section id="porucivanje" className="container py-12 md:py-16 scroll-mt-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t.config.sectionTitle}</h2>
          <p className="mt-4 text-muted-foreground text-lg">{t.config.sectionDesc}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Area card */}
            <Card className="p-6 shadow-soft">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <Label htmlFor="area" className="text-base font-semibold">
                  {t.config.areaLabel}
                </Label>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {area} <span className="text-base text-muted-foreground font-medium">m²</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.config.areaHelp}</p>

              <div className="mt-5">
                <Slider
                  value={[area]}
                  min={20}
                  max={1500}
                  step={10}
                  onValueChange={([v]) => setArea(v)}
                />
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t.config.presetsTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AREAS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setArea(p.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-smooth ring-1 ${
                        area === p.value
                          ? "bg-primary text-primary-foreground ring-primary shadow-soft"
                          : "bg-secondary text-secondary-foreground ring-border hover:bg-secondary/70"
                      }`}
                    >
                      {t.config.presets[p.key]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Services grid */}
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
                    className={`group relative p-5 cursor-pointer transition-smooth overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-primary shadow-glow bg-gradient-to-br from-secondary/60 to-card"
                        : "hover:shadow-soft hover:-translate-y-0.5"
                    }`}
                  >
                    {isSelected && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground gap-1 pointer-events-none">
                        <CheckCircle2 className="h-3 w-3" /> {t.services.selected}
                      </Badge>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-soft transition-smooth ${
                        isSelected ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-primary"
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight pr-20">
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
                        className="mt-4 pt-4 border-t border-border space-y-3"
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
            <Card className="p-6 shadow-glow lg:sticky lg:top-6 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{t.summary.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t.summary.itemsCount(calc.items.length)} · {t.summary.monthlyEstimate}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                {calc.items.length === 0 && (
                  <div className="text-center py-6 px-3 rounded-xl bg-muted/40 border border-dashed border-border">
                    <Leaf className="h-7 w-7 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t.summary.empty}</p>
                  </div>
                )}
                {calc.items.map(({ def, s, freq, monthly, perVisit }) => (
                  <div key={def.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-sm text-foreground">{t.services.items[def.id].name}</span>
                      <span className="font-semibold text-sm text-primary tabular-nums">{formatRSD(monthly)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.quantity} {def.unit === "m²" ? t.services.units.m2 : t.services.units.kom} · {t.freq[freq.value]} · {formatRSD(perVisit)} {t.summary.perVisitSuffix}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-foreground">{t.summary.totalMonthly}</span>
                  <span className="text-3xl font-bold text-primary tabular-nums">{formatRSD(calc.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t.summary.estimateNote}</p>
              </div>

              <Button
                size="lg"
                onClick={submit}
                disabled={calc.items.length === 0}
                className="w-full mt-5 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow text-base font-semibold h-12"
              >
                {t.summary.continueToContact} <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {t.summary.noObligation}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            {t.faq.title}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {t.faq.items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Leaf className="h-5 w-5 text-primary" />
              Zelena Oaza
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href="tel:+381600000000">
                  <Phone className="h-4 w-4" /> {t.footer.call}
                </a>
              </Button>
              <Button asChild size="sm" className="gap-2 bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_34%)] text-primary-foreground">
                <a href="https://wa.me/381600000000" target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> {t.footer.whatsapp}
                </a>
              </Button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Zelena Oaza · {t.footer.tagline}
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-primary underline hover:no-underline"
            >
              {t.privacy.footerLink}
            </button>
          </p>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      {calc.items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-glow">
          <div className="container flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">
                {t.summary.itemsCount(calc.items.length)} · {t.summary.totalMonthly}
              </p>
              <p className="text-lg font-bold text-primary leading-tight tabular-nums truncate">
                {formatRSD(calc.total)}
              </p>
            </div>
            <Button
              onClick={submit}
              className="bg-gradient-primary text-primary-foreground shadow-glow font-semibold gap-1 shrink-0"
            >
              {t.summary.orderBtn} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* CONTACT DIALOG */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> {t.contact.title}
            </DialogTitle>
            <DialogDescription>
              {t.summary.itemsCount(calc.items.length)} · {t.summary.totalMonthly}: <strong className="text-primary">{formatRSD(calc.total)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">{t.contact.name}</Label>
              <Input id="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={100} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">{t.contact.phone}</Label>
              <Input id="phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} maxLength={30} placeholder="+381 ..." inputMode="tel" />
            </div>
            <div>
              <Label htmlFor="city">{t.contact.city}</Label>
              <Select value={contact.city} onValueChange={(v) => setContact({ ...contact, city: v })}>
                <SelectTrigger id="city">
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
              <Label htmlFor="address">{t.contact.address}</Label>
              <Input id="address" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} maxLength={150} />
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
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground leading-relaxed flex gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t.privacy.inlineNotice}</span>
          </div>

          <div className="mt-3 flex items-start gap-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-xs leading-relaxed text-foreground font-normal cursor-pointer">
              {t.privacy.consentLabel}{" "}
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="text-primary underline hover:no-underline font-medium"
              >
                {t.privacy.consentLink}
              </button>
              .
            </Label>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              {t.summary.backToServices}
            </Button>
            <Button
              onClick={sendOrder}
              disabled={submitting || !consent}
              className="bg-gradient-primary text-primary-foreground shadow-glow font-semibold"
            >
              {submitting ? t.contact.submitting : t.summary.orderBtn}
            </Button>
          </DialogFooter>
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            {t.summary.noObligation}
          </p>
        </DialogContent>
      </Dialog>

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