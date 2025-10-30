import {
  moderateScale,
  scale as scaleSize,
  verticalScaleSize,
} from "@/src/styles/responsive";
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
      <View style={styles.logoWrapper}>
        <UnplugLogo width={scaleSize(132)} height={verticalScaleSize(46.2)} />
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <AlarmIcon width={scaleSize(24)} height={verticalScaleSize(24)} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(theme.spacing.sm),
    paddingVertical: moderateScale(theme.spacing.sm),
    backgroundColor: theme.colors.background,
    minHeight: verticalScaleSize(58),
  },
  logoWrapper: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  notificationButton: {
    padding: moderateScale(theme.spacing.sm),
    alignItems: "center",
    justifyContent: "center",
  },
});
