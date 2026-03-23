import ua from '../messages/ua.json';
import ru from '../messages/ru.json';

export const translations = { ua, ru };

export type Locale = 'ua' | 'ru';

export function getMessages(locale: Locale) {
  return translations[locale] || translations.ua;
}
