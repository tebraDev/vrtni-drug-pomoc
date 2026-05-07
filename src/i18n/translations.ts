export type Locale = "sr-Latn" | "sr-Cyrl" | "de" | "en";

export interface Dict {
  localeName: string;
  nav: { about: string; portfolio: string; journal: string; contact: string };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  journal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    readMore: string;
    items: { title: string; date: string; excerpt: string }[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    subtitle: string;
    dragHint: string;
    before: string;
    after: string;
    items: { title: string; desc: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    name: string;
    email: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    successTitle: string;
    successDesc: string;
    newMessage: string;
    errorTitle: string;
    errorDesc: string;
    nameRequired: string;
    messageRequired: string;
    contactHeader: string;
    notesHeader: string;
  };
  footer: { tagline: string };
  langSwitcher: { language: string; script: string; latin: string; cyrillic: string };
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
}

export const translations: Record<Locale, Dict> = {
  "sr-Latn": {
    localeName: "Srpski (latinica)",
    nav: { about: "O meni", portfolio: "Portfolio", journal: "Dnevnik", contact: "Kontakt" },
    hero: {
      badge: "Lični blog o baštama",
      title: "Bašta je moja strast",
      subtitle:
        "Već godinama provodim slobodno vreme među cvećem, voćkama i travnjacima. Ovde delim svoje projekte, beleške iz dnevnika i ljubav prema zelenom kutku.",
      ctaPrimary: "Pogledaj portfolio",
      ctaSecondary: "Pročitaj dnevnik",
    },
    about: {
      eyebrow: "O meni",
      title: "Strast koja je počela u dvorištu mojih roditelja",
      paragraphs: [
        "Sve je počelo kao pomoć baki u njenoj bašti. Vremenom je to preraslo u pravu ljubav — danas je bašta moj omiljeni način da provedem vikend.",
        "Volim da posmatram kako se zapušteni kutak polako pretvara u uređen prostor. Eksperimentišem sa rasporedom, biljkama i sezonskim cvećem, i fotografišem svaki korak.",
        "Ovaj sajt nije ponuda usluga — to je moj lični dnevnik i portfolio projekata na kojima sam radio iz čistog uživanja.",
      ],
    },
    journal: {
      eyebrow: "Dnevnik",
      title: "Beleške iz bašte",
      subtitle: "Razmišljanja, sezonski podsetnici i sitne pobede",
      readMore: "Pročitaj više",
      items: [
        {
          title: "Proleće — kada bašta opet diše",
          date: "Mart",
          excerpt:
            "Prvi topli dani uvek donose istu radost: pripremanje zemlje, planiranje leja i sanjarenje o tome šta će ove godine procvetati.",
        },
        {
          title: "Orezivanje voćki — strpljenje pre svega",
          date: "Februar",
          excerpt:
            "Naučio sam da voćke ne vole žurbu. Mali, promišljeni rezovi daju bolje plodove nego veliki zahvati u jednom danu.",
        },
        {
          title: "Travnjak posle suše — male tajne",
          date: "Avgust",
          excerpt:
            "Posle vrelog leta travnjak izgleda izgubljeno. Par jednostavnih koraka i za dve nedelje opet je zelen.",
        },
      ],
    },
    gallery: {
      eyebrow: "Portfolio",
      title: "Pre i posle — projekti iz mog dvorišta i okoline",
      subtitle: "Povucite slajder i pogledajte transformaciju",
      dragHint: "← povucite za poređenje →",
      before: "Pre",
      after: "Posle",
      items: [
        { title: "Travnjak — drugi život", desc: "Visoka trava i korov vraćeni u urednu, zelenu površinu" },
        { title: "Živa ograda — nova forma", desc: "Divlja živica oblikovana u čistu liniju" },
        { title: "Leje — od korova do cveća", desc: "Korov uklonjen, zemlja pripremljena, biljke posađene" },
      ],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Pišite mi",
      subtitle:
        "Ako imate pitanje o bašti, želite da podelite iskustvo ili samo da pozdravite — slobodno mi pišite.",
      name: "Ime",
      email: "E-mail ili telefon (opciono)",
      message: "Poruka",
      messagePlaceholder: "Napišite par reči...",
      send: "Pošalji poruku",
      sending: "Šalje se…",
      successTitle: "Hvala na poruci ✓",
      successDesc: "Pročitao sam je i odgovoriću čim stignem. Lep pozdrav!",
      newMessage: "Pošalji novu poruku",
      errorTitle: "Slanje nije uspelo",
      errorDesc: "Molim Vas pokušajte ponovo malo kasnije.",
      nameRequired: "Molim Vas unesite ime.",
      messageRequired: "Molim Vas napišite par reči.",
      contactHeader: "Kontakt:",
      notesHeader: "Poruka:",
    },
    footer: { tagline: "Lični blog o baštama i zelenim kutcima" },
    langSwitcher: { language: "Jezik", script: "Pismo", latin: "Latinica", cyrillic: "Ćirilica" },
    meta: {
      title: "Zelena Oaza — lični blog o baštama",
      description:
        "Lični blog i portfolio projekata iz bašte. Beleške, fotografije pre/posle i razmišljanja o radu sa biljkama.",
    },
    privacy: {
      consentLabel:
        "Saglasan/na sam da se moja poruka koristi isključivo da bi mi se odgovorilo.",
      consentLink: "Pročitajte Politiku privatnosti",
      consentRequired: "Morate prihvatiti Politiku privatnosti da biste poslali poruku.",
      inlineNotice:
        "Vaša poruka se koristi samo da bih Vam odgovorio. Ne prosleđujem je trećim licima i ne koristim za marketing.",
      footerLink: "Politika privatnosti",
      dialogTitle: "Politika privatnosti",
      lastUpdated: "Poslednje ažuriranje: maj 2026.",
      close: "Zatvori",
      sections: [
        {
          title: "1. Rukovalac podataka",
          body:
            "Lični vlasnik bloga. Ovo je hobi-sajt — nije pravno lice, niti registrovana delatnost.",
        },
        {
          title: "2. Koje podatke prikupljamo",
          body:
            "Putem kontakt forme: ime, opciono e-mail/telefon i tekst poruke. Sajt ne koristi kolačiće za praćenje, niti analitiku trećih strana.",
        },
        {
          title: "3. Svrha obrade",
          body:
            "Vaše podatke koristim isključivo da bih Vam odgovorio na poruku. Ne koristim ih za marketing.",
        },
        {
          title: "4. Rok čuvanja",
          body:
            "Poruke čuvam najduže 12 meseci od poslednje prepiske, nakon čega se brišu.",
        },
        {
          title: "5. Vaša prava",
          body:
            "Imate pravo na: pristup, ispravku, brisanje i opoziv saglasnosti u svakom trenutku — javite mi i odmah ću izbrisati Vaše podatke.",
        },
      ],
    },
  },

  "sr-Cyrl": {
    localeName: "Српски (ћирилица)",
    nav: { about: "О мени", portfolio: "Портфолио", journal: "Дневник", contact: "Контакт" },
    hero: {
      badge: "Лични блог о баштама",
      title: "Башта је моја страст",
      subtitle:
        "Већ годинама проводим слободно време међу цвећем, воћкама и травњацима. Овде делим своје пројекте, белешке из дневника и љубав према зеленом кутку.",
      ctaPrimary: "Погледај портфолио",
      ctaSecondary: "Прочитај дневник",
    },
    about: {
      eyebrow: "О мени",
      title: "Страст која је почела у дворишту мојих родитеља",
      paragraphs: [
        "Све је почело као помоћ баки у њеној башти. Временом је то прерасло у праву љубав — данас је башта мој омиљени начин да проведем викенд.",
        "Волим да посматрам како се запуштени кутак полако претвара у уређен простор. Експериментишем са распоредом, биљкама и сезонским цвећем, и фотографишем сваки корак.",
        "Овај сајт није понуда услуга — то је мој лични дневник и портфолио пројеката на којима сам радио из чистог уживања.",
      ],
    },
    journal: {
      eyebrow: "Дневник",
      title: "Белешке из баште",
      subtitle: "Размишљања, сезонски подсетници и ситне победе",
      readMore: "Прочитај више",
      items: [
        { title: "Пролеће — када башта опет дише", date: "Март", excerpt: "Први топли дани увек доносе исту радост: припремање земље, планирање леја и сањарење о томе шта ће ове године процветати." },
        { title: "Орезивање воћки — стрпљење пре свега", date: "Фебруар", excerpt: "Научио сам да воћке не воле журбу. Мали, промишљени резови дају боље плодове него велики захвати у једном дану." },
        { title: "Травњак после суше — мале тајне", date: "Август", excerpt: "После врелог лета травњак изгледа изгубљено. Пар једноставних корака и за две недеље опет је зелен." },
      ],
    },
    gallery: {
      eyebrow: "Портфолио",
      title: "Пре и после — пројекти из мог дворишта и околине",
      subtitle: "Повуците слајдер и погледајте трансформацију",
      dragHint: "← повуците за поређење →",
      before: "Пре",
      after: "После",
      items: [
        { title: "Травњак — други живот", desc: "Висока трава и коров враћени у уредну, зелену површину" },
        { title: "Жива ограда — нова форма", desc: "Дивља живица обликована у чисту линију" },
        { title: "Леје — од корова до цвећа", desc: "Коров уклоњен, земља припремљена, биљке посађене" },
      ],
    },
    contact: {
      eyebrow: "Контакт",
      title: "Пишите ми",
      subtitle: "Ако имате питање о башти, желите да поделите искуство или само да поздравите — слободно ми пишите.",
      name: "Име",
      email: "Е-маил или телефон (опционо)",
      message: "Порука",
      messagePlaceholder: "Напишите пар речи...",
      send: "Пошаљи поруку",
      sending: "Шаље се…",
      successTitle: "Хвала на поруци ✓",
      successDesc: "Прочитао сам је и одговорићу чим стигнем. Леп поздрав!",
      newMessage: "Пошаљи нову поруку",
      errorTitle: "Слање није успело",
      errorDesc: "Молим Вас покушајте поново мало касније.",
      nameRequired: "Молим Вас унесите име.",
      messageRequired: "Молим Вас напишите пар речи.",
      contactHeader: "Контакт:",
      notesHeader: "Порука:",
    },
    footer: { tagline: "Лични блог о баштама и зеленим кутцима" },
    langSwitcher: { language: "Језик", script: "Писмо", latin: "Латиница", cyrillic: "Ћирилица" },
    meta: {
      title: "Зелена Оаза — лични блог о баштама",
      description: "Лични блог и портфолио пројеката из баште. Белешке, фотографије пре/после и размишљања о раду са биљкама.",
    },
    privacy: {
      consentLabel: "Сагласан/на сам да се моја порука користи искључиво да би ми се одговорило.",
      consentLink: "Прочитајте Политику приватности",
      consentRequired: "Морате прихватити Политику приватности да бисте послали поруку.",
      inlineNotice: "Ваша порука се користи само да бих Вам одговорио. Не прослеђујем је трећим лицима и не користим за маркетинг.",
      footerLink: "Политика приватности",
      dialogTitle: "Политика приватности",
      lastUpdated: "Последње ажурирање: мај 2026.",
      close: "Затвори",
      sections: [
        { title: "1. Руковалац подацима", body: "Лични власник блога. Ово је хоби-сајт — није правно лице, нити регистрована делатност." },
        { title: "2. Које податке прикупљамо", body: "Путем контакт форме: име, опционо е-маил/телефон и текст поруке. Сајт не користи колачиће за праћење, нити аналитику трећих страна." },
        { title: "3. Сврха обраде", body: "Ваше податке користим искључиво да бих Вам одговорио на поруку. Не користим их за маркетинг." },
        { title: "4. Рок чувања", body: "Поруке чувам најдуже 12 месеци од последње преписке, након чега се бришу." },
        { title: "5. Ваша права", body: "Имате право на: приступ, исправку, брисање и опозив сагласности у сваком тренутку — јавите ми и одмах ћу избрисати Ваше податке." },
      ],
    },
  },

  de: {
    localeName: "Deutsch",
    nav: { about: "Über mich", portfolio: "Portfolio", journal: "Tagebuch", contact: "Kontakt" },
    hero: {
      badge: "Persönlicher Garten-Blog",
      title: "Der Garten ist meine Leidenschaft",
      subtitle:
        "Seit Jahren verbringe ich meine freie Zeit zwischen Blumen, Obstbäumen und Rasenflächen. Hier teile ich meine Projekte, Tagebuch-Notizen und meine Liebe zum grünen Rückzugsort.",
      ctaPrimary: "Portfolio ansehen",
      ctaSecondary: "Tagebuch lesen",
    },
    about: {
      eyebrow: "Über mich",
      title: "Eine Leidenschaft, die im Garten meiner Eltern begann",
      paragraphs: [
        "Alles begann damit, dass ich meiner Großmutter im Garten geholfen habe. Mit der Zeit wurde daraus echte Liebe — heute ist der Garten meine liebste Art, das Wochenende zu verbringen.",
        "Ich liebe es zu beobachten, wie sich eine vernachlässigte Ecke langsam in einen gepflegten Ort verwandelt. Ich experimentiere mit Anordnung, Pflanzen und saisonalen Blüten und fotografiere jeden Schritt.",
        "Diese Seite ist kein Dienstleistungsangebot — sie ist mein persönliches Tagebuch und Portfolio von Projekten, die ich aus reiner Freude umgesetzt habe.",
      ],
    },
    journal: {
      eyebrow: "Tagebuch",
      title: "Notizen aus dem Garten",
      subtitle: "Gedanken, saisonale Erinnerungen und kleine Erfolge",
      readMore: "Weiterlesen",
      items: [
        { title: "Frühling — wenn der Garten wieder atmet", date: "März", excerpt: "Die ersten warmen Tage bringen immer dieselbe Freude: Erde vorbereiten, Beete planen und davon träumen, was dieses Jahr blühen wird." },
        { title: "Obstbaumschnitt — Geduld zuerst", date: "Februar", excerpt: "Ich habe gelernt, dass Obstbäume keine Eile mögen. Kleine, durchdachte Schnitte bringen bessere Früchte als große Eingriffe an einem Tag." },
        { title: "Rasen nach der Dürre — kleine Geheimnisse", date: "August", excerpt: "Nach einem heißen Sommer wirkt der Rasen verloren. Ein paar einfache Schritte und nach zwei Wochen ist er wieder grün." },
      ],
    },
    gallery: {
      eyebrow: "Portfolio",
      title: "Vorher & Nachher — Projekte aus meinem Garten und der Umgebung",
      subtitle: "Ziehen Sie den Regler und sehen Sie die Verwandlung",
      dragHint: "← ziehen zum Vergleichen →",
      before: "Vorher",
      after: "Nachher",
      items: [
        { title: "Rasen — zweites Leben", desc: "Hohes Gras und Unkraut zurück in eine gepflegte, grüne Fläche verwandelt" },
        { title: "Hecke — neue Form", desc: "Wilde Hecke in eine klare Linie geschnitten" },
        { title: "Beete — von Unkraut zu Blüten", desc: "Unkraut entfernt, Boden vorbereitet, Pflanzen gesetzt" },
      ],
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Schreiben Sie mir",
      subtitle: "Wenn Sie eine Frage zum Garten haben, eine Erfahrung teilen oder einfach Hallo sagen möchten — schreiben Sie mir gerne.",
      name: "Name",
      email: "E-Mail oder Telefon (optional)",
      message: "Nachricht",
      messagePlaceholder: "Schreiben Sie ein paar Worte...",
      send: "Nachricht senden",
      sending: "Wird gesendet…",
      successTitle: "Danke für Ihre Nachricht ✓",
      successDesc: "Ich habe sie gelesen und antworte, sobald ich kann. Liebe Grüße!",
      newMessage: "Neue Nachricht senden",
      errorTitle: "Senden fehlgeschlagen",
      errorDesc: "Bitte versuchen Sie es etwas später erneut.",
      nameRequired: "Bitte geben Sie Ihren Namen ein.",
      messageRequired: "Bitte schreiben Sie ein paar Worte.",
      contactHeader: "Kontakt:",
      notesHeader: "Nachricht:",
    },
    footer: { tagline: "Persönlicher Blog über Gärten und grüne Rückzugsorte" },
    langSwitcher: { language: "Sprache", script: "Schrift", latin: "Lateinisch", cyrillic: "Kyrillisch" },
    meta: {
      title: "Zelena Oaza — persönlicher Garten-Blog",
      description: "Persönlicher Blog und Portfolio von Gartenprojekten. Notizen, Vorher/Nachher-Fotos und Gedanken zum Arbeiten mit Pflanzen.",
    },
    privacy: {
      consentLabel: "Ich bin damit einverstanden, dass meine Nachricht ausschließlich zur Beantwortung verwendet wird.",
      consentLink: "Datenschutzerklärung lesen",
      consentRequired: "Bitte stimmen Sie der Datenschutzerklärung zu, um die Nachricht zu senden.",
      inlineNotice: "Ihre Nachricht wird ausschließlich verwendet, um Ihnen zu antworten. Keine Weitergabe an Dritte, kein Marketing.",
      footerLink: "Datenschutzerklärung",
      dialogTitle: "Datenschutzerklärung",
      lastUpdated: "Stand: Mai 2026",
      close: "Schließen",
      sections: [
        { title: "1. Verantwortlicher", body: "Privater Blog-Inhaber. Dies ist eine Hobby-Seite — keine juristische Person und kein gewerbliches Angebot." },
        { title: "2. Welche Daten erhoben werden", body: "Über das Kontaktformular: Name, optional E-Mail/Telefon und Nachrichtentext. Keine Tracking-Cookies, keine Drittanbieter-Analytik." },
        { title: "3. Zweck", body: "Ihre Daten werden ausschließlich verwendet, um Ihnen auf Ihre Nachricht zu antworten. Keine Marketingnutzung." },
        { title: "4. Speicherdauer", body: "Nachrichten werden maximal 12 Monate nach dem letzten Austausch aufbewahrt und danach gelöscht." },
        { title: "5. Ihre Rechte", body: "Sie haben jederzeit Recht auf Auskunft, Berichtigung, Löschung und Widerruf der Einwilligung — kurze Nachricht genügt." },
      ],
    },
  },

  en: {
    localeName: "English",
    nav: { about: "About", portfolio: "Portfolio", journal: "Journal", contact: "Contact" },
    hero: {
      badge: "A personal garden blog",
      title: "Gardening is my passion",
      subtitle:
        "For years I've spent my free time among flowers, fruit trees and lawns. Here I share my projects, journal notes and a quiet love for green corners.",
      ctaPrimary: "See the portfolio",
      ctaSecondary: "Read the journal",
    },
    about: {
      eyebrow: "About",
      title: "A passion that started in my parents' yard",
      paragraphs: [
        "It all began by helping my grandmother in her garden. Over time it grew into real love — today the garden is my favourite way to spend a weekend.",
        "I love watching a neglected corner slowly turn into a tended space. I experiment with layout, plants and seasonal flowers, and photograph every step.",
        "This site isn't a service offering — it's my personal journal and a portfolio of projects I've worked on for the pure joy of it.",
      ],
    },
    journal: {
      eyebrow: "Journal",
      title: "Notes from the garden",
      subtitle: "Thoughts, seasonal reminders and small wins",
      readMore: "Read more",
      items: [
        { title: "Spring — when the garden breathes again", date: "March", excerpt: "The first warm days always bring the same joy: preparing soil, planning beds and dreaming about what will bloom this year." },
        { title: "Pruning fruit trees — patience first", date: "February", excerpt: "I've learned that fruit trees don't like rushing. Small, thoughtful cuts give better fruit than big interventions in a single day." },
        { title: "Lawn after drought — small secrets", date: "August", excerpt: "After a hot summer the lawn looks lost. A few simple steps and in two weeks it's green again." },
      ],
    },
    gallery: {
      eyebrow: "Portfolio",
      title: "Before & after — projects from my yard and around",
      subtitle: "Drag the slider and see the transformation",
      dragHint: "← drag to compare →",
      before: "Before",
      after: "After",
      items: [
        { title: "Lawn — second life", desc: "Tall grass and weeds restored to a tidy, green surface" },
        { title: "Hedge — new shape", desc: "Wild hedge cut into a clean line" },
        { title: "Beds — from weeds to flowers", desc: "Weeds removed, soil prepared, plants set in" },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Write to me",
      subtitle: "If you have a gardening question, want to share an experience or just say hi — feel free to write.",
      name: "Name",
      email: "Email or phone (optional)",
      message: "Message",
      messagePlaceholder: "A few words...",
      send: "Send message",
      sending: "Sending…",
      successTitle: "Thanks for your message ✓",
      successDesc: "I've read it and will reply as soon as I can. Warm regards!",
      newMessage: "Send another message",
      errorTitle: "Sending failed",
      errorDesc: "Please try again a little later.",
      nameRequired: "Please enter your name.",
      messageRequired: "Please write a few words.",
      contactHeader: "Contact:",
      notesHeader: "Message:",
    },
    footer: { tagline: "A personal blog about gardens and green corners" },
    langSwitcher: { language: "Language", script: "Script", latin: "Latin", cyrillic: "Cyrillic" },
    meta: {
      title: "Zelena Oaza — a personal garden blog",
      description: "A personal blog and portfolio of garden projects. Notes, before/after photos and thoughts on working with plants.",
    },
    privacy: {
      consentLabel: "I agree that my message will be used only to reply to me.",
      consentLink: "Read the Privacy Policy",
      consentRequired: "You must accept the Privacy Policy to send your message.",
      inlineNotice: "Your message is used only to reply. Never shared with third parties, never used for marketing.",
      footerLink: "Privacy Policy",
      dialogTitle: "Privacy Policy",
      lastUpdated: "Last updated: May 2026",
      close: "Close",
      sections: [
        { title: "1. Data controller", body: "Private blog owner. This is a hobby site — not a legal entity and not a commercial offering." },
        { title: "2. What is collected", body: "Via the contact form: name, optional email/phone, and the message text. No tracking cookies, no third-party analytics." },
        { title: "3. Purpose", body: "Your data is used only to reply to your message. No marketing use." },
        { title: "4. Retention", body: "Messages are kept for at most 12 months after the last exchange and then deleted." },
        { title: "5. Your rights", body: "You have the right to access, correction, deletion and withdrawal of consent at any time — just send a short note." },
      ],
    },
  },
};

const fmtRSD = (n: number, locale: string) =>
  new Intl.NumberFormat(locale).format(Math.round(n)) + " RSD";

// Kept for backwards compatibility with I18nContext, though no prices are shown anymore.
export const formatPrice = (n: number, locale: Locale) => {
  if (locale === "sr-Cyrl") return new Intl.NumberFormat("sr-RS").format(Math.round(n)) + " РСД";
  if (locale === "sr-Latn") return fmtRSD(n, "sr-RS");
  if (locale === "de") return fmtRSD(n, "de-DE");
  return fmtRSD(n, "en-US");
};
