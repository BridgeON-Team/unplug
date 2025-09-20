import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);

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

        {/* 회원 탈퇴 */}
        <TouchableOpacity style={styles.withdrawalButton}>
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
  withdrawalText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    fontWeight: "500",
  },
});
