const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const getEnvValue = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};

export const ADMIN_PANEL_NAME = getEnvValue(
  process.env.NEXT_PUBLIC_ADMIN_PANEL_NAME,
  "Commerce Admin"
);

export const ADMIN_PANEL_SHORT_NAME = getEnvValue(
  process.env.NEXT_PUBLIC_ADMIN_PANEL_SHORT_NAME,
  "CA"
);

export const ADMIN_PANEL_EMAIL = getEnvValue(
  process.env.NEXT_PUBLIC_ADMIN_PANEL_EMAIL,
  "admin@example.com"
);

export let ADMIN_CURRENCY_SYMBOL = getEnvValue(
  process.env.NEXT_PUBLIC_CURRENCY_SYMBOL,
  "$"
);

export const setAdminCurrencySymbol = (symbol: string) => {
  ADMIN_CURRENCY_SYMBOL = symbol;
};

export const API_BASE_URL = trimTrailingSlashes(
  getEnvValue(process.env.NEXT_PUBLIC_API_BASE_URL, "http://127.0.0.1:8000/api")
);

export const formatCurrency = (
  value: number | string | null | undefined,
  minimumFractionDigits = 2
) => {
  const amount = Number(value ?? 0);

  return `${ADMIN_CURRENCY_SYMBOL} ${amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  })}`;
};

export const formatQuantity = (value: number | string | null | undefined) =>
  Number(value ?? 0).toFixed(2);
