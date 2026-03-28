import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";
import te from "./locales/te.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      te: { translation: te },
    },
    fallbackLng: "en",
    defaultNS: "translation",
    ns: ["translation"],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "annadata_lang",
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
