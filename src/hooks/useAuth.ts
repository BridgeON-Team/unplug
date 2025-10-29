import { useEffect, useState } from "react";
import { authApi, UserInfo } from "../services/api";
import { AuthUtils } from "@/utils/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    username: null,
    isLoading: true,
  });

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const tokens = await AuthUtils.getTokens();
      const storedUsername = await AuthUtils.getUsername();

      if (tokens?.accessToken) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
          username: storedUsername,
          isLoading: false,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("토큰 확인 중 오류:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const trimmedUsername = username.trim();
      const response = await authApi.login(trimmedUsername, password);

      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        await AuthUtils.saveTokens({
          accessToken,
          refreshToken,
          username: trimmedUsername,
        });

        setAuthState({
          isAuthenticated: true,
          user: null, // 사용자 정보는 별도로 조회
          accessToken,
          refreshToken,
          username: trimmedUsername,
          isLoading: false,
        });

        return { success: true, message: "로그인 성공" };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      return { success: false, message: "로그인 중 오류가 발생했습니다." };
    }
  };

  const logout = async () => {
    try {
      if (authState.refreshToken) {
        await authApi.logout(authState.refreshToken);
      }
    } catch (error) {
      console.error("로그아웃 API 호출 오류:", error);
    } finally {
      await AuthUtils.removeToken();

      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        username: null,
        isLoading: false,
      });
    }
  };

  const signup = async (userData: {
    username: string;
    name: string;
    password: string;
    nickname: string;
  }) => {
    try {
      const response = await authApi.signup(userData);

      if (response.success) {
        return { success: true, message: "회원가입 성공" };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      return { success: false, message: "회원가입 중 오류가 발생했습니다." };
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const response = await authApi.refreshToken(authState.refreshToken);

      if (response.success) {
        const { accessToken, refreshToken } = response.data;

        await AuthUtils.saveTokens({
          accessToken,
          refreshToken,
          username: authState.username ?? undefined,
        });

        setAuthState((prev) => ({
          ...prev,
          accessToken,
          refreshToken,
        }));

        return { success: true, accessToken };
      } else {
        throw new Error("토큰 갱신 실패");
      }
    } catch (error) {
      console.error("토큰 갱신 오류:", error);
      await logout();
      return { success: false };
    }
  };

  return {
    ...authState,
    login,
    logout,
    signup,
    refreshAccessToken,
  };
};
