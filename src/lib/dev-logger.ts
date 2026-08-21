// ---------------------------------------------------------------------------
// dev-logger.ts — Secure Development Logger & Supabase Error Parser
// ---------------------------------------------------------------------------
// Logs detailed diagnostic information (HTTP status, error codes, storage/RPC
// failure reasons) in development mode ONLY.
//
// ABSOLUTE PRIVACY GUARANTEE:
// Never logs user gift messages, creator names, uploaded image data, secrets,
// or service-role keys.
// ---------------------------------------------------------------------------

interface StandardErrorShape {
  status?: number;
  statusCode?: number | string;
  code?: string | number;
  message?: string;
  details?: string;
  hint?: string;
  error?: string;
  name?: string;
}

/**
 * Logs diagnostic error details to dev console. Disabled completely in production.
 */
export function logDevError(context: string, err: unknown): void {
  if (!import.meta.env.DEV) return;

  const errorObj = (err && typeof err === "object" ? err : {}) as StandardErrorShape;

  const status = errorObj.status ?? errorObj.statusCode ?? "N/A";
  const code = errorObj.code ?? "N/A";
  const rawMessage = errorObj.message ?? (typeof err === "string" ? err : "Unknown error");
  const details = errorObj.details ?? errorObj.hint ?? "N/A";

  console.group(`🚨 [DevLogger] ${context}`);
  console.error("HTTP Status:", status);
  console.error("Error Code:", code);
  console.error("Message:", rawMessage);
  if (details !== "N/A") console.error("Details/Hint:", details);
  console.groupEnd();
}

export interface ParsedError {
  isRateLimit: boolean;
  isNetworkError: boolean;
  userMessage: string;
  status?: number;
  code?: string;
}

/**
 * Parses a Supabase or network error into a structured object and safe user message.
 */
export function parseSupabaseError(err: unknown, fallbackMessage = "Operation failed. Please try again."): ParsedError {
  const errorObj = (err && typeof err === "object" ? err : {}) as StandardErrorShape;
  const rawMessage = String(errorObj.message ?? err ?? "").toLowerCase();
  const rawStatus = Number(errorObj.status ?? errorObj.statusCode ?? 0);
  const code = String(errorObj.code ?? "");

  const isRateLimit =
    rawStatus === 429 ||
    code === "429" ||
    code === "P0001" && rawMessage.includes("rate limit") ||
    rawMessage.includes("rate limit exceeded") ||
    rawMessage.includes("too many requests");

  const isNetworkError =
    rawMessage.includes("failed to fetch") ||
    rawMessage.includes("networkerror") ||
    rawMessage.includes("network error") ||
    rawMessage.includes("load failed") ||
    rawMessage.includes("client is offline");

  let userMessage = fallbackMessage;

  if (isRateLimit) {
    userMessage = "Too many requests. Please wait a minute and try again.";
  } else if (isNetworkError) {
    userMessage = "Network connection lost. Please check your internet connection and try again.";
  } else if (rawMessage.includes("message required")) {
    userMessage = "Please add a message before sending.";
  } else if (rawMessage.includes("message too long")) {
    userMessage = "Your message is too long. Max 1000 characters.";
  } else if (rawMessage.includes("name too long")) {
    userMessage = "Creator name is too long. Max 40 characters.";
  } else if (rawMessage.includes("invalid theme")) {
    userMessage = "Please pick a valid gift theme.";
  } else if (rawMessage.includes("too many images")) {
    userMessage = "You can only attach one photo.";
  } else if (rawMessage.includes("payload too large") || rawMessage.includes("exceeded the maximum")) {
    userMessage = "Photo is too large. Max allowed size is 5MB.";
  }

  return {
    isRateLimit,
    isNetworkError,
    userMessage,
    status: rawStatus || undefined,
    code: code || undefined,
  };
}
