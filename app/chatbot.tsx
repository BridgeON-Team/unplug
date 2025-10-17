import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import ChatbotInterface from "@/components/chatbot/ChatbotInterface";
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
      {/* 챗봇 인터페이스 */}
      <ChatbotInterface />

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
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
