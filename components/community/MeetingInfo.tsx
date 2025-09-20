import { theme } from "@/src/styles/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface MeetingInfoProps {
  meeting: {
    id: string;
    title: string;
    description: string;
    image: string;
    participants: number;
    likes: number;
    comments: number;
  };
}

export default function MeetingInfo({ meeting }: MeetingInfoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.meetingHeader}>
        <Image
          source={{ uri: meeting.image }}
          style={styles.meetingImage}
          defaultSource={require("@/assets/images/icon.png")}
        />
        <View style={styles.meetingInfo}>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.meetingDescription}>{meeting.description}</Text>
        </View>
      </View>

      {/* 통계 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <PersonIcon width={16} height={16} fill={theme.colors.gray[500]} />
          <Text style={styles.statText}>{meeting.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <HeartIcon width={16} height={16} fill={theme.colors.gray[500]} />
          <Text style={styles.statText}>{meeting.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <ChatIcon width={16} height={16} fill={theme.colors.gray[500]} />
          <Text style={styles.statText}>{meeting.comments}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  meetingHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  meetingImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  meetingDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    lineHeight: 18,
  },
  statsContainer: {
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
