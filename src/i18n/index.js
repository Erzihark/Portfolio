import { ref } from 'vue';
import messages from './messages';

export const SUPPORTED_LOCALES = ['en', 'es'];

const STORAGE_KEY = 'portfolio-locale';

// Time zones of Spanish-speaking regions. The time zone is the best
// location signal in the browser, and it needs no network request.
const SPANISH_TIME_ZONES =
  /^(America\/(Mexico_City|Cancun|Merida|Monterrey|Chihuahua|Ciudad_Juarez|Mazatlan|Hermosillo|Tijuana|Bahia_Banderas|Ojinaga|Matamoros|Bogota|Lima|Santiago|Caracas|La_Paz|Guayaquil|Montevideo|Asuncion|Costa_Rica|Panama|Guatemala|El_Salvador|Tegucigalpa|Managua|Havana|Santo_Domingo|Argentina\/.+)|Europe\/Madrid|Africa\/Ceuta|Atlantic\/Canary|Pacific\/Easter)$/;

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LOCALES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function detectLocale() {
  const saved = readSaved();
  if (saved) return saved;

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (SPANISH_TIME_ZONES.test(timeZone)) return 'es';
  } catch {
    // Fall through to the browser language.
  }

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const first = String(languages[0] || '').toLowerCase();
  return first.startsWith('es') ? 'es' : 'en';
}

export const locale = ref(detectLocale());

function lookup(source, key) {
  return key.split('.').reduce((node, part) => (node == null ? node : node[part]), source);
}

// Reads `locale`, so any template or computed value that calls it updates on change.
export function t(key) {
  const value = lookup(messages[locale.value], key);
  if (value !== undefined) return value;

  const fallback = lookup(messages.en, key);
  return fallback !== undefined ? fallback : key;
}

// Fixed-language lookup. Used for the email text that I read.
export function tIn(lang, key) {
  return lookup(messages[lang], key);
}

function applyDocument() {
  document.documentElement.lang = locale.value;
  document.title = t('meta.title');

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));
}

export function setLocale(next) {
  if (!SUPPORTED_LOCALES.includes(next) || next === locale.value) return;

  locale.value = next;

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be blocked. The choice then lasts for this visit only.
  }

  applyDocument();
}

export default {
  install(app) {
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$setLocale = setLocale;
    Object.defineProperty(app.config.globalProperties, '$locale', {
      get: () => locale.value
    });

    applyDocument();
  }
};
