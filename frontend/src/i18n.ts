import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';

const saved = (localStorage.getItem('hc_lang') as 'en' | 'de' | null) || 'de';

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale: 'en',
  messages: { en, de },
});

export function setLocale(loc: 'en' | 'de') {
  i18n.global.locale.value = loc;
  localStorage.setItem('hc_lang', loc);
}

export default i18n;
