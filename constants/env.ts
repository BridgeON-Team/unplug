import Constants from "expo-constants";

type ExtraConfig = Record<string, unknown> | undefined;

const getExtra = (): Record<string, unknown> => {
  const expoExtra = Constants.expoConfig?.extra as ExtraConfig;
  if (expoExtra) {
    return expoExtra;
  }

  const manifestExtra = (Constants as any)?.manifest?.extra as ExtraConfig;
  if (manifestExtra) {
    return manifestExtra;
  }

  const manifest2Extra = (Constants as any)?.manifest2?.extra as ExtraConfig;
  if (manifest2Extra) {
    return manifest2Extra;
  }

  return {};
};

const extra = getExtra();

const resolveEnv = () => {
  return (
    process.env.EXPO_PUBLIC_APP_ENV ||
    (extra.env as string | undefined) ||
    "dev"
  );
};

const resolveApiBaseUrl = () => {
  const value =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (extra.apiBaseUrl as string | undefined);

  if (!value) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is not defined. Ensure app.config.js resolves it from your .env."
    );
  }

  return value;
};

const resolveSentryDsn = () => {
  return (
    process.env.EXPO_PUBLIC_SENTRY_DSN ||
    (extra.sentryDsn as string | undefined)
  );
};

export interface AppEnv {
  env: string;
  apiBaseUrl: string;
  sentryDsn?: string;
}

export const appEnv: AppEnv = {
  env: resolveEnv(),
  apiBaseUrl: resolveApiBaseUrl(),
  sentryDsn: resolveSentryDsn(),
};

export const API_BASE_URL = appEnv.apiBaseUrl;
