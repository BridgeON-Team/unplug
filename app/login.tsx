import { authApi } from "@/src/services/api";
import { theme } from "@/src/styles/theme";
import { AuthUtils } from "@/utils/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import UnplugLogo from "@/assets/images/common/unplug_logo.svg";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("오류", "아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const trimmedUsername = username.trim();
      const response = await authApi.login(trimmedUsername, password);

      if (response.success && response.data?.accessToken) {
        const saved = await AuthUtils.saveTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        if (saved) {
          router.replace("/home");
        } else {
          Alert.alert("오류", "토큰 저장 중 문제가 발생했습니다.");
        }
      } else {
        const message =
          response.message || "아이디 또는 비밀번호가 올바르지 않습니다.";
        Alert.alert("로그인 실패", message);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    if (!isLoading) {
      router.push("/signup");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <UnplugLogo width={160} height={60} />
        </View>

        <View style={styles.card}>
          {/* Username Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
              <Text style={styles.signUpLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    justifyContent: "center",
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    minHeight: 56,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  signUpLink: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: "600",
  },
});
