import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// 샘플 설정 데이터
const sampleSettings = {
  darkMode: false,
  notifications: false,
  settings: [
    {
      id: "darkMode",
      label: "다크 모드",
      type: "switch",
      value: false,
    },
    {
      id: "notifications",
      label: "알림 설정",
      type: "switch",
      value: false,
    },
  ],
};

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(sampleSettings.darkMode);
  const [notifications, setNotifications] = useState(
    sampleSettings.notifications
  );

  const handleWithdrawal = () => {
    console.log("회원 탈퇴 버튼 클릭");
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsContainer}>
        {/* 다크 모드 */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>
            {sampleSettings.settings[0].label}
          </Text>
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
          <Text style={styles.settingLabel}>
            {sampleSettings.settings[1].label}
          </Text>
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
    marginTop: theme.spacing.sm,
  },
  withdrawalText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    fontWeight: "500",
  },
});
