import * as Keychain from "react-native-keychain";

const AUTH_SERVICE = "unplug_auth";
const KEYCHAIN_ACCOUNT = "auth_tokens";

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
}

const serializeTokens = (tokens: StoredTokens): string => {
  return JSON.stringify(tokens);
};

const parseTokens = (raw: string | null | undefined): StoredTokens | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredTokens;
    if (parsed && typeof parsed.accessToken === "string") {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Error parsing stored tokens:", error);
    return null;
  }
};

export const AuthUtils = {
  async saveTokens(tokens: StoredTokens): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        KEYCHAIN_ACCOUNT,
        serializeTokens(tokens),
        {
          service: AUTH_SERVICE,
        }
      );
      return true;
    } catch (error) {
      console.error("Error saving tokens:", error);
      return false;
    }
  },

  async saveToken(token: string): Promise<boolean> {
    return this.saveTokens({ accessToken: token });
  },

  async getTokens(): Promise<StoredTokens | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: AUTH_SERVICE,
      });

      if (credentials && credentials.password) {
        return parseTokens(credentials.password);
      }
      return null;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.accessToken ?? null;
  },

  async getRefreshToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.refreshToken ?? null;
  },

  async removeToken(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: AUTH_SERVICE,
      });
      return true;
    } catch (error) {
      console.error("Error removing token:", error);
      return false;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },
};
