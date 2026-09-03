// src/services/roomServiceService.ts
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { conflict, notFound, unauthorized, unprocessable } from '../utils/appError';
import {
  ORDER_DOMAIN,
  SERVICE_ORDER_TRANSITIONS,
  allowedTransitions,
  buildPageMeta,
  canTransition,
  endOfUtcDayExclusive,
  generateReference,
  startOfUtcDay,
  toSkipTake,
  type ServiceOrderStatus,
} from '../types/service.types';
import type { CreateOrderInput, ListOrdersQuery } from '../validators/serviceValidators';

const orderSelect = {
  id: true,
  orderNumber: true,
  domain: true,
  status: true,
  roomNumber: true,
  totalAmount: true,
  paymentMethod: true,
  isPaid: true,
  comment: true,
  cancelReason: true,
  createdAt: true,
  deliveredAt: true,
  cancelledAt: true,
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  lines: {
    select: {
      id: true,
      itemId: true,
      quantity: true,
      unitPrice: true,
      optionIds: true,
      supplementIds: true,
      comment: true,
      item: { select: { id: true, name: true, prepTimeMinutes: true } },
    },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.ServiceOrderSelect;

const orderDetailSelect = {
  ...orderSelect,
  updatedAt: true,
  events: {
    select: {
      id: true,
      type: true,
      fromStatus: true,
      toStatus: true,
      message: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.ServiceOrderSelect;

/* ------------------------------------------------------------------ *
 *  Lecture
 * ------------------------------------------------------------------ */

export async function listOrders(query: ListOrdersQuery, currentUserId: number | null) {
  // Fail closed : « mes commandes » sans utilisateur ne doit pas retourner
  // toutes les commandes de l'hôtel.
  if (query.mine && currentUserId === null) {
    throw unauthorized('Le filtre « mine » nécessite un utilisateur authentifié');
  }

  const { skip, take } = toSkipTake(query.page, query.limit);

  const createdAt: Prisma.DateTimeFilter | undefined =
    query.from || query.to
      ? {
          ...(query.from ? { gte: startOfUtcDay(query.from) } : {}),
          ...(query.to ? { lt: endOfUtcDayExclusive(query.to) } : {}),
        }
      : undefined;

  const where: Prisma.ServiceOrderWhereInput = {
    domain: ORDER_DOMAIN,
    ...(query.status ? { status: query.status } : {}),
    ...(query.roomNumber ? { roomNumber: query.roomNumber } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(query.mine && currentUserId !== null ? { userId: currentUserId } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.serviceOrder.count({ where }),
    prisma.serviceOrder.findMany({
      where,
      select: orderSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return { items, meta: buildPageMeta(query.page, query.limit, total) };
}

export async function getOrderById(id: number) {
  const order = await prisma.serviceOrder.findFirst({
    where: { id, domain: ORDER_DOMAIN },
    select: orderDetailSelect,
  });
  if (!order) throw notFound('Commande introuvable');
  return order;
}

/* ------------------------------------------------------------------ *
 *  Création
 * ------------------------------------------------------------------ */

interface PricedLine {
  itemId: number;
  quantity: number;
  unitPrice: Prisma.Decimal;
  optionIds: number[];
  supplementIds: number[];
  comment?: string;
}

/**
 * Toute l'arithmétique passe par Prisma.Decimal : additionner des `number`
 * sur des prix (0.1 + 0.2) finit par produire des totaux faux au centime.
 * `unitPrice` inclut les options ET les suppléments, si bien que
 * totalAmount = Σ unitPrice × quantity reste vérifiable depuis les lignes.
 */
export async function createOrder(input: CreateOrderInput, userId: number | null) {
  const itemIds = Array.from(new Set(input.lines.map((line) => line.itemId)));

  return prisma.$transaction(async (tx) => {
    const items = await tx.serviceItem.findMany({
      where: { id: { in: itemIds } },
      select: {
        id: true,
        name: true,
        domain: true,
        price: true,
        isActive: true,
        isAvailable: true,
        category: { select: { isActive: true } },
        options: { where: { isActive: true }, select: { id: true, priceDelta: true } },
        supplements: { where: { isActive: true }, select: { id: true, price: true } },
      },
    });
    const itemsById = new Map(items.map((item) => [item.id, item]));

    let total = new Prisma.Decimal(0);

    const lines: PricedLine[] = input.lines.map((line) => {
      const item = itemsById.get(line.itemId);
      if (!item) throw unprocessable(`Article ${line.itemId} introuvable`);
      if (item.domain !== ORDER_DOMAIN) {
        throw unprocessable(`L'article « ${item.name} » n'est pas commandable en room service`);
      }
      if (!item.isActive || !item.isAvailable || !item.category.isActive) {
        throw unprocessable(`L'article « ${item.name} » est indisponible`);
      }
      if (item.price === null) {
        throw unprocessable(`L'article « ${item.name} » n'a pas de prix défini`);
      }

      let unitPrice = new Prisma.Decimal(item.price);

      for (const optionId of line.optionIds ?? []) {
        const option = item.options.find((candidate) => candidate.id === optionId);
        if (!option) {
          throw unprocessable(
            `L'option ${optionId} n'appartient pas à l'article « ${item.name} » ou est désactivée`,
          );
        }
        unitPrice = unitPrice.plus(option.priceDelta);
      }

      for (const supplementId of line.supplementIds ?? []) {
        const supplement = item.supplements.find((candidate) => candidate.id === supplementId);
        if (!supplement) {
          throw unprocessable(
            `Le supplément ${supplementId} n'appartient pas à l'article « ${item.name} » ou est désactivé`,
          );
        }
        unitPrice = unitPrice.plus(supplement.price);
      }

      if (unitPrice.isNegative()) {
        throw unprocessable(`Le prix calculé pour « ${item.name} » est négatif`);
      }

      const rounded = unitPrice.toDecimalPlaces(2);
      total = total.plus(rounded.times(line.quantity));

      return {
        itemId: item.id,
        quantity: line.quantity,
        unitPrice: rounded,
        optionIds: line.optionIds ?? [],
        supplementIds: line.supplementIds ?? [],
        comment: line.comment,
      };
    });

    return tx.serviceOrder.create({
      data: {
        orderNumber: generateReference('SO'),
        domain: ORDER_DOMAIN,
        status: 'NEW',
        userId: userId ?? undefined,
        roomNumber: input.roomNumber,
        totalAmount: total.toDecimalPlaces(2),
        paymentMethod: input.paymentMethod,
        comment: input.comment,
        lines: { create: lines },
        events: {
          create: {
            type: 'CREATED',
            toStatus: 'NEW',
            message: 'Commande créée',
            userId: userId ?? undefined,
          },
        },
      },
      select: orderDetailSelect,
    });
  });
}

/* ------------------------------------------------------------------ *
 *  Cycle de vie
 * ------------------------------------------------------------------ */

function orderStatusTimestamps(status: ServiceOrderStatus): Prisma.ServiceOrderUpdateInput {
  const now = new Date();
  switch (status) {
    case 'DELIVERED':
      return { deliveredAt: now };
    case 'CANCELLED':
      return { cancelledAt: now };
    default:
      return {};
  }
}

export async function updateOrderStatus(params: {
  id: number;
  status: ServiceOrderStatus;
  userId?: number | null;
  message?: string;
  cancelReason?: string;
}) {
  const order = await prisma.serviceOrder.findFirst({
    where: { id: params.id, domain: ORDER_DOMAIN },
    select: { id: true, status: true },
  });
  if (!order) throw notFound('Commande introuvable');

  const current = order.status;
  if (current === params.status) {
    throw unprocessable(`La commande est déjà au statut ${params.status}`);
  }
  if (!canTransition(SERVICE_ORDER_TRANSITIONS, current, params.status)) {
    throw unprocessable(`Transition ${current} → ${params.status} non autorisée`, {
      statutsPossibles: allowedTransitions(SERVICE_ORDER_TRANSITIONS, current),
    });
  }

  try {
    return await prisma.serviceOrder.update({
      where: { id: params.id, status: current },
      data: {
        status: params.status,
        ...orderStatusTimestamps(params.status),
        ...(params.status === 'CANCELLED' && params.cancelReason
          ? { cancelReason: params.cancelReason }
          : {}),
        events: {
          create: {
            type: 'STATUS_CHANGED',
            fromStatus: current,
            toStatus: params.status,
            message: params.message ?? params.cancelReason,
            userId: params.userId ?? undefined,
          },
        },
      },
      select: orderDetailSelect,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw conflict('La commande vient d\'être modifiée par quelqu\'un d\'autre, recharge-la');
    }
    throw err;
  }
}

export async function markOrderPaid(id: number) {
  const order = await prisma.serviceOrder.findFirst({
    where: { id, domain: ORDER_DOMAIN },
    select: { id: true, isPaid: true, status: true },
  });
  if (!order) throw notFound('Commande introuvable');
  if (order.status === 'CANCELLED') {
    throw unprocessable("Une commande annulée ne peut pas être réglée");
  }
  if (order.isPaid) throw unprocessable('Cette commande est déjà réglée');
  return prisma.serviceOrder.update({
    where: { id },
    data: { isPaid: true },
    select: orderDetailSelect,
  });
}