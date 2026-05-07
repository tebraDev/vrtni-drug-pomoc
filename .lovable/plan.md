## Ziel
Die Seite vom kommerziellen "Garten-Service mit Preisen & Buchung" zu einem **persönlichen Garten-Blog/Portfolio** umbauen — ohne erkennbare Geschäftsabsicht (keine Preise, keine Buchung, keine "Dienstleistung", keine Stadt-Service-Liste, keine "Bestellung").

## Was bleibt
- Hero mit Bild, Leidenschaft-Statement
- Vorher/Nachher-Galerie (als Portfolio meiner Projekte)
- Über-mich / "Warum Gärten" Sektion
- Kontakt **nur als persönliche Nachricht** ("Schreib mir, wenn du Fragen hast" — kein Formular mit Auftragsdaten)
- Mehrsprachigkeit, Theme-Toggle

## Was raus muss
- Kompletter Service-Kalkulator (Flächen-Slider, Häkchen, Frequenzen, RSD-Berechnung)
- Alle Preise / "RSD" / "/ m²" / "Mesečna procena"
- "Poruči", "Narudžbina", "Usluga" → ersetzt durch "Projekat", "Galerija", "Priča"
- Sticky Mobile-CTA "Poruči" → wird zu dezentem "WhatsApp" oder ganz weg
- JSON-LD `LocalBusiness` aus `index.html` → ersetzt durch `Person` / `Blog`
- "Trstenik · Kruševac · Vrnjačka Banja · Aleksandrovac" als Service-Gebiet → entfernt (nur noch "Srbija" als Wohnort, falls überhaupt)
- "300+ klijenata", "4.9 ocena", "Od 2019." (Geschäfts-Trust-Signale) → raus oder neutral umformuliert ("Strast od 2019.")
- FAQ-Punkte zu Bezahlung, Berichten, Rechnungen → raus oder zu "Über das Hobby" umgeschrieben
- Telegram-Bot Order-Worker-Submit bleibt **technisch**, wird aber zu schlichter "Pošalji poruku" ohne Items/Total
- Datenschutz-Text bleibt (rechtlich gut), aber Begriffe "ponuda/narudžbina/preduzetnik" raus

## Neue Struktur (eine Seite)
```
Hero ........... "Bašta je moja strast" (kein CTA "Izračunaj cenu")
O meni ......... Kurze persönliche Geschichte
Portfolio ...... Vorher/Nachher als "Projekti na kojima sam radio/la"
Dnevnik ........ 2-3 Mini-Blog-Karten (statisch, z.B. "Proleće u bašti", "Orezivanje voćki")
Kontakt ........ Einfaches Formular: Ime, e-mail/telefon, Poruka — kein Service/Total
Footer ......... Persönlich, kein "Kontakt"-CTA, keine Stadtliste
```

## Technische Schritte
1. `src/i18n/translations.ts` — alle 4 Locales:
   - `hero.title/subtitle/ctaPrimary` umschreiben (kein "Izračunaj cenu")
   - `nav` → "Priča / Portfolio / Dnevnik / Kontakt"
   - `services`, `config`, `summary`, `freq`, `toasts.success*`, `send.*` → entweder löschen oder zu Blog/Portfolio-Strings umbenennen
   - `gallery` bleibt (Portfolio)
   - `faq` zu "Često pitana pitanja o bašti" (allgemein, nicht über Auftrag)
   - `footer.tagline`, `meta.title/description` neutralisieren
2. `src/components/garden/GardenLanding.tsx`:
   - Kalkulator-Sektion entfernen (`SERVICES`, `FREQUENCIES`, `computeMonthly`, `selected`, `area`, `calc`, sticky Mobile-Bar)
   - Order-Sektion durch schlankes Kontakt-Formular ersetzen (nur Name + Nachricht + opt. Kontakt)
   - `buildOrderMessage` reduziert auf reine Nachricht
   - Trust-Badges & Stadt-Liste raus
   - Neue "Über mich" + "Dnevnik" Sektionen
3. `index.html`:
   - JSON-LD `LocalBusiness` → `Person` (oder ganz löschen)
   - `<title>` / `<meta description>` neutral ("Bašta je moja strast — lični blog")
   - `priceRange`, `areaServed`, `openingHoursSpecification` raus
4. README kurz anpassen (Beschreibung als persönlicher Blog)

## Ergebnis für die Grauzone
Keine Preise, keine "Usluge", keine Service-Gebiete, keine Öffnungszeiten, keine Buchung — nur ein persönlicher Garten-Blog mit Portfolio-Galerie und Kontaktmöglichkeit. Liest sich wie ein Hobby, nicht wie ein Unternehmen.
