import { useAuthContext } from "@/src/contexts/AuthContext";
import { useMyPage } from "@/src/hooks/useMyPage";
import { theme } from "@/src/styles/theme";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function SettingsSection() {
  const router = useRouter();
  const { isAuthenticated, username, logout } = useAuthContext();
  const { deleteUser } = useMyPage(isAuthenticated ? username : null);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isWithdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const resetWithdrawalState = () => {
    setWithdrawalModalVisible(false);
    setConfirmUsername("");
  };

  const handleLogout = async () => {
    try {
      setProcessing(true);
      await logout();
      setLogoutModalVisible(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!username) {
      return;
    }
    if (confirmUsername.trim() !== username) {
      Alert.alert("확인 필요", "아이디를 정확히 입력해주세요.");
      return;
    }

    try {
      setProcessing(true);
      const result = await deleteUser();

      if (result.success) {
        resetWithdrawalState();
        await logout();
        Alert.alert("회원 탈퇴 완료", "그동안 이용해주셔서 감사합니다.", [
          {
            text: "확인",
            onPress: () => router.replace("/login"),
          },
        ]);
      } else {
        Alert.alert("회원 탈퇴 실패", result.message);
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      Alert.alert("오류", "회원 탈퇴 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setProcessing(false);
    }
  };

  const canConfirmWithdrawal = useMemo(() => {
    if (!username) return false;
    return confirmUsername.trim() === username;
  }, [confirmUsername, username]);

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        {/* <View style={styles.settingItem}>
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
        </View> */}

        {isAuthenticated && (
          <>
            {/* <View style={styles.settingItem}>
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
            </View> */}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawalButton}
              onPress={() => setWithdrawalModalVisible(true)}
            >
              <Text style={styles.withdrawalText}>회원 탈퇴</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isLogoutModalVisible}
        onRequestClose={() => !isProcessing && setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>로그아웃</Text>
            <Text style={styles.modalDescription}>
              정말 로그아웃 하시겠어요? 다시 로그인해야 모든 기능을 사용할 수 있습니다.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setLogoutModalVisible(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSpacing,
                  styles.modalDangerButton,
                ]}
                onPress={handleLogout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.modalDangerText}>로그아웃</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isWithdrawalModalVisible}
        onRequestClose={() => !isProcessing && resetWithdrawalState()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>
            <Text style={styles.modalDescription}>
              회원 탈퇴를 진행하려면 아래 입력란에{" "}
              <Text style={styles.highlight}>{username}</Text>{" "}
              을(를) 정확히 입력해주세요. 탈퇴 시 모든 데이터가 삭제되며 되돌릴 수
              없습니다.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={confirmUsername}
              onChangeText={setConfirmUsername}
              autoCapitalize="none"
              editable={!isProcessing}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={resetWithdrawalState}
                disabled={isProcessing}
              >
                <Text style={styles.modalSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSpacing,
                  styles.modalDangerButton,
                  (!canConfirmWithdrawal || isProcessing) &&
                  styles.modalButtonDisabled,
                ]}
                onPress={handleWithdrawal}
                disabled={!canConfirmWithdrawal || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.modalDangerText,
                      (!canConfirmWithdrawal || isProcessing) &&
                      styles.modalDangerTextDisabled,
                    ]}
                  >
                    탈퇴하기
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
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
  logoutButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  logoutText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: "600",
  },
  withdrawalButton: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  withdrawalText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.lg,
  },
  highlight: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    minWidth: 100,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
  },
  modalButtonSpacing: {
    marginLeft: theme.spacing.sm,
  },
  modalSecondaryButton: {
    backgroundColor: theme.colors.gray[100],
  },
  modalSecondaryText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  modalDangerButton: {
    backgroundColor: theme.colors.error,
  },
  modalButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  modalDangerText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  modalDangerTextDisabled: {
    color: theme.colors.gray[500],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
});
