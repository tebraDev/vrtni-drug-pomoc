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
    serviceArea: string;
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
    cityPlaceholder: string;
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
  send: {
    chooseTitle: string;
    chooseDesc: string;
    submit: string;
    submitting: string;
    sentTitle: string;
    sentDesc: string;
    errorTitle: string;
    errorDesc: string;
    callFallback: string;
    greeting: string;
    summaryHeader: string;
    contactHeader: string;
    notesHeader: string;
    totalLabel: string;
    monthlySuffix: string;
    closing: string;
  };
  meta: { title: string; description: string };
  privacy: {
    consentLabel: string;
    consentLink: string;
    consentRequired: string;
    inlineNotice: string;
    footerLink: string;
    dialogTitle: string;
    lastUpdated: string;
    sections: { title: string; body: string }[];
    close: string;
  };
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
  gallery: {
    title: string;
    subtitle: string;
    dragHint: string;
    before: string;
    after: string;
    items: { title: string; desc: string }[];
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
      trust: { reliable: "Pouzdano", onTime: "Tačno na vreme", allSerbia: "Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac" },
      serviceArea: "Radimo u: Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac",
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
      presetsTitle: "Brzo izaberite veličinu:",
      presets: { small: "Mala (50 m²)", medium: "Srednja (150 m²)", large: "Velika (400 m²)", estate: "Imanje (800 m²)" },
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
      cityPlaceholder: "Izaberite grad",
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
    footer: { tagline: "Održavanje bašte i dvorišta — Trstenik, Kruševac, Vrnjačka Banja, Aleksandrovac", contact: "Kontakt", whatsapp: "WhatsApp", call: "Pozovi" },
    langSwitcher: { language: "Jezik", script: "Pismo", latin: "Latinica", cyrillic: "Ćirilica" },
    send: {
      chooseTitle: "Pošaljite narudžbinu",
      chooseDesc: "Izaberite kako želite da nam pošaljete narudžbinu — bez registracije i bez čuvanja podataka na sajtu.",
      whatsapp: "WhatsApp",
      viber: "Viber",
      email: "E-mail",
      call: "Pozovi",
      fallbackHint: "Ako nijedna opcija ne radi, pozovite nas direktno.",
      subject: "Nova narudžbina — Zelena Oaza",
      greeting: "Poštovani, želim da poručim sledeće usluge:",
      summaryHeader: "Usluge:",
      contactHeader: "Kontakt:",
      notesHeader: "Napomene:",
      totalLabel: "Mesečna procena",
      closing: "Hvala!",
    },
    meta: {
      title: "Zelena Oaza — Održavanje bašte za dijasporu i starije",
      description:
        "Održavanje bašte i dvorišta u Trsteniku, Kruševcu, Vrnjačkoj Banji i Aleksandrovcu: zalivanje, košenje, plevljenje. Cena u RSD, neobavezujuće.",
    },
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
        { q: "Koje gradove pokrivate?", a: "Trenutno radimo u Trsteniku, Kruševcu, Vrnjačkoj Banji i Aleksandrovcu. Za okolna sela nas kontaktirajte." },
      ],
    },
    gallery: {
      title: "Pre i posle — naš rad govori umesto nas",
      subtitle: "Povucite slajder i vidite transformaciju iz prve ruke",
      dragHint: "← povucite za poređenje →",
      before: "Pre",
      after: "Posle",
      items: [
        { title: "Košenje zapuštenog travnjaka", desc: "Visoka trava i korov pretvoreni u negovani travnjak" },
        { title: "Orezivanje žive ograde", desc: "Divlja živica oblikovana u čistu, pravilnu formu" },
        { title: "Plevljenje i uređenje leja", desc: "Korov uklonjen, zemlja okopana i spremna za biljke" },
      ],
    },
    privacy: {
      consentLabel: "Saglasan/na sam da se moji podaci (ime, telefon, opciono adresa i napomene) koriste isključivo radi kontakta i pripreme ponude.",
      consentLink: "Pročitajte Politiku privatnosti",
      consentRequired: "Morate prihvatiti Politiku privatnosti da biste poslali zahtev.",
      inlineNotice: "Vaši podaci se koriste samo za kontakt u vezi sa ovom narudžbinom. Ne prosleđujemo ih trećim licima i ne koristimo za marketing bez Vaše izričite saglasnosti.",
      footerLink: "Politika privatnosti",
      dialogTitle: "Politika privatnosti",
      lastUpdated: "Poslednje ažuriranje: april 2026.",
      close: "Zatvori",
      sections: [
        { title: "1. Rukovalac podataka", body: "Zelena Oaza (vlasnik / preduzetnik) — kontakt: [ime, adresa, e-mail]. Rukovalac u smislu Zakona o zaštiti podataka o ličnosti Republike Srbije („ZZPL“, Sl. glasnik RS br. 87/2018)." },
        { title: "2. Koje podatke prikupljamo", body: "Putem kontakt forme: ime i prezime, broj telefona, opciono grad/adresa i napomene. Sajt ne koristi kolačiće za praćenje, niti analitiku trećih strana. Hosting: GitHub Pages (statički sajt, bez baze podataka — podaci se šalju direktno nama putem WhatsApp-a/poziva)." },
        { title: "3. Svrha obrade", body: "Podatke koristimo isključivo da Vas kontaktiramo radi potvrde narudžbine, dogovora termina i izrade ponude. Ne koristimo ih za marketing bez Vaše izričite, dodatne saglasnosti." },
        { title: "4. Pravni osnov", body: "Vaša saglasnost (čl. 12 st. 1 tač. 1 ZZPL) data potvrdom polja za saglasnost u formi, kao i preduzimanje radnji pre zaključenja ugovora na Vaš zahtev (čl. 12 st. 1 tač. 2 ZZPL)." },
        { title: "5. Rok čuvanja", body: "Podatke iz upita čuvamo najviše 12 meseci od poslednjeg kontakta. Ukoliko dođe do zaključenja ugovora, računovodstvene podatke čuvamo onoliko koliko zahteva poreski i računovodstveni propis (do 5 godina)." },
        { title: "6. Primaoci podataka", body: "Podaci se ne prosleđuju trećim licima. Komunikacija može ići preko WhatsApp-a (Meta Platforms Ireland) ako Vi tako kontaktirate — u tom slučaju važe i njihovi uslovi privatnosti." },
        { title: "7. Vaša prava", body: "Imate pravo na: pristup podacima, ispravku, brisanje, ograničenje obrade, prenosivost, prigovor i opoziv saglasnosti u svakom trenutku. Zahtev šaljete na naš kontakt e-mail. Imate i pravo pritužbe Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti (www.poverenik.rs)." },
        { title: "8. Bezbednost", body: "Sajt se servira preko HTTPS-a (GitHub Pages). Pristup porukama imamo samo mi. Nemamo bazu podataka na samom sajtu." },
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
      trust: { reliable: "Поуздано", onTime: "Тачно на време", allSerbia: "Трстеник · Крушевац · Врњачка Бања · Александровац" },
      serviceArea: "Радимо у: Трстеник · Крушевац · Врњачка Бања · Александровац",
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
      presetsTitle: "Брзо изаберите величину:",
      presets: { small: "Мала (50 m²)", medium: "Средња (150 m²)", large: "Велика (400 m²)", estate: "Имање (800 m²)" },
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
      cityPlaceholder: "Изаберите град",
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
    footer: { tagline: "Одржавање баште и дворишта — Трстеник, Крушевац, Врњачка Бања, Александровац", contact: "Контакт", whatsapp: "WhatsApp", call: "Позови" },
    langSwitcher: { language: "Језик", script: "Писмо", latin: "Латиница", cyrillic: "Ћирилица" },
    send: {
      chooseTitle: "Пошаљите наруџбину",
      chooseDesc: "Изаберите како желите да нам пошаљете наруџбину — без регистрације и без чувања података на сајту.",
      whatsapp: "WhatsApp",
      viber: "Viber",
      email: "Е-маил",
      call: "Позови",
      fallbackHint: "Ако ниједна опција не ради, позовите нас директно.",
      subject: "Нова наруџбина — Зелена Оаза",
      greeting: "Поштовани, желим да поручим следеће услуге:",
      summaryHeader: "Услуге:",
      contactHeader: "Контакт:",
      notesHeader: "Напомене:",
      totalLabel: "Месечна процена",
      closing: "Хвала!",
    },
    meta: {
      title: "Зелена Оаза — Одржавање баште за дијаспору и старије",
      description:
        "Одржавање баште и дворишта у Трстенику, Крушевцу, Врњачкој Бањи и Александровцу: заливање, кошење, плевљење. Цена у РСД, необавезујуће.",
    },
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
        { q: "Које градове покривате?", a: "Тренутно радимо у Трстенику, Крушевцу, Врњачкој Бањи и Александровцу. За околна села нас контактирајте." },
      ],
    },
    gallery: {
      title: "Пре и после — наш рад говори уместо нас",
      subtitle: "Повуците слајдер и видите трансформацију из прве руке",
      dragHint: "← повуците за поређење →",
      before: "Пре",
      after: "После",
      items: [
        { title: "Кошење запуштеног травњака", desc: "Висока трава и коров претворени у негован травњак" },
        { title: "Орезивање живе ограде", desc: "Дивља живица обликована у чисту, правилну форму" },
        { title: "Плевљење и уређење леја", desc: "Коров уклоњен, земља окопана и спремна за биљке" },
      ],
    },
    privacy: {
      consentLabel: "Сагласан/на сам да се моји подаци (име, телефон, опционо адреса и напомене) користе искључиво ради контакта и припреме понуде.",
      consentLink: "Прочитајте Политику приватности",
      consentRequired: "Морате прихватити Политику приватности да бисте послали захтев.",
      inlineNotice: "Ваши подаци се користе само за контакт у вези са овом наруџбином. Не прослеђујемо их трећим лицима и не користимо за маркетинг без Ваше изричите сагласности.",
      footerLink: "Политика приватности",
      dialogTitle: "Политика приватности",
      lastUpdated: "Последње ажурирање: април 2026.",
      close: "Затвори",
      sections: [
        { title: "1. Руковалац подацима", body: "Зелена Оаза (власник / предузетник) — контакт: [име, адреса, е-маил]. Руковалац у смислу Закона о заштити података о личности Републике Србије („ЗЗПЛ“, Сл. гласник РС бр. 87/2018)." },
        { title: "2. Које податке прикупљамо", body: "Путем контакт форме: име и презиме, број телефона, опционо град/адреса и напомене. Сајт не користи колачиће за праћење, нити аналитику трећих страна. Хостинг: GitHub Pages (статички сајт, без базе података — подаци се шаљу директно нама путем WhatsApp-а/позива)." },
        { title: "3. Сврха обраде", body: "Податке користимо искључиво да Вас контактирамо ради потврде наруџбине, договора термина и израде понуде. Не користимо их за маркетинг без Ваше изричите, додатне сагласности." },
        { title: "4. Правни основ", body: "Ваша сагласност (чл. 12 ст. 1 тач. 1 ЗЗПЛ) дата потврдом поља за сагласност у форми, као и предузимање радњи пре закључења уговора на Ваш захтев (чл. 12 ст. 1 тач. 2 ЗЗПЛ)." },
        { title: "5. Рок чувања", body: "Податке из упита чувамо највише 12 месеци од последњег контакта. Уколико дође до закључења уговора, рачуноводствене податке чувамо онолико колико захтева порески и рачуноводствени пропис (до 5 година)." },
        { title: "6. Примаоци података", body: "Подаци се не прослеђују трећим лицима. Комуникација може ићи преко WhatsApp-а (Meta Platforms Ireland) ако Ви тако контактирате — у том случају важе и њихови услови приватности." },
        { title: "7. Ваша права", body: "Имате право на: приступ подацима, исправку, брисање, ограничење обраде, преносивост, приговор и опозив сагласности у сваком тренутку. Захтев шаљете на наш контакт е-маил. Имате и право притужбе Поверенику за информације од јавног значаја и заштиту података о личности (www.poverenik.rs)." },
        { title: "8. Безбедност", body: "Сајт се сервира преко HTTPS-а (GitHub Pages). Приступ порукама имамо само ми. Немамо базу података на самом сајту." },
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
      trust: { reliable: "Zuverlässig", onTime: "Pünktlich", allSerbia: "Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac" },
      serviceArea: "Einsatzgebiet: Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac",
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
      presetsTitle: "Größe schnell auswählen:",
      presets: { small: "Klein (50 m²)", medium: "Mittel (150 m²)", large: "Groß (400 m²)", estate: "Anwesen (800 m²)" },
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
      cityPlaceholder: "Stadt auswählen",
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
    footer: { tagline: "Garten- und Hofpflege — Trstenik, Kruševac, Vrnjačka Banja, Aleksandrovac", contact: "Kontakt", whatsapp: "WhatsApp", call: "Anrufen" },
    langSwitcher: { language: "Sprache", script: "Schrift", latin: "Lateinisch", cyrillic: "Kyrillisch" },
    send: {
      chooseTitle: "Bestellung senden",
      chooseDesc: "Wählen Sie, wie Sie uns die Bestellung senden möchten — ohne Registrierung und ohne Datenspeicherung auf der Seite.",
      whatsapp: "WhatsApp",
      viber: "Viber",
      email: "E-Mail",
      call: "Anrufen",
      fallbackHint: "Falls keine Option funktioniert, rufen Sie uns bitte direkt an.",
      subject: "Neue Bestellung — Zelena Oaza",
      greeting: "Guten Tag, ich möchte folgende Leistungen bestellen:",
      summaryHeader: "Leistungen:",
      contactHeader: "Kontakt:",
      notesHeader: "Anmerkungen:",
      totalLabel: "Monatliche Schätzung",
      closing: "Danke!",
    },
    meta: {
      title: "Zelena Oaza — Gartenpflege für die Diaspora und Senioren",
      description:
        "Garten- und Hofpflege in Trstenik, Kruševac, Vrnjačka Banja und Aleksandrovac: Gießen, Mähen, Jäten. Preis in RSD, unverbindlich.",
    },
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
        { q: "Welche Städte deckt ihr ab?", a: "Aktuell arbeiten wir in Trstenik, Kruševac, Vrnjačka Banja und Aleksandrovac. Für umliegende Dörfer bitte kurz anfragen." },
      ],
    },
    gallery: {
      title: "Vorher & Nachher — unsere Arbeit spricht für sich",
      subtitle: "Ziehen Sie den Regler und sehen Sie die Verwandlung direkt",
      dragHint: "← ziehen zum Vergleichen →",
      before: "Vorher",
      after: "Nachher",
      items: [
        { title: "Verwilderten Rasen mähen", desc: "Hohes Gras und Unkraut in einen gepflegten Rasen verwandelt" },
        { title: "Hecke in Form schneiden", desc: "Wilde Hecke zu einer sauberen, klaren Form geschnitten" },
        { title: "Beete jäten & aufbereiten", desc: "Unkraut entfernt, Boden gelockert und pflanzbereit" },
      ],
    },
    privacy: {
      consentLabel: "Ich bin damit einverstanden, dass meine Angaben (Name, Telefon, optional Adresse und Notizen) ausschließlich zur Kontaktaufnahme und Angebotserstellung genutzt werden.",
      consentLink: "Datenschutzerklärung lesen",
      consentRequired: "Bitte stimmen Sie der Datenschutzerklärung zu, um die Anfrage zu senden.",
      inlineNotice: "Ihre Daten werden ausschließlich für den Kontakt zu dieser Anfrage verwendet. Keine Weitergabe an Dritte, kein Marketing ohne Ihre ausdrückliche Einwilligung.",
      footerLink: "Datenschutzerklärung",
      dialogTitle: "Datenschutzerklärung",
      lastUpdated: "Stand: April 2026",
      close: "Schließen",
      sections: [
        { title: "1. Verantwortlicher", body: "Zelena Oaza (Inhaber / Unternehmer) — Kontakt: [Name, Adresse, E-Mail]. Verantwortlicher im Sinne des serbischen Gesetzes über den Schutz personenbezogener Daten („ZZPL“, Amtsblatt RS Nr. 87/2018), das eng an die DSGVO angelehnt ist." },
        { title: "2. Welche Daten wir erheben", body: "Über das Kontaktformular: Name, Telefonnummer, optional Stadt/Adresse und Anmerkungen. Die Website verwendet keine Tracking-Cookies und keine Drittanbieter-Analytik. Hosting: GitHub Pages (statische Seite, keine Datenbank — Daten gehen direkt über WhatsApp/Anruf an uns)." },
        { title: "3. Zweck der Verarbeitung", body: "Wir verwenden die Daten ausschließlich, um Sie zur Bestätigung der Anfrage, Terminabsprache und Angebotserstellung zu kontaktieren. Keine Marketingnutzung ohne ausdrückliche, separate Einwilligung." },
        { title: "4. Rechtsgrundlage", body: "Ihre Einwilligung (Art. 12 Abs. 1 Nr. 1 ZZPL) durch Ankreuzen des Einwilligungsfeldes sowie vorvertragliche Maßnahmen auf Ihre Anfrage hin (Art. 12 Abs. 1 Nr. 2 ZZPL)." },
        { title: "5. Speicherdauer", body: "Anfragedaten speichern wir maximal 12 Monate nach dem letzten Kontakt. Kommt es zu einem Vertrag, gelten die steuer- und buchhaltungsrechtlichen Aufbewahrungsfristen (bis 5 Jahre)." },
        { title: "6. Empfänger", body: "Keine Weitergabe an Dritte. Falls Sie über WhatsApp (Meta Platforms Ireland) kommunizieren, gelten zusätzlich deren Datenschutzbedingungen." },
        { title: "7. Ihre Rechte", body: "Sie haben Recht auf: Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit, Widerspruch und jederzeitigen Widerruf der Einwilligung. Anfragen an unsere Kontakt-E-Mail. Beschwerderecht beim serbischen Datenschutzbeauftragten (www.poverenik.rs)." },
        { title: "8. Sicherheit", body: "Auslieferung über HTTPS (GitHub Pages). Zugriff auf eingehende Nachrichten haben nur wir. Keine Datenbank auf der Website selbst." },
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
      trust: { reliable: "Reliable", onTime: "On time", allSerbia: "Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac" },
      serviceArea: "Service area: Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac",
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
      cityPlaceholder: "Select city",
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
    footer: { tagline: "Garden and yard care — Trstenik, Kruševac, Vrnjačka Banja, Aleksandrovac", contact: "Contact", whatsapp: "WhatsApp", call: "Call" },
    langSwitcher: { language: "Language", script: "Script", latin: "Latin", cyrillic: "Cyrillic" },
    send: {
      chooseTitle: "Send your order",
      chooseDesc: "Choose how you want to send the order — no registration, no data stored on the site.",
      whatsapp: "WhatsApp",
      viber: "Viber",
      email: "Email",
      call: "Call",
      fallbackHint: "If none of the options works, please call us directly.",
      subject: "New order — Zelena Oaza",
      greeting: "Hello, I would like to order the following services:",
      summaryHeader: "Services:",
      contactHeader: "Contact:",
      notesHeader: "Notes:",
      totalLabel: "Monthly estimate",
      closing: "Thank you!",
    },
    meta: {
      title: "Zelena Oaza — Garden care for the diaspora and seniors",
      description:
        "Garden and yard care in Trstenik, Kruševac, Vrnjačka Banja and Aleksandrovac: watering, mowing, weeding. Price in RSD, no obligation.",
    },
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
        { q: "Which cities do you cover?", a: "Currently Trstenik, Kruševac, Vrnjačka Banja and Aleksandrovac. For nearby villages, just ask." },
      ],
    },
    gallery: {
      title: "Before & after — our work speaks for itself",
      subtitle: "Drag the slider and see the transformation first-hand",
      dragHint: "← drag to compare →",
      before: "Before",
      after: "After",
      items: [
        { title: "Mowing an overgrown lawn", desc: "Tall grass and weeds turned into a well-kept lawn" },
        { title: "Trimming a wild hedge", desc: "Wild hedge shaped into a clean, defined form" },
        { title: "Weeding & prepping beds", desc: "Weeds removed, soil loosened and ready to plant" },
      ],
    },
    privacy: {
      consentLabel: "I consent to my details (name, phone, optional address and notes) being used solely to contact me and prepare a quote.",
      consentLink: "Read the Privacy Policy",
      consentRequired: "You must accept the Privacy Policy to send the request.",
      inlineNotice: "Your data is used only to contact you about this enquiry. Never shared with third parties, never used for marketing without your explicit consent.",
      footerLink: "Privacy Policy",
      dialogTitle: "Privacy Policy",
      lastUpdated: "Last updated: April 2026",
      close: "Close",
      sections: [
        { title: "1. Data controller", body: "Zelena Oaza (owner / sole trader) — contact: [name, address, e-mail]. Controller under the Serbian Personal Data Protection Act (\"ZZPL\", Official Gazette RS no. 87/2018), closely aligned with the GDPR." },
        { title: "2. What we collect", body: "Via the contact form: name, phone number, optional city/address and notes. The site uses no tracking cookies and no third-party analytics. Hosting: GitHub Pages (static site, no database — data is sent directly to us via WhatsApp/phone)." },
        { title: "3. Purpose", body: "We use the data only to contact you to confirm the order, agree on a schedule and prepare a quote. No marketing use without your explicit, separate consent." },
        { title: "4. Legal basis", body: "Your consent (Art. 12(1)(1) ZZPL) given by ticking the consent box, and pre-contractual steps at your request (Art. 12(1)(2) ZZPL)." },
        { title: "5. Retention", body: "Enquiry data is kept for at most 12 months after the last contact. If a contract is signed, accounting data is kept as required by Serbian tax and accounting law (up to 5 years)." },
        { title: "6. Recipients", body: "Data is not shared with third parties. If you reach out via WhatsApp (Meta Platforms Ireland), their privacy terms also apply." },
        { title: "7. Your rights", body: "You have the right to: access, rectification, erasure, restriction, portability, objection and to withdraw consent at any time. Send requests to our contact e-mail. You may also lodge a complaint with the Serbian Commissioner for Information of Public Importance and Personal Data Protection (www.poverenik.rs)." },
        { title: "8. Security", body: "Served over HTTPS (GitHub Pages). Only we have access to incoming messages. No database on the site itself." },
      ],
    }
  },
};