import { createContext, useContext, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
const Ctx = createContext<{ lang: string; setLang: (l: string) => void }>(
null as unknown as { lang: string; setLang: (l: string) => void }
);
export function LanguageProvider({ children }: { children: ReactNode }) {
const { i18n } = useTranslation();
const [lang, setLangState] = useState(i18n.language || 'en');
const setLang = (l: string) => {
i18n.changeLanguage(l);
localStorage.setItem('krishilink_lang', l); // language choice persists
document.documentElement.lang = l;
setLangState(l);
};
return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
export const useLanguage = () => useContext(Ctx);
