import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { Locale } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LABELS: Record<Locale, string> = {
  "sr-Latn": "SR · Lat",
  "sr-Cyrl": "СР · Ћир",
  de: "DE",
  en: "EN",
};

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();
  const isSerbian = locale === "sr-Latn" || locale === "sr-Cyrl";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20 backdrop-blur gap-1.5"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{LABELS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuLabel>{t.langSwitcher.language}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLocale("sr-Latn")}>
          🇷🇸 Srpski (latinica)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("sr-Cyrl")}>
          🇷🇸 Српски (ћирилица)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("de")}>🇩🇪 Deutsch</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")}>🇬🇧 English</DropdownMenuItem>

        {isSerbian && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t.langSwitcher.script}</DropdownMenuLabel>
            <div className="flex gap-1 px-2 pb-2">
              <Button
                size="sm"
                variant={locale === "sr-Latn" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => setLocale("sr-Latn")}
              >
                {t.langSwitcher.latin}
              </Button>
              <Button
                size="sm"
                variant={locale === "sr-Cyrl" ? "default" : "outline"}
                className="flex-1 h-8 text-xs"
                onClick={() => setLocale("sr-Cyrl")}
              >
                {t.langSwitcher.cyrillic}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;