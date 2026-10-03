import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LanguageContext = createContext(null);

const STORAGE_KEY = "bsi_language";
const DEFAULT_LANGUAGE = "en";

// UI-only for now, per the current scope — selecting a language just
// updates this state and the checkmark in the picker. Nothing in the app
// actually reads `language` to translate content yet; that's the next
// step, and this context exists so that step has a value/setter to plug
// into rather than needing to be threaded through from scratch.
export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage unavailable — the choice still holds for the rest of this
      // session, it just won't be remembered on the next visit.
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (LANGUAGES.some((l) => l.code === code)) setLanguageState(code);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
