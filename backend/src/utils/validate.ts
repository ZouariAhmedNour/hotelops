// src/utils/validate.ts
import { AppError } from './appError';

/**
 * Contrat structurel volontairement minimal : il correspond a `safeParse` de Zod
 * sans dependre du nom de ses types internes (qui bougent entre v3 et v4).
 */
interface ParseIssue {
  path: ReadonlyArray<PropertyKey>;
  message: string;
}

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ReadonlyArray<ParseIssue> } };

interface Parser<T> {
  safeParse(data: unknown): ParseResult<T>;
}

export interface FieldError {
  field: string;
  message: string;
}

function formatIssues(issues: ReadonlyArray<ParseIssue>): FieldError[] {
  return issues.map((issue) => ({
    field: issue.path.map((segment) => String(segment)).join('.') || '(racine)',
    message: issue.message,
  }));
}

export function parseOrThrow<T>(
  schema: Parser<T>,
  payload: unknown,
  message: string,
  statusCode: number,
): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new AppError(message, statusCode, formatIssues(result.error.issues));
  }
  return result.data;
}

export function parseBody<T>(schema: Parser<T>, body: unknown): T {
  return parseOrThrow(schema, body, 'Donnees invalides', 422);
}

export function parseQuery<T>(schema: Parser<T>, query: unknown): T {
  return parseOrThrow(schema, query, 'Parametres de requete invalides', 400);
}

/** Un `Number(req.params.id)` nu donne NaN -> Prisma renvoie une 500 illisible. */
export function parseId(raw: unknown, label = 'id'): number {
  const value = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : Number.NaN;
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`Parametre "${label}" invalide : un entier positif est attendu`, 400);
  }
  return value;
}