import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface WriteFormProps {
  title: string;
  challenge: string;
  content: string;
  onTitleChange: (text: string) => void;
  onChallengeChange: (text: string) => void;
  onContentChange: (text: string) => void;
}

export default function WriteForm({
  title,
  challenge,
  content,
  onTitleChange,
  onChallengeChange,
  onContentChange,
}: WriteFormProps) {
  return (
    <View style={styles.container}>
      {/* 제목 입력 */}
      <TextInput
        style={styles.titleInput}
        placeholder="제목을 작성해주세요."
        placeholderTextColor={theme.colors.gray[500]}
        value={title}
        onChangeText={onTitleChange}
      />

      {/* 챌린지 입력 */}
      <TextInput
        style={styles.challengeInput}
        placeholder="챌린지를 작성해주세요."
        placeholderTextColor={theme.colors.gray[500]}
        value={challenge}
        onChangeText={onChallengeChange}
      />

      {/* 내용 입력 */}
      <TextInput
        style={styles.contentInput}
        placeholder="게시물을 작성해주세요."
        placeholderTextColor={theme.colors.gray[500]}
        value={content}
        onChangeText={onContentChange}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    height: 50,
  },
  challengeInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    height: 50,
  },
  contentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    textAlignVertical: "top",
    marginBottom: theme.spacing.xl,
  },
});
