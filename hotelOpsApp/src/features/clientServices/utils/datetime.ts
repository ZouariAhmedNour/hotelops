// src/features/services/utils/datetime.ts
import type { ServiceSlot } from "../types/service.types";

export const MINUTES_PER_DAY = 1440;

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const DAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const MONTH_SHORT = [
  "janv.",
  "fevr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "aout",
  "sept.",
  "oct.",
  "nov.",
  "dec.",
];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Format YYYY-MM-DD a partir des composantes LOCALES.
 * Indispensable : le backend fait z.coerce.date() puis startOfUtcDay().
 * Envoyer un ISO complet avec fuseau ferait basculer d'un jour le soir.
 */
export function toApiDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse un "YYYY-MM-DD" ou un ISO en Date locale a minuit. */
export function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toApiDate(a) === toApiDate(b);
}

/** 0 = dimanche, aligne sur utcDayOfWeek() du backend. */
export function dayOfWeek(date: Date): number {
  return date.getDay();
}

export function dayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()] ?? "";
}

export function dayShortLabel(date: Date): string {
  return DAY_SHORT[date.getDay()] ?? "";
}

/** "5 sept." */
export function formatDayMonth(value: string | Date): string {
  const date = parseApiDate(value);
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** "Vendredi 5 sept. 2026" */
export function formatDateFr(value: string | Date): string {
  const date = parseApiDate(value);
  return `${dayLabel(date)} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "5 sept. a 14:32" — pour les createdAt, qui sont des instants reels. */
export function formatDateTimeFr(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} a ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Les N prochains jours a partir d'aujourd'hui. */
export function nextDays(count: number, from: Date = new Date()): Date[] {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return date;
  });
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(MINUTES_PER_DAY, minutes));
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

/** "14:00 – 15:30" */
export function formatTimeRange(
  startTime: string,
  durationMinutes: number | null | undefined,
): string {
  if (!durationMinutes) return startTime;
  return `${startTime} – ${addMinutesToTime(startTime, durationMinutes)}`;
}

/**
 * Cree la grille d'horaires proposables a partir des creneaux du backend.
 * Un horaire n'est retenu que si [debut, debut + duree] tient entierement
 * dans un creneau : c'est exactement la regle appliquee cote serveur.
 * Sans creneau configure, on retombe sur une plage large par defaut.
 */
export function buildTimeOptions(params: {
  slots: ServiceSlot[];
  durationMinutes: number;
  stepMinutes?: number;
  /** Filtre les horaires deja passes si la date choisie est aujourd'hui. */
  forDate?: Date;
  now?: Date;
}): string[] {
  const step = params.stepMinutes ?? 30;
  const duration = Math.max(0, params.durationMinutes);

  const ranges =
    params.slots.length > 0
      ? params.slots.map((slot) => ({
          start: timeToMinutes(slot.startTime),
          end: timeToMinutes(slot.endTime),
        }))
      : [{ start: 8 * 60, end: 22 * 60 }];

  const found = new Set<number>();

  for (const range of ranges) {
    if (range.end <= range.start) continue;
    for (let minute = range.start; minute + duration <= range.end; minute += step) {
      if (minute + duration > MINUTES_PER_DAY) break;
      found.add(minute);
    }
  }

  let minutes = Array.from(found).sort((a, b) => a - b);

  if (params.forDate) {
    const now = params.now ?? new Date();
    if (isSameDay(params.forDate, now)) {
      // Une petite marge evite de proposer un creneau dans 2 minutes.
      const floor = now.getHours() * 60 + now.getMinutes() + 30;
      minutes = minutes.filter((minute) => minute >= floor);
    }
  }

  return minutes.map(minutesToTime);
}

/**
 * Creneaux applicables a un jour donne.
 * Les creneaux portes par l'article priment strictement sur ceux de la
 * categorie — meme arbitrage que assertSlotAvailability() cote backend.
 */
export function pickSlotsForDay(
  slots: ServiceSlot[],
  weekday: number,
): ServiceSlot[] {
  const sameDay = slots.filter(
    (slot) => slot.dayOfWeek === weekday && slot.isActive !== false,
  );
  const itemSlots = sameDay.filter(
    (slot) => slot.itemId !== null && slot.itemId !== undefined,
  );
  return itemSlots.length > 0 ? itemSlots : sameDay;
}