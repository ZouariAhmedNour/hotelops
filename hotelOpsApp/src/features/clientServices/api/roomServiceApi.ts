// src/features/services/api/roomServiceApi.ts
import api, { cleanBody, cleanParams, servicesUrl } from "./http";
import type {
  ApiEnvelope,
  CreateOrderPayload,
  ListOrdersQuery,
  Paginated,
  ServiceOrder,
  ServiceOrderDetail,
} from "../types/service.types";

/**
 * GET /api/services/room-service/orders → data = { items, meta }.
 * Cote client on appelle TOUJOURS avec mine=true : le backend restreint
 * alors la liste aux commandes de l'utilisateur connecte.
 */
export async function listOrders(
  query: ListOrdersQuery = {},
): Promise<Paginated<ServiceOrder>> {
  const { data } = await api.get<ApiEnvelope<Paginated<ServiceOrder>>>(
    servicesUrl("/room-service/orders"),
    { params: cleanParams({ ...query }) },
  );
  return data.data;
}

/** GET /api/services/room-service/orders/:id → commande + events. */
export async function getOrder(id: number): Promise<ServiceOrderDetail> {
  const { data } = await api.get<ApiEnvelope<ServiceOrderDetail>>(
    servicesUrl(`/room-service/orders/${id}`),
  );
  return data.data;
}

/**
 * POST /api/services/room-service/orders
 * Le backend recalcule les prix depuis la base : le total local n'est
 * qu'un affichage, il ne fait pas foi.
 */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<ServiceOrderDetail> {
  const body = {
    ...cleanBody({
      roomNumber: payload.roomNumber,
      paymentMethod: payload.paymentMethod,
      comment: payload.comment,
    }),
    lines: payload.lines.map((line) =>
      cleanBody({
        itemId: line.itemId,
        quantity: line.quantity,
        optionIds: line.optionIds,
        supplementIds: line.supplementIds,
        comment: line.comment,
      }),
    ),
  };

  const { data } = await api.post<ApiEnvelope<ServiceOrderDetail>>(
    servicesUrl("/room-service/orders"),
    body,
  );
  return data.data;
}