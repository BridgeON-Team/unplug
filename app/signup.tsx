import { authApi } from "@/src/services/api";
import { theme } from "@/src/styles/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import UnplugLogo from "@/assets/images/common/unplug_logo.svg";

type AvailabilityState =
  | { status: "idle"; message?: string }
  | { status: "checking"; message?: string }
  | { status: "available"; message?: string }
  | { status: "unavailable"; message?: string }
  | { status: "error"; message?: string };

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityState>({
    status: "idle",
  });

  const isCheckingAvailability = usernameStatus.status === "checking";

  const trimmedUsername = username.trim();
  const trimmedName = name.trim();

  const isUsernameFilled = trimmedUsername.length > 0;
  const isNameFilled = trimmedName.length > 0;
  const isPasswordLengthValid = password.length >= 6;
  const isPasswordConfirmed =
    isPasswordLengthValid && password === confirmPassword;

  const usernameCheckAllowed =
    usernameStatus.status !== "unavailable" && usernameStatus.status !== "error";

  const isFormValid =
    isUsernameFilled &&
    isNameFilled &&
    isPasswordLengthValid &&
    isPasswordConfirmed;

  const canSubmit =
    isFormValid &&
    usernameCheckAllowed &&
    !isLoading &&
    !isCheckingAvailability;

  const handleUsernameChange = (text: string) => {
    setUsername(text.replace(/\s+/g, ""));
    setUsernameStatus({ status: "idle" });
  };

  const checkUsernameAvailability = async (options?: {
    silent?: boolean;
  }): Promise<boolean> => {
    setUsernameStatus({ status: "available", message: "사용 가능한 아이디입니다." });
    return true; // API 오류로 인한 return true
    // const trimmed = username.trim();

    // if (!trimmed) {
    //   setUsernameStatus({ status: "idle" });
    //   if (!options?.silent) {
    //     Alert.alert("확인 필요", "아이디를 먼저 입력해주세요.");
    //   }
    //   return false;
    // }

    // setUsernameStatus({ status: "checking" });

    // try {
    //   const response = await authApi.checkUsername(trimmed);

    //   if (response.success) {
    //     const message =
    //       response.message || response.data || "사용 가능한 아이디입니다.";
    //     setUsernameStatus({ status: "available", message });
    //     if (!options?.silent) {
    //       Alert.alert("확인 완료", message);
    //     }
    //     return true;
    //   }

    //   const failureMessage =
    //     response.message || response.data || "이미 사용 중인 아이디입니다.";
    //   setUsernameStatus({ status: "unavailable", message: failureMessage });
    //   Alert.alert("확인 필요", failureMessage);
    //   return false;
    // } catch (error) {
    //   console.error("Username availability check error:", error);
    //   const errorMessage = "아이디 확인 중 문제가 발생했습니다.";
    //   setUsernameStatus({ status: "error", message: errorMessage });
    //   Alert.alert("오류", errorMessage);
    //   return false;
    // }
  };

  const handleCheckUsername = () => {
    if (!isLoading) {
      checkUsernameAvailability();
    }
  };

  const handleSubmit = async () => {
    if (!isUsernameFilled || !isNameFilled) {
      Alert.alert("오류", "모든 필드를 입력해주세요.");
      return;
    }

    if (!isPasswordLengthValid) {
      Alert.alert("오류", "비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (!isPasswordConfirmed) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!usernameCheckAllowed) {
      Alert.alert("확인 필요", "아이디 중복 확인을 완료해주세요.");
      return;
    }

    const usernameAvailable = await checkUsernameAvailability({ silent: true });
    if (!usernameAvailable) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup({
        username: trimmedUsername,
        name: trimmedName,
        password,
        nickname: trimmedUsername,
      });

      if (response.success) {
        Alert.alert("회원가입 완료", "로그인 화면으로 이동합니다.", [
          {
            text: "확인",
            onPress: () => router.replace("/login"),
          },
        ]);
      } else {
        Alert.alert("회원가입 실패", response.message || "다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("오류", "회원가입 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoLogin = () => {
    if (!isLoading) {
      router.replace("/login");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <UnplugLogo width={160} height={60} />
          </View>

          <View style={styles.card}>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={[styles.label, styles.headerLabel]}>아이디</Text>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (isLoading || usernameStatus.status === "checking") &&
                    styles.checkButtonDisabled,
                  ]}
                  onPress={handleCheckUsername}
                  disabled={isLoading || usernameStatus.status === "checking"}
                >
                  {usernameStatus.status === "checking" ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Text style={styles.checkButtonText}>중복 확인</Text>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="아이디를 입력해주세요"
                placeholderTextColor={theme.colors.gray[500]}
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoComplete="username"
                editable={!isLoading}
              />
              {usernameStatus.status === "available" && (
                <Text style={[styles.statusMessage, styles.statusSuccess]}>
                  {usernameStatus.message || "사용 가능한 아이디입니다."}
                </Text>
              )}
              {usernameStatus.status === "unavailable" && (
                <Text style={[styles.statusMessage, styles.statusError]}>
                  {usernameStatus.message || "이미 사용 중인 아이디입니다."}
                </Text>
              )}
              {usernameStatus.status === "error" && (
                <Text style={[styles.statusMessage, styles.statusError]}>
                  {usernameStatus.message || "아이디 확인 중 문제가 발생했습니다."}
                </Text>
              )}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력해주세요"
                placeholderTextColor={theme.colors.gray[500]}
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

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
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력해주세요"
                placeholderTextColor={theme.colors.gray[500]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!canSubmit || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>회원가입</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
              <TouchableOpacity onPress={handleGoLogin} disabled={isLoading}>
                <Text style={styles.footerLink}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: theme.spacing.sm,
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
  headerLabel: {
    marginBottom: 0,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  checkButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: "center",
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  statusMessage: {
    marginTop: 6,
    fontSize: 12,
  },
  statusSuccess: {
    color: theme.colors.primary,
  },
  statusError: {
    color: theme.colors.error,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  footerLink: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: "600",
  },
});
