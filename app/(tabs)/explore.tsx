import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import MeetingList from "@/components/community/MeetingList";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function TabTwoScreen() {
  const [activeTab, setActiveTab] = useState("meetings");

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
      </View>

      <Text style={styles.mainTitle}>모임</Text>

      <View style={styles.contentContainer}>
        <MeetingList />
      </View>

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
  mainTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginTop: 80,
    marginBottom: theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
