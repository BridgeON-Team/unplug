import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const UnplugLogo = require("@/assets/images/common/unplug_logo.svg").default;
const AlarmIcon = require("@/assets/images/common/alarm_unchecked.svg").default;

interface TopBarProps {
  onNotificationPress?: () => void;
}

export default function TopBar({ onNotificationPress }: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <UnplugLogo width={170} height={60} />
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
      >
        <AlarmIcon width={24} height={24} fill={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: theme.spacing.md,
    height: 80,
    backgroundColor: theme.colors.background,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    marginTop: 20,
  },
  notificationButton: {
    padding: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
