import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MeetingCard from "./MeetingCard";

// 임시 샘플 데이터
const sampleMeetings = [
  {
    id: "1",
    title: "모임 이름이 들어가는 곳임",
    description:
      "모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    participants: 10,
    likes: 10,
    comments: 10,
  },
  {
    id: "2",
    title: "독서 모임",
    description:
      "매주 새로운 책을 읽고 이야기 나누는 독서 모임입니다. 다양한 분야의 책을 함께 읽어보세요.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    participants: 15,
    likes: 23,
    comments: 8,
  },
  {
    id: "3",
    title: "요가 클래스",
    description:
      "건강한 몸과 마음을 위한 요가 클래스입니다. 초보자도 환영합니다.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    participants: 12,
    likes: 18,
    comments: 5,
  },
  {
    id: "4",
    title: "요리 클래스",
    description: "다양한 요리를 배우고 함께 만들어보는 요리 클래스입니다.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    participants: 8,
    likes: 15,
    comments: 3,
  },
  {
    id: "5",
    title: "산책 모임",
    description: "주말마다 함께 산책하며 건강한 시간을 보내는 모임입니다.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    participants: 20,
    likes: 32,
    comments: 12,
  },
];

export default function MeetingList() {
  const [activeTab, setActiveTab] = useState<"all" | "participating">("all");

  const filteredMeetings =
    activeTab === "all"
      ? sampleMeetings
      : sampleMeetings.filter((_, index) => index % 2 === 0); // 임시로 짝수 인덱스만 참여중으로 표시

  const handleTabPress = (tab: "all" | "participating") => {
    setActiveTab(tab);
  };

  const renderMeetingCard = ({ item }: { item: any }) => (
    <MeetingCard
      meeting={item}
      onPress={() => console.log("Meeting pressed:", item.title)}
      onLikePress={() => console.log("Like pressed for meeting:", item.id)}
      onCommentPress={() =>
        console.log("Comment pressed for meeting:", item.id)
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => handleTabPress("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "participating" && styles.activeTab,
          ]}
          onPress={() => handleTabPress("participating")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "participating" && styles.activeTabText,
            ]}
          >
            참여중
          </Text>
        </TouchableOpacity>
      </View>

      {/* 모임 목록 */}
      <FlatList
        data={filteredMeetings}
        renderItem={renderMeetingCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  tabText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    fontWeight: "500",
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
});
