import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CommentInput from "@/components/community/CommentInput";
import CommentItem from "@/components/community/CommentItem";
import GroupInfo from "@/components/community/GroupInfo";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

// 샘플 데이터
const sampleGroup = {
  id: "1",
  title: "모임 이름이 들어가는 곳임",
  description:
    "모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개",
  image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
  participants: 10,
  likes: 10,
  comments: 10,
};

const sampleComments = [
  {
    id: "1",
    author: "멍멍1",
    content:
      "내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용",
    time: "08/10 17:21",
    isReply: false,
  },
  {
    id: "2",
    author: "멍멍2",
    content:
      "내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용내용",
    time: "08/10 17:21",
    isReply: true,
  },
];

export default function GroupDetailScreen() {
  const [activeTab, setActiveTab] = useState("groups");
  const [comments, setComments] = useState(sampleComments);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const handleSendComment = (comment: string) => {
    const newComment = {
      id: Date.now().toString(),
      author: "현재 사용자",
      content: comment,
      time: "방금 전",
      isReply: false,
    };
    setComments([...comments, newComment]);
  };

  return (
    <View style={styles.container}>
      {/* 고정된 상단 바 */}
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>‹ 모임</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 모임 정보 */}
        <GroupInfo group={sampleGroup} />

        {/* 댓글 섹션 */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>댓글</Text>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </View>
      </ScrollView>

      {/* 고정된 댓글 입력창 */}
      <View style={styles.inputContainer}>
        <CommentInput onSendComment={handleSendComment} />
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
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: "500",
  },
  scrollContainer: {
    flex: 1,
    marginTop: 140,
    marginBottom: 140,
  },
  commentsContainer: {
    padding: theme.spacing.md,
  },
  commentsTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
