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
    rating: string;
    happyClients: string;
    sinceYear: string;
  };
  config: {
    sectionTitle: string;
    sectionDesc: string;
    areaLabel: string;
    areaHelp: string;
    presetsTitle: string;
    presets: { small: string; medium: string; large: string; estate: string };
  };
  services: {
    pricePerM2: (price: number, min: string) => string;
    pricePerUnit: (price: string) => string;
    quantityM2: string;
    quantityKom: string;
    frequency: string;
    items: Record<string, { name: string; desc: string }>;
    units: { m2: string; kom: string };
    selected: string;
    add: string;
    remove: string;
    monthlyMini: string;
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
    submitting: string;
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
    itemsCount: (n: number) => string;
    continueToContact: string;
    backToServices: string;
  };
  toasts: {
    missingTitle: string;
    missingDesc: string;
    selectTitle: string;
    selectDesc: string;
    successTitle: string;
    successDesc: (phone: string) => string;
  };
  footer: { tagline: string; contact: string; whatsapp: string; call: string };
  langSwitcher: { language: string; script: string; latin: string; cyrillic: string };
  meta: { title: string; description: string };
  steps: {
    title: string;
    subtitle: string;
    s1: { title: string; desc: string };
    s2: { title: string; desc: string };
    s3: { title: string; desc: string };
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: { quote: string; author: string; location: string }[];
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
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
      rating: "4.9 / 5 (120+ ocena)",
      happyClients: "300+ zadovoljnih klijenata",
      sinceYear: "Od 2019.",
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
      selected: "Izabrano",
      add: "Dodaj",
      remove: "Ukloni",
      monthlyMini: "/ mesec",
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
      submitting: "Šalje se...",
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
      itemsCount: (n) => n === 1 ? "1 usluga" : (n >= 2 && n <= 4) ? n + " usluge" : n + " usluga",
      continueToContact: "Nastavi na kontakt",
      backToServices: "Nazad na usluge",
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
    footer: { tagline: "Održavanje bašte i dvorišta širom Srbije", contact: "Kontakt", whatsapp: "WhatsApp", call: "Pozovi" },
    langSwitcher: { language: "Jezik", script: "Pismo", latin: "Latinica", cyrillic: "Ćirilica" },
    meta: {
      title: "Zelena Oaza — Održavanje bašte za dijasporu i starije",
      description:
        "Profesionalno održavanje bašte i dvorišta u Srbiji: zalivanje, košenje, plevljenje. Izračunajte cenu u RSD i poručite neobavezujuće.",
    },,
    steps: {
      title: "Kako funkcioniše",
      subtitle: "Tri jednostavna koraka do uređene bašte",
      s1: { title: "1. Sastavite paket", desc: "Označite usluge i unesite površinu — cena se računa odmah." },
      s2: { title: "2. Pošaljite neobavezujuću narudžbinu", desc: "Javljamo Vam se u roku od 24h radi potvrde termina." },
      s3: { title: "3. Mi se brinemo o svemu", desc: "Šaljemo Vam slike pre i posle svake posete." },
    },
    testimonials: {
      title: "Šta kažu naši klijenti",
      subtitle: "Porodice iz dijaspore i stariji sugrađani veruju nam svoje bašte",
      items: [
        { quote: "Vraćamo se iz Beča svako leto u savršeno uređenu baštu. Vredi svake pare!", author: "Marija J.", location: "Beč → Novi Sad" },
        { quote: "Otkad mi pomažu, dvorište mojih roditelja izgleda kao nikad ranije.", author: "Stefan M.", location: "Frankfurt → Kragujevac" },
        { quote: "Profesionalno, tačno i pristupačno. Najtoplije preporuke.", author: "Ana P.", location: "Cirih → Niš" },
      ],
    },
    faq: {
      title: "Često postavljana pitanja",
      items: [
        { q: "Da li je narudžbina obavezujuća?", a: "Ne. Vaša narudžbina je potpuno neobavezujuća — kontaktiramo Vas radi potvrde i konačnog dogovora." },
        { q: "Kako plaćam ako sam u inostranstvu?", a: "Plaćanje je moguće preko bankarskog transfera, IPS-a ili gotovinom prilikom Vaše posete Srbiji." },
        { q: "Šaljete li izveštaje i slike?", a: "Da, posle svake posete dobijate fotografije i kratak izveštaj putem Vibera, WhatsAppa ili e-maila." },
        { q: "Koje gradove pokrivate?", a: "Pokrivamo veliki deo Srbije. Kontaktirajte nas za potvrdu Vašeg mesta." },
      ],
    }
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
      rating: "4.9 / 5 (120+ оцена)",
      happyClients: "300+ задовољних клијената",
      sinceYear: "Од 2019.",
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
      selected: "Изабрано",
      add: "Додај",
      remove: "Уклони",
      monthlyMini: "/ месец",
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
      submitting: "Шаље се...",
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
      itemsCount: (n) => n === 1 ? "1 услуга" : (n >= 2 && n <= 4) ? n + " услуге" : n + " услуга",
      continueToContact: "Настави на контакт",
      backToServices: "Назад на услуге",
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
    footer: { tagline: "Одржавање баште и дворишта широм Србије", contact: "Контакт", whatsapp: "WhatsApp", call: "Позови" },
    langSwitcher: { language: "Језик", script: "Писмо", latin: "Латиница", cyrillic: "Ћирилица" },
    meta: {
      title: "Зелена Оаза — Одржавање баште за дијаспору и старије",
      description:
        "Професионално одржавање баште и дворишта у Србији: заливање, кошење, плевљење. Израчунајте цену у РСД и поручите необавезујуће.",
    },,
    steps: {
      title: "Како функционише",
      subtitle: "Три једноставна корака до уређене баште",
      s1: { title: "1. Саставите пакет", desc: "Означите услуге и унесите површину — цена се рачуна одмах." },
      s2: { title: "2. Пошаљите необавезујућу наруџбину", desc: "Јављамо Вам се у року од 24ч ради потврде термина." },
      s3: { title: "3. Ми се бринемо о свему", desc: "Шаљемо Вам слике пре и после сваке посете." },
    },
    testimonials: {
      title: "Шта кажу наши клијенти",
      subtitle: "Породице из дијаспоре и старији суграђани верују нам своје баште",
      items: [
        { quote: "Враћамо се из Беча свако лето у савршено уређену башту. Вреди сваке паре!", author: "Марија Ј.", location: "Беч → Нови Сад" },
        { quote: "Откад ми помажу, двориште мојих родитеља изгледа као никад раније.", author: "Стефан М.", location: "Франкфурт → Крагујевац" },
        { quote: "Професионално, тачно и приступачно. Најтоплије препоруке.", author: "Ана П.", location: "Цирих → Ниш" },
      ],
    },
    faq: {
      title: "Често постављана питања",
      items: [
        { q: "Да ли је наруџбина обавезујућа?", a: "Не. Ваша наруџбина је потпуно необавезујућа — контактирамо Вас ради потврде и коначног договора." },
        { q: "Како плаћам ако сам у иностранству?", a: "Плаћање је могуће преко банкарског трансфера, ИПС-а или готовином приликом Ваше посете Србији." },
        { q: "Шаљете ли извештаје и слике?", a: "Да, после сваке посете добијате фотографије и кратак извештај путем Вибера, WhatsAppa или е-маила." },
        { q: "Које градове покривате?", a: "Покривамо велики део Србије. Контактирајте нас за потврду Вашег места." },
      ],
    }
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
      rating: "4,9 / 5 (120+ Bewertungen)",
      happyClients: "300+ zufriedene Kunden",
      sinceYear: "Seit 2019",
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
      selected: "Ausgewählt",
      add: "Hinzufügen",
      remove: "Entfernen",
      monthlyMini: "/ Monat",
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
      submitting: "Wird gesendet...",
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
      itemsCount: (n) => n === 1 ? "1 Leistung" : n + " Leistungen",
      continueToContact: "Weiter zum Kontakt",
      backToServices: "Zurück zu den Leistungen",
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
    footer: { tagline: "Garten- und Hofpflege in ganz Serbien", contact: "Kontakt", whatsapp: "WhatsApp", call: "Anrufen" },
    langSwitcher: { language: "Sprache", script: "Schrift", latin: "Lateinisch", cyrillic: "Kyrillisch" },
    meta: {
      title: "Zelena Oaza — Gartenpflege für die Diaspora und Senioren",
      description:
        "Professionelle Garten- und Hofpflege in Serbien: Gießen, Mähen, Jäten. Preis in RSD berechnen und unverbindlich bestellen.",
    },,
    steps: {
      title: "So funktioniert's",
      subtitle: "In drei einfachen Schritten zum gepflegten Garten",
      s1: { title: "1. Paket zusammenstellen", desc: "Leistungen wählen und Fläche angeben — der Preis wird sofort berechnet." },
      s2: { title: "2. Unverbindliche Bestellung absenden", desc: "Wir melden uns innerhalb von 24h zur Terminbestätigung." },
      s3: { title: "3. Wir kümmern uns um alles", desc: "Sie erhalten Vorher-/Nachher-Fotos nach jedem Einsatz." },
    },
    testimonials: {
      title: "Was unsere Kunden sagen",
      subtitle: "Familien aus der Diaspora und Senioren vertrauen uns ihren Garten an",
      items: [
        { quote: "Wir kommen jeden Sommer aus Wien zurück in einen perfekt gepflegten Garten. Jeden Cent wert!", author: "Marija J.", location: "Wien → Novi Sad" },
        { quote: "Seit sie mir helfen, sieht der Garten meiner Eltern besser aus als je zuvor.", author: "Stefan M.", location: "Frankfurt → Kragujevac" },
        { quote: "Professionell, pünktlich und bezahlbar. Wärmste Empfehlung!", author: "Ana P.", location: "Zürich → Niš" },
      ],
    },
    faq: {
      title: "Häufige Fragen",
      items: [
        { q: "Ist die Bestellung verbindlich?", a: "Nein. Ihre Bestellung ist völlig unverbindlich — wir melden uns zur Bestätigung und endgültigen Absprache." },
        { q: "Wie zahle ich aus dem Ausland?", a: "Zahlung ist per Banküberweisung, IPS oder bar bei Ihrem nächsten Aufenthalt in Serbien möglich." },
        { q: "Bekomme ich Berichte und Fotos?", a: "Ja, nach jedem Einsatz erhalten Sie Fotos und einen kurzen Bericht via Viber, WhatsApp oder E-Mail." },
        { q: "Welche Städte deckt ihr ab?", a: "Wir decken große Teile Serbiens ab. Kontaktieren Sie uns zur Bestätigung Ihres Orts." },
      ],
    }
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
      rating: "4.9 / 5 (120+ reviews)",
      happyClients: "300+ happy clients",
      sinceYear: "Since 2019",
    },
    config: {
      sectionTitle: "Build your service package",
      sectionDesc:
        "Pick what you need, enter the area and frequency — the price is calculated instantly in RSD.",
      areaLabel: "Total yard / garden area (m²)",
      areaHelp: "Rough estimate — used as the default for area-based services.",
      presetsTitle: "Quick-pick size:",
      presets: { small: "Small (50 m²)", medium: "Medium (150 m²)", large: "Large (400 m²)", estate: "Estate (800 m²)" },
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
      selected: "Selected",
      add: "Add",
      remove: "Remove",
      monthlyMini: "/ month",
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
      submitting: "Sending...",
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
      itemsCount: (n) => n === 1 ? "1 service" : n + " services",
      continueToContact: "Continue to contact",
      backToServices: "Back to services",
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
    footer: { tagline: "Garden and yard care across Serbia", contact: "Contact", whatsapp: "WhatsApp", call: "Call" },
    langSwitcher: { language: "Language", script: "Script", latin: "Latin", cyrillic: "Cyrillic" },
    meta: {
      title: "Zelena Oaza — Garden care for the diaspora and seniors",
      description:
        "Professional garden and yard care in Serbia: watering, mowing, weeding. Calculate price in RSD and order with no obligation.",
    },,
    steps: {
      title: "How it works",
      subtitle: "Three simple steps to a perfectly tended garden",
      s1: { title: "1. Build your package", desc: "Pick services and enter the area — the price is calculated instantly." },
      s2: { title: "2. Send a no-obligation order", desc: "We get back to you within 24h to confirm the schedule." },
      s3: { title: "3. We take care of everything", desc: "You receive before/after photos after every visit." },
    },
    testimonials: {
      title: "What our clients say",
      subtitle: "Diaspora families and senior residents trust us with their gardens",
      items: [
        { quote: "We return from Vienna every summer to a perfectly tended garden. Worth every penny!", author: "Marija J.", location: "Vienna → Novi Sad" },
        { quote: "Since they've been helping, my parents' yard looks better than ever.", author: "Stefan M.", location: "Frankfurt → Kragujevac" },
        { quote: "Professional, on time and affordable. Warmest recommendation!", author: "Ana P.", location: "Zurich → Niš" },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        { q: "Is the order binding?", a: "No. Your order is completely non-binding — we contact you for confirmation and final agreement." },
        { q: "How do I pay from abroad?", a: "Payment is possible via bank transfer, IPS, or cash on your next visit to Serbia." },
        { q: "Do I get reports and photos?", a: "Yes, after every visit you receive photos and a short report via Viber, WhatsApp or email." },
        { q: "Which cities do you cover?", a: "We cover most of Serbia. Contact us to confirm your location." },
      ],
    }
  },
};