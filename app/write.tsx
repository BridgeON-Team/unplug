import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import WriteForm from "@/components/community/WriteForm";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

export default function WriteScreen() {
  const [activeTab, setActiveTab] = useState("groups");
  const [title, setTitle] = useState("");
  const [challenge, setChallenge] = useState("");
  const [content, setContent] = useState("");

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const handleUpload = () => {
    console.log("Uploading post:", { title, challenge, content });
  };

  const handleBack = () => {
    console.log("Going back");
  };

  return (
    <View style={styles.container}>
      {/* 고정된 상단 바 */}
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>글쓰기</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadText}>업로드</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 입력 폼 */}
      <View style={styles.formContainer}>
        <WriteForm
          title={title}
          challenge={challenge}
          content={content}
          onTitleChange={setTitle}
          onChallengeChange={setChallenge}
          onContentChange={setContent}
        />
      </View>

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  backText: {
    fontSize: 28,
    color: theme.colors.text,
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  uploadText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.white,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
    marginTop: 140,
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
