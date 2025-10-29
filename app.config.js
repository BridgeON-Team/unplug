import "dotenv/config";

const normalizeEnvKey = (value) => {
  const lowered = value.toLowerCase();
  if (lowered === "production") {
    return "prod";
  }
  if (lowered === "development") {
    return "dev";
  }
  return lowered;
};

const resolveEnvKey = () => {
  const fallbackEnv =
    process.env.EXPO_PUBLIC_APP_ENV ||
    process.env.APP_ENV ||
    process.env.NODE_ENV ||
    "dev";
  return normalizeEnvKey(fallbackEnv);
};

const API_BASE_URL_MAP = {
  DEV: process.env.EXPO_PUBLIC_API_BASE_URL_DEV,
  STAGE: process.env.EXPO_PUBLIC_API_BASE_URL_STAGE,
  PROD: process.env.EXPO_PUBLIC_API_BASE_URL_PROD,
};

const SENTRY_DSN_MAP = {
  DEV: process.env.EXPO_PUBLIC_SENTRY_DSN_DEV,
  STAGE: process.env.EXPO_PUBLIC_SENTRY_DSN_STAGE,
  PROD: process.env.EXPO_PUBLIC_SENTRY_DSN_PROD,
};

const API_BASE_URL_GENERIC = process.env.EXPO_PUBLIC_API_BASE_URL;
const SENTRY_DSN_GENERIC = process.env.EXPO_PUBLIC_SENTRY_DSN;

const pickPublicEnvValue = (key, envUpper, options = {}) => {
  let specific;

  if (key === "EXPO_PUBLIC_API_BASE_URL") {
    specific = API_BASE_URL_MAP[envUpper];
  } else if (key === "EXPO_PUBLIC_SENTRY_DSN") {
    specific = SENTRY_DSN_MAP[envUpper];
  }

  let generic;
  if (key === "EXPO_PUBLIC_API_BASE_URL") {
    generic = API_BASE_URL_GENERIC;
  } else if (key === "EXPO_PUBLIC_SENTRY_DSN") {
    generic = SENTRY_DSN_GENERIC;
  }
  const value = specific ?? generic;

  if (options.required && !value) {
    const message =
      specific !== undefined
        ? `${key}_${envUpper} is defined but empty.`
        : `${key}_${envUpper} or ${key} must be defined in your environment.`;
    throw new Error(message);
  }

  return value;
};

const resolvePublicEnv = () => {
  const env = resolveEnvKey();
  const envUpper = env.toUpperCase();

  const apiBaseUrl = pickPublicEnvValue(
    "EXPO_PUBLIC_API_BASE_URL",
    envUpper,
    { required: true }
  );

  const sentryDsn = pickPublicEnvValue(
    "EXPO_PUBLIC_SENTRY_DSN",
    envUpper,
    { required: false }
  );

  process.env.EXPO_PUBLIC_APP_ENV = env;
  process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;
  if (sentryDsn) {
    process.env.EXPO_PUBLIC_SENTRY_DSN = sentryDsn;
  }

  return {
    env,
    apiBaseUrl,
    sentryDsn,
  };
};

export default ({ config }) => {
  const envPreset = resolvePublicEnv();

  return {
    ...config,
    name:
      envPreset.env === "prod"
        ? config?.name || "bridgeon"
        : `${config?.name || "bridgeon"} (${envPreset.env})`,
    extra: {
      ...config?.extra,
      ...envPreset,
    },
  };
};
