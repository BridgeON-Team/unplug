import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import AvailableMeetingsSection from "@/components/home/AvailableMeetingsSection";
import ChallengeSection from "@/components/home/ChallengeSection";
import FocusChartSection from "@/components/home/FocusChartSection";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  return (
    <View style={styles.container}>
      {/* 고정된 상단 바 */}
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 집중 시간 영역 */}
        <FocusChartSection
          hasSetTime={true}
          percentage={38}
          timeSpent="02:20:48"
        />

        {/* 챌린지 영역 */}
        <ChallengeSection />

        {/* 참여 가능한 모임 영역 */}
        <AvailableMeetingsSection />

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
