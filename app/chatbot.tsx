import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import { theme } from "@/src/styles/theme";

export default function ChatbotScreen() {
  const [activeTab, setActiveTab] = useState("chatbot");

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };


  return (
    <View style={styles.container}>
      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>AI 챗봇</Text>
        </View>
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
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});