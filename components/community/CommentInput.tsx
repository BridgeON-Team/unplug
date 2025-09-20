import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// SVG 아이콘 import
const SendIcon = require("@/assets/images/common/chat_icon.svg").default;

interface CommentInputProps {
  onSendComment: (comment: string) => void;
}

export default function CommentInput({ onSendComment }: CommentInputProps) {
  const [comment, setComment] = useState("");

  const handleSend = () => {
    if (comment.trim()) {
      onSendComment(comment.trim());
      setComment("");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
        }}
        style={styles.profileImage}
        defaultSource={require("@/assets/images/icon.png")}
      />

      <TextInput
        style={styles.input}
        placeholder="댓글을 입력하세요."
        placeholderTextColor={theme.colors.gray[500]}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <SendIcon width={20} height={20} fill={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[300],
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    maxHeight: 80,
  },
  sendButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
});
