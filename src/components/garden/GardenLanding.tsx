import { useMemo, useState } from "react";
import { Leaf, Droplets, Scissors, Sprout, TreePine, Trash2, Flower2, Sparkles, ShieldCheck, Clock, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import heroImg from "@/assets/garden-hero.jpg";

type Frequency = "1x_nedeljno" | "2x_nedeljno" | "1x_mesecno" | "2x_mesecno" | "po_potrebi";

interface ServiceDef {
  id: string;
  name: string;
  desc: string;
  icon: typeof Leaf;
  // RSD per m² per visit (or fixed if perVisit)
  pricePerM2?: number;
  perVisit?: number;
  minPrice: number;
  unit: "m²" | "kom";
}

const SERVICES: ServiceDef[] = [
  { id: "zalivanje", name: "Zalivanje bašte", desc: "Redovno zalivanje cveća, povrća i travnjaka", icon: Droplets, pricePerM2: 8, minPrice: 1500, unit: "m²" },
  { id: "kosenje", name: "Košenje travnjaka", desc: "Profesionalno košenje i čišćenje pokošene trave", icon: Scissors, pricePerM2: 25, minPrice: 2500, unit: "m²" },
  { id: "plevljenje", name: "Plevljenje i okopavanje", desc: "Uklanjanje korova iz leja i staza", icon: Sprout, pricePerM2: 35, minPrice: 2000, unit: "m²" },
  { id: "zivica", name: "Orezivanje žive ograde", desc: "Oblikovanje i sečenje živice", icon: TreePine, pricePerM2: 90, minPrice: 3000, unit: "m²" },
  { id: "drvece", name: "Orezivanje drveća i voćki", desc: "Stručno orezivanje voćaka i ukrasnog drveća", icon: TreePine, perVisit: 1500, minPrice: 1500, unit: "kom" },
  { id: "ciscenje", name: "Čišćenje dvorišta", desc: "Sakupljanje lišća, granja i otpada", icon: Trash2, pricePerM2: 12, minPrice: 2000, unit: "m²" },
  { id: "cvece", name: "Sadnja cveća i sezonsko uređenje", desc: "Sadnja, prihrana i nega cveća", icon: Flower2, pricePerM2: 60, minPrice: 2500, unit: "m²" },
  { id: "djubrenje", name: "Đubrenje i prihrana", desc: "Prihrana travnjaka i biljaka", icon: Leaf, pricePerM2: 15, minPrice: 1800, unit: "m²" },
];

const FREQUENCIES: { value: Frequency; label: string; multiplier: number }[] = [
  { value: "2x_nedeljno", label: "2x nedeljno", multiplier: 8 },
  { value: "1x_nedeljno", label: "1x nedeljno", multiplier: 4 },
  { value: "2x_mesecno", label: "2x mesečno", multiplier: 2 },
  { value: "1x_mesecno", label: "1x mesečno", multiplier: 1 },
  { value: "po_potrebi", label: "Po potrebi (jednokratno)", multiplier: 1 },
];

interface SelectedService {
  id: string;
  quantity: number; // m² or kom
  frequency: Frequency;
}

const formatRSD = (n: number) => new Intl.NumberFormat("sr-RS").format(Math.round(n)) + " RSD";

const GardenLanding = () => {
  const [selected, setSelected] = useState<Record<string, SelectedService>>({});
  const [area, setArea] = useState<string>("100");
  const [contact, setContact] = useState({ name: "", phone: "", city: "", address: "", notes: "" });

  const toggleService = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { id, quantity: parseInt(area) || 100, frequency: "1x_nedeljno" };
      return next;
    });
  };

  const updateService = (id: string, patch: Partial<SelectedService>) => {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const calc = useMemo(() => {
    const items = Object.values(selected).map((s) => {
      const def = SERVICES.find((d) => d.id === s.id)!;
      const freq = FREQUENCIES.find((f) => f.value === s.frequency)!;
      const perVisit = def.perVisit
        ? def.perVisit * s.quantity
        : Math.max(def.minPrice, (def.pricePerM2 || 0) * s.quantity);
      const monthly = perVisit * freq.multiplier;
      return { def, s, freq, perVisit, monthly };
    });
    const total = items.reduce((sum, i) => sum + i.monthly, 0);
    return { items, total };
  }, [selected]);

  const submit = () => {
    if (!contact.name || !contact.phone) {
      toast({ title: "Podaci nedostaju", description: "Molimo unesite ime i broj telefona.", variant: "destructive" });
      return;
    }
    if (calc.items.length === 0) {
      toast({ title: "Izaberite uslugu", description: "Označite barem jednu uslugu za narudžbinu.", variant: "destructive" });
      return;
    }
    toast({
      title: "Hvala! Narudžbina poslata ✓",
      description: `Kontaktiraćemo Vas na ${contact.phone} u najkraćem roku. Narudžbina je potpuno neobavezujuća.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Uređena bašta u Srbiji" width={1600} height={900} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <nav className="relative z-10 container flex items-center justify-between py-6">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Leaf className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight">Zelena Oaza</span>
          </div>
          <a href="#porucivanje" className="text-primary-foreground/90 hover:text-primary-foreground text-sm font-medium">
            Poruči uslugu
          </a>
        </nav>
        <div className="relative z-10 container py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
              <Sparkles className="h-4 w-4" /> Za dijasporu i starije sugrađane
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight text-primary-foreground">
              Vaša bašta u najboljim rukama — dok ste odsutni
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              Profesionalno održavanje dvorišta i bašte u Srbiji. Zalivamo, kosimo, plevimo i čuvamo Vaš zeleni kutak — Vi se vraćate u savršeno uređen dom.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
                <a href="#porucivanje">Izračunaj cenu odmah</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 backdrop-blur">
                <a href="#usluge">Pogledaj usluge</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { icon: ShieldCheck, label: "Pouzdano" },
                { icon: Clock, label: "Tačno na vreme" },
                { icon: MapPin, label: "Cela Srbija" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-primary-foreground/90">
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* SERVICES + CALCULATOR */}
      <section id="porucivanje" className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Sastavite svoj paket usluga</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Izaberite šta Vam treba, unesite površinu i učestalost — cena se računa odmah u RSD.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: services */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-soft">
              <Label htmlFor="area" className="text-base font-semibold">Ukupna površina dvorišta / bašte (m²)</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Okvirna procena — koristi se kao podrazumevana vrednost za usluge po površini.
              </p>
              <Input
                id="area"
                type="number"
                min={10}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="max-w-xs text-lg"
              />
            </Card>

            <div id="usluge" className="space-y-4">
              {SERVICES.map((svc) => {
                const isSelected = !!selected[svc.id];
                const Icon = svc.icon;
                const current = selected[svc.id];
                return (
                  <Card
                    key={svc.id}
                    className={`p-5 transition-smooth cursor-pointer hover:shadow-soft ${
                      isSelected ? "ring-2 ring-primary shadow-soft bg-secondary/40" : ""
                    }`}
                    onClick={() => !isSelected && toggleService(svc.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleService(svc.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{svc.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {svc.perVisit
                              ? `${formatRSD(svc.perVisit)} / kom`
                              : `${svc.pricePerM2} RSD / m² (min ${formatRSD(svc.minPrice)})`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{svc.desc}</p>

                        {isSelected && (
                          <div className="mt-4 grid sm:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                {svc.unit === "m²" ? "Površina (m²)" : "Broj komada"}
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={current.quantity}
                                onChange={(e) => updateService(svc.id, { quantity: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Učestalost</Label>
                              <Select
                                value={current.frequency}
                                onValueChange={(v) => updateService(svc.id, { frequency: v as Frequency })}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {FREQUENCIES.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Contact */}
            <Card className="p-6 shadow-soft">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> Vaši podaci
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ime i prezime *</Label>
                  <Input id="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} maxLength={30} placeholder="+381 ..." />
                </div>
                <div>
                  <Label htmlFor="city">Grad / mesto</Label>
                  <Input id="city" value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="address">Adresa</Label>
                  <Input id="address" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} maxLength={150} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Dodatne napomene</Label>
                  <Textarea
                    id="notes"
                    value={contact.notes}
                    onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                    maxLength={1000}
                    placeholder="Npr. period odsustva, posebni zahtevi, pristup dvorištu..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-glow lg:sticky lg:top-6 bg-card">
              <h3 className="text-xl font-bold text-foreground">Vaš paket</h3>
              <p className="text-sm text-muted-foreground mt-1">Mesečna procena</p>

              <div className="mt-6 space-y-3 max-h-80 overflow-y-auto pr-1">
                {calc.items.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Još niste izabrali nijednu uslugu.</p>
                )}
                {calc.items.map(({ def, s, freq, monthly, perVisit }) => (
                  <div key={def.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-sm text-foreground">{def.name}</span>
                      <span className="font-semibold text-sm text-primary">{formatRSD(monthly)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.quantity} {def.unit} · {freq.label} · {formatRSD(perVisit)} po dolasku
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-foreground">Ukupno mesečno</span>
                  <span className="text-3xl font-bold text-primary">{formatRSD(calc.total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Procena na osnovu unetih podataka. Konačna cena se potvrđuje nakon dogovora.
                </p>
              </div>

              <Button
                size="lg"
                onClick={submit}
                className="w-full mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow text-base font-semibold"
              >
                Poruči — neobavezujuće
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Bez obaveze · Kontakt u roku od 24h
              </p>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 text-foreground font-semibold mb-2">
            <Leaf className="h-5 w-5 text-primary" />
            Zelena Oaza
          </div>
          <p>© {new Date().getFullYear()} Zelena Oaza · Održavanje bašte i dvorišta širom Srbije</p>
        </div>
      </footer>
    </div>
  );
};

export default GardenLanding;