import { router, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomNavigationBarProps } from "./NavigationBar.type";

// SVG 아이콘들을 올바른 경로로 import
import ChatbotIcon from "../../../assets/images/common/chatbot_icon.svg";
import CommunityIcon from "../../../assets/images/common/community_icon.svg";
import HomeIcon from "../../../assets/images/common/home_icon.svg";
import MyIcon from "../../../assets/images/common/my_icon.svg";
import TimerIcon from "../../../assets/images/common/timer_icon.svg";

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const pathname = usePathname();

  const getCurrentActiveTab = () => {
    if (pathname === "/home") return "home";
    if (pathname === "/digital-detox") return "tools";
    if (pathname === "/chatbot") return "chatbot";
    if (pathname === "/my-page") return "my";
    if (pathname === "/meetings" || pathname === "/" || pathname.includes("/(tabs)")) return "meetings";
    return activeTab;
  };
  const tabs = [
    {
      id: "meetings",
      label: "모임",
      icon: CommunityIcon,
      width: 38,
      height: 36,
      route: "/meetings",
    },
    {
      id: "chatbot",
      label: "챗봇",
      icon: ChatbotIcon,
      width: 36,
      height: 36,
      route: "/chatbot",
    },
    {
      id: "home",
      label: "",
      icon: HomeIcon,
      width: 34,
      height: 38,
      route: "/home",
    },
    {
      id: "tools",
      label: "도구",
      icon: TimerIcon,
      width: 35,
      height: 36,
      route: "/digital-detox",
    },
    {
      id: "my",
      label: "MY",
      icon: MyIcon,
      width: 30,
      height: 31,
      route: "/my-page",
    },
  ];

  const currentActiveTab = getCurrentActiveTab();

  const handleTabPress = (tab: typeof tabs[0]) => {
    onTabPress(tab.id);
    try {
      router.push(tab.route as any);
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentActiveTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconComponent width={tab.width} height={tab.height} />
            </View>
            {tab.label && (
              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#335FEE",
    opacity: 0.71,
    fontWeight: "500",
  },
  activeLabel: {
    opacity: 1,
    fontWeight: "600",
  },
});

export default BottomNavigationBar;
