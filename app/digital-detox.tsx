import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import AppBlockerSection from "@/components/detox/AppBlockerSection";
import AppUsageSection from "@/components/detox/AppUsageSection";
import FocusTimerSection from "@/components/detox/FocusTimerSection";
import UsageTimerSection from "@/components/detox/UsageTimerSection";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function DigitalDetoxScreen() {
  const [activeTab, setActiveTab] = useState("detox");
  const [currentView, setCurrentView] = useState("today"); // "today", "usage", "timer"

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const handleTabChange = (tab: string) => {
    setCurrentView(tab);
  };

  const handleAppBlock = (appId: string) => {
    console.log("Toggle block for app:", appId);
  };

  const renderContent = () => {
    switch (currentView) {
      case "today":
        return (
          <>
            <FocusTimerSection />
            <AppUsageSection onSettingsPress={() => setCurrentView("usage")} />
          </>
        );
      case "usage":
        return (
          <>
            <AppBlockerSection onToggleBlock={handleAppBlock} />
          </>
        );
      case "timer":
        return (
          <>
            <UsageTimerSection />
          </>
        );
      default:
        return (
          <>
            <FocusTimerSection />
            <AppUsageSection onSettingsPress={() => setCurrentView("usage")} />
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>

      {/* 고정된 하단 네비게이션 바 */}
      <View style={styles.bottomBarContainer}>
        <BottomNavigationBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 80,
    marginBottom: 80,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});