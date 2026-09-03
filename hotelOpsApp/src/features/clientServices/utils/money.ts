// src/features/services/utils/money.ts
import type {
  CartLine,
  Money,
  ServiceItem,
  ServiceItemOption,
  ServiceItemSupplement,
} from "../types/service.types";

/** Change ici si tu factures dans une autre devise. */
export const CURRENCY = "DT";

/**
 * Les Decimal Prisma arrivent en chaine ("24.50").
 * Renvoie null si la valeur est absente ou illisible, JAMAIS NaN.
 */
export function toNumber(value: Money | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Comme toNumber mais avec un repli, pratique pour les additions. */
export function toNumberOr(value: Money | undefined, fallback = 0): number {
  return toNumber(value) ?? fallback;
}

export function formatAmount(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} ${CURRENCY}`;
}

export function formatPrice(value: Money | undefined, fallback = "—"): string {
  const parsed = toNumber(value);
  return parsed === null ? fallback : formatAmount(parsed);
}

/** Affiche +2,00 DT / -1,50 DT pour les deltas d'options. */
export function formatDelta(value: Money | undefined): string {
  const parsed = toNumber(value);
  if (parsed === null || parsed === 0) return "";
  const sign = parsed > 0 ? "+" : "-";
  return `${sign}${formatAmount(Math.abs(parsed))}`;
}

/**
 * Libelle de prix d'un article : le backend autorise soit un prix ferme,
 * soit une fourchette priceMin/priceMax, soit rien du tout (sur devis).
 */
export function priceLabel(
  item: Pick<ServiceItem, "price" | "priceMin" | "priceMax">,
): string {
  const price = toNumber(item.price);
  if (price !== null) return formatAmount(price);

  const min = toNumber(item.priceMin);
  const max = toNumber(item.priceMax);

  if (min !== null && max !== null) {
    return `${formatAmount(min)} – ${formatAmount(max)}`;
  }
  if (min !== null) return `A partir de ${formatAmount(min)}`;
  if (max !== null) return `Jusqu'a ${formatAmount(max)}`;
  return "Sur demande";
}

export function hasFirmPrice(
  item: Pick<ServiceItem, "price">,
): boolean {
  return toNumber(item.price) !== null;
}

/**
 * Prix unitaire estime d'une ligne de panier.
 * Le backend recalcule le sien a la creation : on ne fait ici qu'un affichage.
 */
export function computeUnitPrice(
  item: Pick<ServiceItem, "price" | "options" | "supplements">,
  optionIds: number[],
  supplementIds: number[],
): number {
  let total = toNumberOr(item.price);

  for (const option of item.options ?? []) {
    if (optionIds.includes(option.id)) total += toNumberOr(option.priceDelta);
  }
  for (const supplement of item.supplements ?? []) {
    if (supplementIds.includes(supplement.id)) {
      total += toNumberOr(supplement.price);
    }
  }

  return Math.max(0, total);
}

export function computeLineTotal(line: CartLine): number {
  return (
    computeUnitPrice(line.item, line.optionIds, line.supplementIds) *
    line.quantity
  );
}

export function computeCartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + computeLineTotal(line), 0);
}

export function findOptionsByIds(
  options: ServiceItemOption[],
  ids: number[],
): ServiceItemOption[] {
  return options.filter((option) => ids.includes(option.id));
}

export function findSupplementsByIds(
  supplements: ServiceItemSupplement[],
  ids: number[],
): ServiceItemSupplement[] {
  return supplements.filter((supplement) => ids.includes(supplement.id));
}