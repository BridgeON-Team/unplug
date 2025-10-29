import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_SERVICE = "unplug_auth";
const ACCESS_TOKEN_KEY = "unplug_access_token";
const REFRESH_TOKEN_KEY = "unplug_refresh_token";
const USERNAME_KEY = "unplug_username";
const ACCESS_TOKEN_COOKIE = "unplug_access_token";
const REFRESH_TOKEN_COOKIE = "unplug_refresh_token";
const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60; // 1 hour
const DEFAULT_COOKIE_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

const USERNAME_STORAGE_KEY = "unplug_username";

const isWeb = Platform.OS === "web";
const isDocumentAvailable = typeof document !== "undefined";

let inMemoryAccessToken: string | null = null;
let inMemoryUsername: string | null = null;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainService: AUTH_SERVICE,
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const buildCookie = (
  name: string,
  value: string,
  maxAgeSeconds: number
) => {
  let cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict`;
  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    cookie += "; Secure";
  }
  return cookie;
};

const setCookie = (
  name: string,
  value: string,
  maxAgeSeconds: number = DEFAULT_COOKIE_MAX_AGE_SECONDS
) => {
  if (!isDocumentAvailable) {
    return;
  }
  document.cookie = buildCookie(name, value, maxAgeSeconds);
};

const getCookie = (name: string): string | null => {
  if (!isDocumentAvailable) {
    return null;
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
};

const deleteCookie = (name: string) => {
  if (!isDocumentAvailable) {
    return;
  }
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
};

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  username?: string;
}

const saveTokensNative = async (tokens: StoredTokens) => {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    tokens.accessToken,
    secureStoreOptions
  );

  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(
      REFRESH_TOKEN_KEY,
      tokens.refreshToken,
      secureStoreOptions
    );
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, secureStoreOptions);
  }

  if (typeof tokens.username !== "undefined") {
    if (tokens.username) {
      await SecureStore.setItemAsync(
        USERNAME_KEY,
        tokens.username,
        secureStoreOptions
      );
      inMemoryUsername = tokens.username;
    } else {
      await SecureStore.deleteItemAsync(USERNAME_KEY, secureStoreOptions);
      inMemoryUsername = null;
    }
  }
};

const readStoredAccessToken = async () => {
  const stored = await SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY,
    secureStoreOptions
  );

  if (stored) {
    inMemoryAccessToken = stored;
  }

  return stored;
};

const readStoredRefreshToken = async () => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY, secureStoreOptions);
};

const readStoredUsername = async () => {
  return SecureStore.getItemAsync(USERNAME_KEY, secureStoreOptions);
};

const removeTokensNative = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, secureStoreOptions);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, secureStoreOptions);
  await SecureStore.deleteItemAsync(USERNAME_KEY, secureStoreOptions);
  inMemoryAccessToken = null;
  inMemoryUsername = null;
};

const getWebTokens = (): StoredTokens | null => {
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
  const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

  if (!accessToken) {
    return null;
  }

  const username = getStoredWebUsername();
  inMemoryUsername = username;

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    username: username ?? undefined,
  };
};

const setStoredWebUsername = (username?: string) => {
  if (!isDocumentAvailable || typeof window === "undefined") {
    return;
  }

  try {
    if (username) {
      window.localStorage?.setItem(USERNAME_STORAGE_KEY, username);
    } else {
      window.localStorage?.removeItem(USERNAME_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error storing username to localStorage:", error);
  }
};

const getStoredWebUsername = (): string | null => {
  if (!isDocumentAvailable || typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage?.getItem(USERNAME_STORAGE_KEY) ?? null;
  } catch (error) {
    console.error("Error reading username from localStorage:", error);
    return null;
  }
};

export const AuthUtils = {
  async saveTokens(tokens: StoredTokens): Promise<boolean> {
    if (!tokens.accessToken) {
      console.error("Access token is required to save tokens.");
      return false;
    }

    if (isWeb) {
      try {
        setCookie(
          ACCESS_TOKEN_COOKIE,
          tokens.accessToken,
          DEFAULT_COOKIE_MAX_AGE_SECONDS
        );

        if (tokens.refreshToken) {
          setCookie(
            REFRESH_TOKEN_COOKIE,
            tokens.refreshToken,
            DEFAULT_COOKIE_REFRESH_MAX_AGE_SECONDS
          );
        } else {
          deleteCookie(REFRESH_TOKEN_COOKIE);
        }

        if (typeof tokens.username !== "undefined") {
          setStoredWebUsername(tokens.username);
          inMemoryUsername = tokens.username ?? null;
        }

        return true;
      } catch (error) {
        console.error("Error saving tokens to cookies:", error);
        return false;
      }
    }

    try {
      await saveTokensNative(tokens);
      inMemoryAccessToken = tokens.accessToken;
      if (typeof tokens.username !== "undefined") {
        inMemoryUsername = tokens.username ?? null;
      }
      return true;
    } catch (error) {
      console.error("Error saving tokens to secure storage:", error);
      return false;
    }
  },

  async saveToken(token: string): Promise<boolean> {
    return this.saveTokens({ accessToken: token });
  },

  async getToken(): Promise<string | null> {
    if (isWeb) {
      return getCookie(ACCESS_TOKEN_COOKIE);
    }

    if (inMemoryAccessToken) {
      return inMemoryAccessToken;
    }

    try {
      const stored = await readStoredAccessToken();
      return stored;
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return null;
    }
  },

  async getTokens(): Promise<StoredTokens | null> {
    if (isWeb) {
      return getWebTokens();
    }

    try {
      const accessToken = await this.getToken();
      if (!accessToken) {
        return null;
      }

      const refreshToken = await readStoredRefreshToken();
      const storedUsername = await readStoredUsername();
      inMemoryUsername = storedUsername ?? null;

      return {
        accessToken,
        refreshToken: refreshToken ?? undefined,
        username: storedUsername ?? undefined,
      };
    } catch (error) {
      console.error("Error retrieving tokens:", error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    if (isWeb) {
      return getCookie(REFRESH_TOKEN_COOKIE);
    }

    try {
      const token = await readStoredRefreshToken();
      return token ?? null;
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  },

  async getUsername(): Promise<string | null> {
    if (inMemoryUsername) {
      return inMemoryUsername;
    }

    if (isWeb) {
      const stored = getStoredWebUsername();
      inMemoryUsername = stored;
      return stored;
    }

    try {
      const stored = await readStoredUsername();
      inMemoryUsername = stored ?? null;
      return inMemoryUsername;
    } catch (error) {
      console.error("Error retrieving username:", error);
      return null;
    }
  },

  async removeToken(): Promise<boolean> {
    if (isWeb) {
      try {
        deleteCookie(ACCESS_TOKEN_COOKIE);
        deleteCookie(REFRESH_TOKEN_COOKIE);
        setStoredWebUsername(undefined);
        inMemoryAccessToken = null;
        inMemoryUsername = null;
        return true;
      } catch (error) {
        console.error("Error removing tokens from cookies:", error);
        return false;
      }
    }

    try {
      await removeTokensNative();
      inMemoryUsername = null;
      return true;
    } catch (error) {
      console.error("Error removing tokens from secure storage:", error);
      return false;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },
};
