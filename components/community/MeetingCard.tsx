import { theme } from "@/src/styles/theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// SVG 아이콘 import
const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    image: string;
    participants: number;
    likes: number;
    comments: number;
  };
  onPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
}

export default function MeetingCard({
  meeting,
  onPress,
  onLikePress,
  onCommentPress,
}: MeetingCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* 왼쪽 이미지 */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: meeting.image }}
              style={styles.image}
              defaultSource={require("@/assets/images/icon.png")}
            />
          </View>

          {/* 중앙 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {meeting.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {meeting.description}
            </Text>
          </View>

          {/* 오른쪽 통계 영역 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <PersonIcon
                width={16}
                height={16}
                fill={theme.colors.gray[500]}
              />
              <Text style={styles.statText}>{meeting.participants}</Text>
            </View>

            <TouchableOpacity style={styles.statItem} onPress={onLikePress}>
              <HeartIcon width={16} height={16} fill={theme.colors.gray[500]} />
              <Text style={styles.statText}>{meeting.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statItem} onPress={onCommentPress}>
              <ChatIcon width={16} height={16} fill={theme.colors.gray[500]} />
              <Text style={styles.statText}>{meeting.comments}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    padding: theme.spacing.md,
    alignItems: "center",
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    lineHeight: 18,
  },
  statsContainer: {
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginLeft: 4,
  },
});
