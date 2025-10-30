import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatbotScreenLayout from "@/components/chatbot/ChatbotScreenLayout";
import PageHeading from "@/components/shared/PageHeading";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function ChatbotScreen() {
  const [activeTab, setActiveTab] = useState("chatbot");

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar onNotificationPress={() => null} />
        </View>

        <PageHeading title="챗봇" subtitle="스레드를 선택해 대화를 시작하세요" />

        <View style={styles.interfaceContainer}>
          <ChatbotScreenLayout />
        </View>

        <BottomNavigationBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBarContainer: {
    paddingHorizontal: 0,
    marginBottom: theme.spacing.xs,
  },
  interfaceContainer: {
    flex: 1,
    paddingBottom: theme.spacing.xs,
  },
});
