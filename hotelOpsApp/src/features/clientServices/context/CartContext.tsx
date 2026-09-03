// src/features/services/context/CartContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  CartLine,
  CreateOrderPayload,
  PaymentMethod,
  ServiceItem,
} from "../types/service.types";
import { computeCartTotal } from "../utils/money";

/**
 * Panier room service, volontairement en memoire : il se vide au
 * redemarrage de l'app, ce qui evite de proposer une commande batie
 * sur des prix ou une disponibilite perimes.
 */

type AddLineInput = {
  item: ServiceItem;
  quantity?: number;
  optionIds?: number[];
  supplementIds?: number[];
  comment?: string;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  roomNumber: string;
  paymentMethod: PaymentMethod;
  comment: string;
  setRoomNumber: (value: string) => void;
  setPaymentMethod: (value: PaymentMethod) => void;
  setComment: (value: string) => void;
  addLine: (input: AddLineInput) => void;
  incrementLine: (key: string) => void;
  decrementLine: (key: string) => void;
  setLineQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  quantityForItem: (itemId: number) => number;
  buildOrderPayload: () => CreateOrderPayload | null;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

/** Deux lignes fusionnent si article + options + supplements + note sont identiques. */
function buildKey(input: {
  itemId: number;
  optionIds: number[];
  supplementIds: number[];
  comment?: string;
}): string {
  const options = [...input.optionIds].sort((a, b) => a - b).join("-");
  const supplements = [...input.supplementIds].sort((a, b) => a - b).join("-");
  const comment = (input.comment ?? "").trim().toLowerCase();
  return `${input.itemId}|${options}|${supplements}|${comment}`;
}

/** Aligne sur le max du backend (quantity: max 50, lines: max 30). */
export const MAX_LINE_QUANTITY = 50;
export const MAX_CART_LINES = 30;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("ROOM_CHARGE");
  const [comment, setComment] = useState("");

  const addLine = useCallback((input: AddLineInput) => {
    const optionIds = input.optionIds ?? [];
    const supplementIds = input.supplementIds ?? [];
    const quantity = Math.max(1, input.quantity ?? 1);
    const key = buildKey({
      itemId: input.item.id,
      optionIds,
      supplementIds,
      comment: input.comment,
    });

    setLines((prev) => {
      const existing = prev.find((line) => line.key === key);

      if (existing) {
        return prev.map((line) =>
          line.key === key
            ? {
                ...line,
                quantity: Math.min(MAX_LINE_QUANTITY, line.quantity + quantity),
              }
            : line,
        );
      }

      if (prev.length >= MAX_CART_LINES) return prev;

      return [
        ...prev,
        {
          key,
          item: input.item,
          quantity: Math.min(MAX_LINE_QUANTITY, quantity),
          optionIds,
          supplementIds,
          comment: input.comment?.trim() ? input.comment.trim() : undefined,
        },
      ];
    });
  }, []);

  const setLineQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.key !== key);
      return prev.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }
          : line,
      );
    });
  }, []);

  const incrementLine = useCallback((key: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, line.quantity + 1) }
          : line,
      ),
    );
  }, []);

  const decrementLine = useCallback((key: string) => {
    setLines((prev) =>
      prev
        .map((line) =>
          line.key === key ? { ...line, quantity: line.quantity - 1 } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setComment("");
  }, []);

  const quantityForItem = useCallback(
    (itemId: number) =>
      lines
        .filter((line) => line.item.id === itemId)
        .reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const buildOrderPayload = useCallback((): CreateOrderPayload | null => {
    if (lines.length === 0) return null;
    if (!roomNumber.trim()) return null;

    return {
      roomNumber: roomNumber.trim(),
      paymentMethod,
      comment: comment.trim() || undefined,
      // Le backend attend `lines`, avec `comment` (et non `notes`).
      lines: lines.map((line) => ({
        itemId: line.item.id,
        quantity: line.quantity,
        optionIds: line.optionIds.length > 0 ? line.optionIds : undefined,
        supplementIds:
          line.supplementIds.length > 0 ? line.supplementIds : undefined,
        comment: line.comment,
      })),
    };
  }, [comment, lines, paymentMethod, roomNumber]);

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const total = useMemo(() => computeCartTotal(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      total,
      roomNumber,
      paymentMethod,
      comment,
      setRoomNumber,
      setPaymentMethod,
      setComment,
      addLine,
      incrementLine,
      decrementLine,
      setLineQuantity,
      removeLine,
      clear,
      quantityForItem,
      buildOrderPayload,
    }),
    [
      addLine,
      buildOrderPayload,
      clear,
      comment,
      count,
      decrementLine,
      incrementLine,
      lines,
      paymentMethod,
      quantityForItem,
      removeLine,
      roomNumber,
      setLineQuantity,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart doit etre utilise a l'interieur d'un <CartProvider>");
  }
  return ctx;
}