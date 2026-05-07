import { useEffect, useState } from "react";
import { Leaf, Sparkles, Send, Loader2, ShieldCheck, BookOpen, ImageIcon, Mail, CheckCircle2 } from "lucide-react";
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

// Optional: still used to forward the contact message via the existing Cloudflare Worker.
// If the endpoint is empty / unreachable, the form gracefully shows an error toast.
const WORKER_ENDPOINT = "https://zelena-oaza-order.zelena-oaza.workers.dev";

const GardenLanding = () => {
  const { t } = useI18n();
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "message" | "consent", string>>>({});
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Scroll-spy: highlight current section in header.
  useEffect(() => {
    const ids = ["o-meni", "portfolio", "dnevnik", "kontakt"];
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

  const schema = z.object({
    name: z.string().trim().min(2, t.contact.nameRequired).max(100),
    message: z.string().trim().min(3, t.contact.messageRequired).max(2000),
    consent: z.literal(true, { errorMap: () => ({ message: t.privacy.consentRequired }) }),
  });

  const validate = () => {
    const result = schema.safeParse({ name: contact.name, message: contact.message, consent });
    if (!result.success) {
      const errs: Partial<Record<"name" | "message" | "consent", string>> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as "name" | "message" | "consent";
        if (!errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const sendMessage = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const srT = translations["sr-Latn"];
      const lines = [
        `${srT.contact.contactHeader}`,
        `• ${srT.contact.name}: ${contact.name}`,
        contact.email ? `• ${srT.contact.email}: ${contact.email}` : "",
        "",
        `${srT.contact.notesHeader}`,
        contact.message,
      ].filter(Boolean);
      const payload = {
        message: lines.join("\n"),
        contact: {
          name: contact.name,
          email: contact.email || null,
          notes: contact.message,
        },
        source: "zelena-oaza-blog",
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
        document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      console.error("Message submission failed", err);
      toast({ title: t.contact.errorTitle, description: t.contact.errorDesc, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft antialiased">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Bašta u proleće"
            width={1600}
            height={900}
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
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
                { id: "o-meni", label: t.nav.about },
                { id: "portfolio", label: t.nav.portfolio },
                { id: "dnevnik", label: t.nav.journal },
                { id: "kontakt", label: t.nav.contact },
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
                <a href="#portfolio">
                  <ImageIcon className="mr-1 h-5 w-5" /> {t.hero.ctaPrimary}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-primary-foreground border border-white/40 hover:bg-white/20 hover:border-white/60 hover:text-primary-foreground h-12 px-7 rounded-full text-base font-medium transition-colors"
              >
                <a href="#dnevnik">
                  <BookOpen className="mr-1 h-5 w-5" /> {t.hero.ctaSecondary}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="o-meni" className="container py-16 md:py-24 scroll-mt-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
            {t.about.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
            {t.about.title}
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
            {t.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO / GALLERY */}
      <section id="portfolio" className="bg-gradient-to-b from-secondary/40 via-secondary/20 to-background border-y border-border/60 scroll-mt-4">
        <div className="container py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
              {t.gallery.eyebrow}
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

      {/* JOURNAL */}
      <section id="dnevnik" className="container py-16 md:py-24 scroll-mt-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
            {t.journal.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">{t.journal.title}</h2>
          <p className="mt-3 text-muted-foreground text-balance">{t.journal.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.journal.items.map((post, i) => (
            <Card key={i} className="p-7 shadow-ring1 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur border-border/60 h-full">
              <div className="flex items-center gap-2 text-xs font-medium text-primary/80 uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{post.date}</span>
              </div>
              <h3 className="mt-3 font-semibold text-foreground text-lg tracking-tight leading-snug">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="kontakt" className="container py-16 md:py-20 scroll-mt-4">
        <div className="max-w-2xl mx-auto">
          {!success && (
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3">
                {t.contact.eyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
                {t.contact.title}
              </h2>
              <p className="mt-3 text-muted-foreground text-balance">{t.contact.subtitle}</p>
            </div>
          )}

          {success ? (
            <Card className="p-6 md:p-10 shadow-elevated border-primary/30 bg-gradient-to-br from-card via-secondary/30 to-card backdrop-blur text-center animate-fade-in-up overflow-hidden relative">
              <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-gradient-aurora blur-3xl opacity-70" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-gradient-aurora blur-3xl opacity-50" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow mb-5 animate-scale-in">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-balance">
                  {t.contact.successTitle}
                </h2>
                <p className="mt-3 text-muted-foreground text-balance max-w-md mx-auto">
                  {t.contact.successDesc}
                </p>
                <button
                  type="button"
                  onClick={() => { setSuccess(false); setContact({ name: "", email: "", message: "" }); }}
                  className="mt-6 text-xs text-primary hover:underline font-medium"
                >
                  {t.contact.newMessage}
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 md:p-8 shadow-elevated border-border/60 bg-card/90 backdrop-blur">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.name}</Label>
                  <Input
                    id="name"
                    value={contact.name}
                    onChange={(e) => { setContact({ ...contact, name: e.target.value }); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined }); }}
                    maxLength={100}
                    aria-invalid={!!fieldErrors.name}
                    className={`mt-1.5 h-11 rounded-xl ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.email}</Label>
                  <Input
                    id="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    maxLength={150}
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contact.message}</Label>
                  <Textarea
                    id="message"
                    value={contact.message}
                    onChange={(e) => { setContact({ ...contact, message: e.target.value }); if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: undefined }); }}
                    maxLength={2000}
                    placeholder={t.contact.messagePlaceholder}
                    rows={5}
                    aria-invalid={!!fieldErrors.message}
                    className={`mt-1.5 rounded-xl ${fieldErrors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {fieldErrors.message && <p className="text-xs text-destructive mt-1">{fieldErrors.message}</p>}
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
                onClick={sendMessage}
                disabled={sending}
                size="lg"
                className="w-full mt-6 gap-2 bg-gradient-primary text-primary-foreground shadow-glow font-semibold h-12 rounded-full"
              >
                {sending ? (<><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.sending}</>) : (<><Send className="h-4 w-4" /> {t.contact.send}</>)}
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-gradient-to-b from-card to-secondary/30">
        <div className="container py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2.5 text-foreground font-semibold tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-base">Zelena Oaza</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              © {new Date().getFullYear()} · {t.footer.tagline}
            </p>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" /> {t.privacy.footerLink}
            </button>
          </div>
        </div>
      </footer>

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
