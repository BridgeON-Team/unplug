import { theme } from "@/src/styles/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface WritePreviewProps {
  title: string;
  content: string;
  participants: string;
  likes: string;
  comments: string;
}

export default function WritePreview({
  title,
  content,
  participants,
  likes,
  comments,
}: WritePreviewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>미리보기</Text>
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
            }}
            style={styles.previewImage}
            defaultSource={require("@/assets/images/icon.png")}
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>
              {title || "모임 이름이 들어가는 곳임"}
            </Text>
            <Text style={styles.previewDescription}>
              {content ||
                "모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개 모임 소개"}
            </Text>
          </View>
        </View>

        <View style={styles.previewStats}>
          <View style={styles.statItem}>
            <PersonIcon width={16} height={16} fill={theme.colors.gray[500]} />
            <Text style={styles.statText}>{participants || "10"}</Text>
          </View>
          <View style={styles.statItem}>
            <HeartIcon width={16} height={16} fill={theme.colors.gray[500]} />
            <Text style={styles.statText}>{likes || "10"}</Text>
          </View>
          <View style={styles.statItem}>
            <ChatIcon width={16} height={16} fill={theme.colors.gray[500]} />
            <Text style={styles.statText}>{comments || "10"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  previewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  previewDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    lineHeight: 18,
  },
  previewStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginLeft: 4,
  },
});
