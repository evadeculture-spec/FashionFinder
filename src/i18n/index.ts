import { ptPT, type Messages } from './pt-PT';
import { esES } from './es-ES';

export type Locale = 'pt-PT' | 'es-ES';
export const MESSAGES: Record<Locale, Messages> = { 'pt-PT': ptPT, 'es-ES': esES };
export type { Messages };
