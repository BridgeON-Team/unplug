import { theme } from "@/src/styles/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface CommentItemProps {
  comment: {
    id: string;
    author: string;
    content: string;
    time: string;
    isReply?: boolean;
  };
  onReply?: () => void;
}

export default function CommentItem({ comment, onReply }: CommentItemProps) {
  return (
    <View style={[styles.container, comment.isReply && styles.replyContainer]}>
      {comment.isReply && <View style={styles.replyIndicator} />}

      <View style={styles.content}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
          }}
          style={styles.profileImage}
          defaultSource={require("@/assets/images/icon.png")}
        />

        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.authorName}>{comment.author}</Text>
            <Text style={styles.time}>{comment.time}</Text>
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  replyContainer: {
    marginLeft: theme.spacing.lg,
  },
  replyIndicator: {
    position: "absolute",
    left: -theme.spacing.md,
    top: 20,
    width: 2,
    height: 40,
    backgroundColor: theme.colors.gray[300],
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  authorName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  time: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  commentText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
