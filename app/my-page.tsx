import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import ChartSection from "@/components/mypage/ChartSection";
import ProfileSection from "@/components/mypage/ProfileSection";
import SettingsSection from "@/components/mypage/SettingSection";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function MyPageScreen() {
  const [activeTab, setActiveTab] = useState("my");

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
      >
        {/* 프로필 섹션 */}
        <ProfileSection />

        {/* 차트 섹션 */}
        <ChartSection />

        {/* 설정 섹션 */}
        <SettingsSection />
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
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
