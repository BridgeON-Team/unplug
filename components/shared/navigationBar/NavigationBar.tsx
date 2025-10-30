import { router, usePathname } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/src/styles/theme";
import { moderateScale } from "@/src/styles/responsive";
import { BottomNavigationBarProps } from "./NavigationBar.type";

import ChatbotIcon from "../../../assets/images/common/chatbot_icon.svg";
import CommunityIcon from "../../../assets/images/common/community_icon.svg";
import HomeIcon from "../../../assets/images/common/home_icon.svg";
import MyIcon from "../../../assets/images/common/my_icon.svg";
import TimerIcon from "../../../assets/images/common/timer_icon.svg";

const ICON_SIZES = {
  default: { width: 30, height: 30 },
  home: { width: 32, height: 34 },
};

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const currentActiveTab = useMemo(() => {
    if (pathname === "/home") return "home";
    if (pathname === "/restrict") return "tools";
    if (pathname === "/chatbot") return "chatbot";
    if (pathname === "/my-page") return "my";
    if (pathname === "/groups" || pathname === "/") return "groups";
    return activeTab;
  }, [activeTab, pathname]);

  const tabs = useMemo(
    () => [
      {
        id: "groups" as const,
        label: "모임",
        icon: CommunityIcon,
        size: ICON_SIZES.default,
        route: "/groups",
      },
      {
        id: "chatbot" as const,
        label: "챗봇",
        icon: ChatbotIcon,
        size: ICON_SIZES.default,
        route: "/chatbot",
      },
      {
        id: "home" as const,
        label: "",
        icon: HomeIcon,
        size: ICON_SIZES.home,
        route: "/home",
      },
      {
        id: "tools" as const,
        label: "제한 도구",
        icon: TimerIcon,
        size: ICON_SIZES.default,
        route: "/restrict",
      },
      {
        id: "my" as const,
        label: "MY",
        icon: MyIcon,
        size: ICON_SIZES.default,
        route: "/my-page",
      },
    ],
    []
  );

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        paddingBottom:
          insets.bottom > 0
            ? insets.bottom
            : moderateScale(theme.spacing.sm),
      },
    ],
    [insets.bottom]
  );

  const handleTabPressInternal = (tab: (typeof tabs)[number]) => {
    onTabPress(tab.id);
    router.push(tab.route as never);
  };

  return (
    <View style={containerStyle}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentActiveTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPressInternal(tab)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                width={moderateScale(tab.size.width)}
                height={moderateScale(tab.size.height)}
              />
            </View>
            {tab.label ? (
              <Text
                style={[styles.label, isActive && styles.activeLabel]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E4E4E7",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: moderateScale(theme.spacing.md),
    paddingTop: moderateScale(theme.spacing.xs),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: moderateScale(4),
  },
  iconContainer: {
    marginBottom: moderateScale(2),
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: moderateScale(10),
    color: theme.colors.primary,
    opacity: 0.7,
    fontWeight: "500",
  },
  activeLabel: {
    opacity: 1,
    fontWeight: "600",
  },
});

export default BottomNavigationBar;
