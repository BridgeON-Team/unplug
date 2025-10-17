import { useAuthContext } from "@/src/contexts/AuthContext";
import { useMyPage } from "@/src/hooks/useMyPage";
import { theme } from "@/src/styles/theme";
// import { testApiConnection, testAuthenticatedApi } from "@/src/utils/apiTest";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { username, logout } = useAuthContext();
  const { deleteUser } = useMyPage(username);

  const handleWithdrawal = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말로 회원 탈퇴를 하시겠습니까?\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteUser();
              if (result.success) {
                Alert.alert("회원 탈퇴 완료", result.message, [
                  {
                    text: "확인",
                    onPress: () => logout(),
                  },
                ]);
              } else {
                Alert.alert("회원 탈퇴 실패", result.message);
              }
            } catch {
              Alert.alert("오류", "회원 탈퇴 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleApiTest = async () => {
    Alert.alert("API 테스트", "API 연동을 테스트하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "테스트",
        onPress: async () => {
          try {
            console.log("API 테스트 시작...");

            // 1. 사용자 서비스 API 테스트
            const userResponse = await fetch(
              "http://localhost:8080/user/survey/questions"
            );

            // 2. 챗봇 서비스 API 테스트 (인증이 필요한 API)
            let chatbotTest = "테스트 불가 (로그인 필요)";
            if (username) {
              try {
                const chatbotResponse = await fetch(
                  "http://localhost:8080/chatbot/threads/me",
                  {
                    headers: {
                      "X-Auth-Username": username,
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (chatbotResponse.ok) {
                  const chatbotData = await chatbotResponse.json();
                  chatbotTest = `챗봇 API 성공 (스레드: ${chatbotData.length}개)`;
                } else {
                  chatbotTest = `챗봇 API 실패 (${chatbotResponse.status})`;
                }
              } catch {
                chatbotTest = "챗봇 API 연결 실패";
              }
            }

            if (userResponse.ok) {
              const userData = await userResponse.json();
              Alert.alert(
                "API 테스트 결과",
                `✅ 사용자 서비스: 성공 (설문 문항: ${userData.length}개)\n\n${chatbotTest}`
              );
            } else {
              Alert.alert(
                "API 테스트 실패",
                `❌ 사용자 서비스 오류: ${userResponse.status}\n\n${chatbotTest}`
              );
            }
          } catch (error) {
            console.error("API 테스트 오류:", error);
            Alert.alert(
              "API 테스트 실패",
              `연결 오류: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        {/* 다크 모드 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>다크 모드</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        {/* 알림 설정 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>알림 설정</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        {/* API 테스트 */}
        <TouchableOpacity style={styles.testButton} onPress={handleApiTest}>
          <Text style={styles.testText}>API 테스트</Text>
        </TouchableOpacity>

        {/* 회원 탈퇴 */}
        <TouchableOpacity
          style={styles.withdrawalButton}
          onPress={handleWithdrawal}
        >
          <Text style={styles.withdrawalText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  settingsContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  settingLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: "500",
  },
  withdrawalButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  testButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  testText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  withdrawalText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    fontWeight: "500",
  },
});
