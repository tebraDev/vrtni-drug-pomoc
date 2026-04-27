export type Locale = "sr-Latn" | "sr-Cyrl" | "de" | "en";

export interface Dict {
  localeName: string;
  nav: { order: string };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: { reliable: string; onTime: string; allSerbia: string };
  };
  config: {
    sectionTitle: string;
    sectionDesc: string;
    areaLabel: string;
    areaHelp: string;
  };
  services: {
    pricePerM2: (price: number, min: string) => string;
    pricePerUnit: (price: string) => string;
    quantityM2: string;
    quantityKom: string;
    frequency: string;
    items: Record<string, { name: string; desc: string }>;
    units: { m2: string; kom: string };
  };
  freq: Record<
    "1x_nedeljno" | "2x_nedeljno" | "1x_mesecno" | "2x_mesecno" | "po_potrebi",
    string
  >;
  contact: {
    title: string;
    name: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
    notesPlaceholder: string;
  };
  summary: {
    title: string;
    monthlyEstimate: string;
    empty: string;
    perVisitSuffix: string;
    totalMonthly: string;
    estimateNote: string;
    orderBtn: string;
    noObligation: string;
  };
  toasts: {
    missingTitle: string;
    missingDesc: string;
    selectTitle: string;
    selectDesc: string;
    successTitle: string;
    successDesc: (phone: string) => string;
  };
  footer: { tagline: string };
  langSwitcher: { language: string; script: string; latin: string; cyrillic: string };
  meta: { title: string; description: string };
}

const fmtRSD = (n: number, locale: string) =>
  new Intl.NumberFormat(locale).format(Math.round(n)) + " RSD";

// Helper for cyrillic transliteration of dynamic numbers (RSD stays Latin per convention)
const RSD_CYR = "РСД";
const fmtRSDcyr = (n: number) =>
  new Intl.NumberFormat("sr-RS").format(Math.round(n)) + " " + RSD_CYR;

export const formatPrice = (n: number, locale: Locale) => {
  if (locale === "sr-Cyrl") return fmtRSDcyr(n);
  if (locale === "sr-Latn") return fmtRSD(n, "sr-RS");
  if (locale === "de") return fmtRSD(n, "de-DE");
  return fmtRSD(n, "en-US");
};

export const translations: Record<Locale, Dict> = {
  "sr-Latn": {
    localeName: "Srpski (latinica)",
    nav: { order: "Poruči uslugu" },
    hero: {
      badge: "Za dijasporu i starije sugrađane",
      title: "Vaša bašta u najboljim rukama — dok ste odsutni",
      subtitle:
        "Profesionalno održavanje dvorišta i bašte u Srbiji. Zalivamo, kosimo, plevimo i čuvamo Vaš zeleni kutak — Vi se vraćate u savršeno uređen dom.",
      ctaPrimary: "Izračunaj cenu odmah",
      ctaSecondary: "Pogledaj usluge",
      trust: { reliable: "Pouzdano", onTime: "Tačno na vreme", allSerbia: "Cela Srbija" },
    },
    config: {
      sectionTitle: "Sastavite svoj paket usluga",
      sectionDesc:
        "Izaberite šta Vam treba, unesite površinu i učestalost — cena se računa odmah u RSD.",
      areaLabel: "Ukupna površina dvorišta / bašte (m²)",
      areaHelp:
        "Okvirna procena — koristi se kao podrazumevana vrednost za usluge po površini.",
    },
    services: {
      pricePerM2: (price, min) => `${price} RSD / m² (min ${min})`,
      pricePerUnit: (price) => `${price} / kom`,
      quantityM2: "Površina (m²)",
      quantityKom: "Broj komada",
      frequency: "Učestalost",
      units: { m2: "m²", kom: "kom" },
      items: {
        zalivanje: { name: "Zalivanje bašte", desc: "Redovno zalivanje cveća, povrća i travnjaka" },
        kosenje: { name: "Košenje travnjaka", desc: "Profesionalno košenje i čišćenje pokošene trave" },
        plevljenje: { name: "Plevljenje i okopavanje", desc: "Uklanjanje korova iz leja i staza" },
        zivica: { name: "Orezivanje žive ograde", desc: "Oblikovanje i sečenje živice" },
        drvece: { name: "Orezivanje drveća i voćki", desc: "Stručno orezivanje voćaka i ukrasnog drveća" },
        ciscenje: { name: "Čišćenje dvorišta", desc: "Sakupljanje lišća, granja i otpada" },
        cvece: { name: "Sadnja cveća i sezonsko uređenje", desc: "Sadnja, prihrana i nega cveća" },
        djubrenje: { name: "Đubrenje i prihrana", desc: "Prihrana travnjaka i biljaka" },
      },
    },
    freq: {
      "2x_nedeljno": "2x nedeljno",
      "1x_nedeljno": "1x nedeljno",
      "2x_mesecno": "2x mesečno",
      "1x_mesecno": "1x mesečno",
      "po_potrebi": "Po potrebi (jednokratno)",
    },
    contact: {
      title: "Vaši podaci",
      name: "Ime i prezime *",
      phone: "Telefon *",
      city: "Grad / mesto",
      address: "Adresa",
      notes: "Dodatne napomene",
      notesPlaceholder: "Npr. period odsustva, posebni zahtevi, pristup dvorištu...",
    },
    summary: {
      title: "Vaš paket",
      monthlyEstimate: "Mesečna procena",
      empty: "Još niste izabrali nijednu uslugu.",
      perVisitSuffix: "po dolasku",
      totalMonthly: "Ukupno mesečno",
      estimateNote: "Procena na osnovu unetih podataka. Konačna cena se potvrđuje nakon dogovora.",
      orderBtn: "Poruči — neobavezujuće",
      noObligation: "Bez obaveze · Kontakt u roku od 24h",
    },
    toasts: {
      missingTitle: "Podaci nedostaju",
      missingDesc: "Molimo unesite ime i broj telefona.",
      selectTitle: "Izaberite uslugu",
      selectDesc: "Označite barem jednu uslugu za narudžbinu.",
      successTitle: "Hvala! Narudžbina poslata ✓",
      successDesc: (phone) =>
        `Kontaktiraćemo Vas na ${phone} u najkraćem roku. Narudžbina je potpuno neobavezujuća.`,
    },
    footer: { tagline: "Održavanje bašte i dvorišta širom Srbije" },
    langSwitcher: { language: "Jezik", script: "Pismo", latin: "Latinica", cyrillic: "Ćirilica" },
    meta: {
      title: "Zelena Oaza — Održavanje bašte za dijasporu i starije",
      description:
        "Profesionalno održavanje bašte i dvorišta u Srbiji: zalivanje, košenje, plevljenje. Izračunajte cenu u RSD i poručite neobavezujuće.",
    },
  },
  "sr-Cyrl": {
    localeName: "Српски (ћирилица)",
    nav: { order: "Поручи услугу" },
    hero: {
      badge: "За дијаспору и старије суграђане",
      title: "Ваша башта у најбољим рукама — док сте одсутни",
      subtitle:
        "Професионално одржавање дворишта и баште у Србији. Заливамо, косимо, плевимо и чувамо Ваш зелени кутак — Ви се враћате у савршено уређен дом.",
      ctaPrimary: "Израчунај цену одмах",
      ctaSecondary: "Погледај услуге",
      trust: { reliable: "Поуздано", onTime: "Тачно на време", allSerbia: "Цела Србија" },
    },
    config: {
      sectionTitle: "Саставите свој пакет услуга",
      sectionDesc:
        "Изаберите шта Вам треба, унесите површину и учесталост — цена се рачуна одмах у РСД.",
      areaLabel: "Укупна површина дворишта / баште (m²)",
      areaHelp:
        "Оквирна процена — користи се као подразумевана вредност за услуге по површини.",
    },
    services: {
      pricePerM2: (price, min) => `${price} РСД / m² (мин ${min})`,
      pricePerUnit: (price) => `${price} / ком`,
      quantityM2: "Површина (m²)",
      quantityKom: "Број комада",
      frequency: "Учесталост",
      units: { m2: "m²", kom: "ком" },
      items: {
        zalivanje: { name: "Заливање баште", desc: "Редовно заливање цвећа, поврћа и травњака" },
        kosenje: { name: "Кошење травњака", desc: "Професионално кошење и чишћење покошене траве" },
        plevljenje: { name: "Плевљење и окопавање", desc: "Уклањање корова из леја и стаза" },
        zivica: { name: "Орезивање живе ограде", desc: "Обликовање и сечење живице" },
        drvece: { name: "Орезивање дрвећа и воћки", desc: "Стручно орезивање воћака и украсног дрвећа" },
        ciscenje: { name: "Чишћење дворишта", desc: "Сакупљање лишћа, грања и отпада" },
        cvece: { name: "Садња цвећа и сезонско уређење", desc: "Садња, прихрана и нега цвећа" },
        djubrenje: { name: "Ђубрење и прихрана", desc: "Прихрана травњака и биљака" },
      },
    },
    freq: {
      "2x_nedeljno": "2x недељно",
      "1x_nedeljno": "1x недељно",
      "2x_mesecno": "2x месечно",
      "1x_mesecno": "1x месечно",
      "po_potrebi": "По потреби (једнократно)",
    },
    contact: {
      title: "Ваши подаци",
      name: "Име и презиме *",
      phone: "Телефон *",
      city: "Град / место",
      address: "Адреса",
      notes: "Додатне напомене",
      notesPlaceholder: "Нпр. период одсуства, посебни захтеви, приступ дворишту...",
    },
    summary: {
      title: "Ваш пакет",
      monthlyEstimate: "Месечна процена",
      empty: "Још нисте изабрали ниједну услугу.",
      perVisitSuffix: "по доласку",
      totalMonthly: "Укупно месечно",
      estimateNote: "Процена на основу унетих података. Коначна цена се потврђује након договора.",
      orderBtn: "Поручи — необавезујуће",
      noObligation: "Без обавезе · Контакт у року од 24ч",
    },
    toasts: {
      missingTitle: "Подаци недостају",
      missingDesc: "Молимо унесите име и број телефона.",
      selectTitle: "Изаберите услугу",
      selectDesc: "Означите барем једну услугу за наруџбину.",
      successTitle: "Хвала! Наруџбина послата ✓",
      successDesc: (phone) =>
        `Контактираћемо Вас на ${phone} у најкраћем року. Наруџбина је потпуно необавезујућа.`,
    },
    footer: { tagline: "Одржавање баште и дворишта широм Србије" },
    langSwitcher: { language: "Језик", script: "Писмо", latin: "Латиница", cyrillic: "Ћирилица" },
    meta: {
      title: "Зелена Оаза — Одржавање баште за дијаспору и старије",
      description:
        "Професионално одржавање баште и дворишта у Србији: заливање, кошење, плевљење. Израчунајте цену у РСД и поручите необавезујуће.",
    },
  },
  de: {
    localeName: "Deutsch",
    nav: { order: "Service bestellen" },
    hero: {
      badge: "Für die Diaspora und ältere Mitbürger",
      title: "Ihr Garten in besten Händen — auch wenn Sie nicht da sind",
      subtitle:
        "Professionelle Garten- und Hofpflege in Serbien. Wir gießen, mähen, jäten und pflegen Ihre grüne Oase — Sie kommen in ein perfekt gepflegtes Zuhause zurück.",
      ctaPrimary: "Preis sofort berechnen",
      ctaSecondary: "Leistungen ansehen",
      trust: { reliable: "Zuverlässig", onTime: "Pünktlich", allSerbia: "Ganz Serbien" },
    },
    config: {
      sectionTitle: "Stellen Sie Ihr Servicepaket zusammen",
      sectionDesc:
        "Wählen Sie, was Sie brauchen, geben Sie Fläche und Häufigkeit an — der Preis wird sofort in RSD berechnet.",
      areaLabel: "Gesamtfläche von Hof / Garten (m²)",
      areaHelp:
        "Grobe Schätzung — wird als Standardwert für flächenbasierte Leistungen verwendet.",
    },
    services: {
      pricePerM2: (price, min) => `${price} RSD / m² (min. ${min})`,
      pricePerUnit: (price) => `${price} / Stück`,
      quantityM2: "Fläche (m²)",
      quantityKom: "Stückzahl",
      frequency: "Häufigkeit",
      units: { m2: "m²", kom: "Stk." },
      items: {
        zalivanje: { name: "Garten gießen", desc: "Regelmäßiges Gießen von Blumen, Gemüse und Rasen" },
        kosenje: { name: "Rasen mähen", desc: "Professionelles Mähen und Entfernen des Schnittguts" },
        plevljenje: { name: "Jäten und Hacken", desc: "Entfernen von Unkraut aus Beeten und Wegen" },
        zivica: { name: "Heckenschnitt", desc: "Formen und Schneiden der Hecke" },
        drvece: { name: "Baum- und Obstbaumschnitt", desc: "Fachgerechter Schnitt von Obst- und Zierbäumen" },
        ciscenje: { name: "Hofreinigung", desc: "Aufsammeln von Laub, Ästen und Abfall" },
        cvece: { name: "Blumen pflanzen & saisonale Gestaltung", desc: "Pflanzen, Düngen und Pflege von Blumen" },
        djubrenje: { name: "Düngung", desc: "Düngung von Rasen und Pflanzen" },
      },
    },
    freq: {
      "2x_nedeljno": "2x pro Woche",
      "1x_nedeljno": "1x pro Woche",
      "2x_mesecno": "2x pro Monat",
      "1x_mesecno": "1x pro Monat",
      "po_potrebi": "Bei Bedarf (einmalig)",
    },
    contact: {
      title: "Ihre Daten",
      name: "Vor- und Nachname *",
      phone: "Telefon *",
      city: "Stadt / Ort",
      address: "Adresse",
      notes: "Zusätzliche Hinweise",
      notesPlaceholder: "Z. B. Abwesenheitszeitraum, besondere Wünsche, Zugang zum Hof...",
    },
    summary: {
      title: "Ihr Paket",
      monthlyEstimate: "Monatliche Schätzung",
      empty: "Sie haben noch keine Leistung ausgewählt.",
      perVisitSuffix: "pro Einsatz",
      totalMonthly: "Monatlich gesamt",
      estimateNote:
        "Schätzung anhand Ihrer Angaben. Der Endpreis wird nach Absprache bestätigt.",
      orderBtn: "Bestellen — unverbindlich",
      noObligation: "Unverbindlich · Kontakt innerhalb von 24h",
    },
    toasts: {
      missingTitle: "Angaben fehlen",
      missingDesc: "Bitte Name und Telefonnummer angeben.",
      selectTitle: "Leistung auswählen",
      selectDesc: "Bitte mindestens eine Leistung für die Bestellung auswählen.",
      successTitle: "Danke! Bestellung gesendet ✓",
      successDesc: (phone) =>
        `Wir melden uns schnellstmöglich unter ${phone}. Die Bestellung ist völlig unverbindlich.`,
    },
    footer: { tagline: "Garten- und Hofpflege in ganz Serbien" },
    langSwitcher: { language: "Sprache", script: "Schrift", latin: "Lateinisch", cyrillic: "Kyrillisch" },
    meta: {
      title: "Zelena Oaza — Gartenpflege für die Diaspora und Senioren",
      description:
        "Professionelle Garten- und Hofpflege in Serbien: Gießen, Mähen, Jäten. Preis in RSD berechnen und unverbindlich bestellen.",
    },
  },
  en: {
    localeName: "English",
    nav: { order: "Order service" },
    hero: {
      badge: "For the diaspora and elderly residents",
      title: "Your garden in the best hands — while you're away",
      subtitle:
        "Professional garden and yard care in Serbia. We water, mow, weed and look after your green oasis — you return to a perfectly tended home.",
      ctaPrimary: "Calculate price now",
      ctaSecondary: "See services",
      trust: { reliable: "Reliable", onTime: "On time", allSerbia: "All of Serbia" },
    },
    config: {
      sectionTitle: "Build your service package",
      sectionDesc:
        "Pick what you need, enter the area and frequency — the price is calculated instantly in RSD.",
      areaLabel: "Total yard / garden area (m²)",
      areaHelp: "Rough estimate — used as the default for area-based services.",
    },
    services: {
      pricePerM2: (price, min) => `${price} RSD / m² (min ${min})`,
      pricePerUnit: (price) => `${price} / pc`,
      quantityM2: "Area (m²)",
      quantityKom: "Quantity",
      frequency: "Frequency",
      units: { m2: "m²", kom: "pcs" },
      items: {
        zalivanje: { name: "Garden watering", desc: "Regular watering of flowers, vegetables and lawn" },
        kosenje: { name: "Lawn mowing", desc: "Professional mowing and clipping removal" },
        plevljenje: { name: "Weeding & hoeing", desc: "Removing weeds from beds and paths" },
        zivica: { name: "Hedge trimming", desc: "Shaping and cutting hedges" },
        drvece: { name: "Tree & fruit tree pruning", desc: "Expert pruning of fruit and ornamental trees" },
        ciscenje: { name: "Yard cleaning", desc: "Collecting leaves, branches and debris" },
        cvece: { name: "Flower planting & seasonal design", desc: "Planting, feeding and care of flowers" },
        djubrenje: { name: "Fertilising", desc: "Feeding lawn and plants" },
      },
    },
    freq: {
      "2x_nedeljno": "2x per week",
      "1x_nedeljno": "1x per week",
      "2x_mesecno": "2x per month",
      "1x_mesecno": "1x per month",
      "po_potrebi": "As needed (one-off)",
    },
    contact: {
      title: "Your details",
      name: "Full name *",
      phone: "Phone *",
      city: "City / town",
      address: "Address",
      notes: "Additional notes",
      notesPlaceholder: "E.g. period away, special requests, yard access...",
    },
    summary: {
      title: "Your package",
      monthlyEstimate: "Monthly estimate",
      empty: "You haven't selected any service yet.",
      perVisitSuffix: "per visit",
      totalMonthly: "Monthly total",
      estimateNote: "Estimate based on your input. Final price confirmed after agreement.",
      orderBtn: "Order — no obligation",
      noObligation: "No obligation · Contact within 24h",
    },
    toasts: {
      missingTitle: "Details missing",
      missingDesc: "Please enter your name and phone number.",
      selectTitle: "Select a service",
      selectDesc: "Please tick at least one service to order.",
      successTitle: "Thank you! Order sent ✓",
      successDesc: (phone) =>
        `We'll contact you at ${phone} as soon as possible. The order is completely non-binding.`,
    },
    footer: { tagline: "Garden and yard care across Serbia" },
    langSwitcher: { language: "Language", script: "Script", latin: "Latin", cyrillic: "Cyrillic" },
    meta: {
      title: "Zelena Oaza — Garden care for the diaspora and seniors",
      description:
        "Professional garden and yard care in Serbia: watering, mowing, weeding. Calculate price in RSD and order with no obligation.",
    },
  },
};