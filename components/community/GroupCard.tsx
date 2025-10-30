import { theme } from "@/src/styles/theme";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// SVG 아이콘 import
const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface GroupCardData {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  participants?: number;
  likes?: number;
  comments?: number;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
}

interface GroupCardProps {
  group: GroupCardData;
  onPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onActionPress?: () => void;
  likeDisabled?: boolean;
  commentDisabled?: boolean;
}

export default function GroupCard({
  group,
  onPress,
  onLikePress,
  onCommentPress,
  onActionPress,
  likeDisabled,
  commentDisabled,
}: GroupCardProps) {
  const placeholderImage = require("@/assets/images/icon.png");

  const imageSource: ImageSourcePropType =
    typeof group.image === "string" && group.image.trim() !== ""
      ? { uri: group.image }
      : placeholderImage;

  const showActionButton = Boolean(group.actionLabel);
  const isActionDisabled =
    group.actionDisabled || group.actionLoading || !onActionPress;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* 왼쪽 이미지 */}
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              defaultSource={placeholderImage}
            />
          </View>

          {/* 중앙 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {group.title}
            </Text>
            {group.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {group.description}
              </Text>
            ) : null}

            {showActionButton ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (group.actionDisabled || group.actionLoading) &&
                    styles.actionButtonDisabled,
                ]}
                onPress={onActionPress}
                activeOpacity={0.8}
                disabled={isActionDisabled}
              >
                {group.actionLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.white}
                  />
                ) : (
                  <Text
                    style={[
                      styles.actionButtonText,
                      group.actionDisabled && styles.actionButtonTextDisabled,
                    ]}
                  >
                    {group.actionLabel}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>

          {/* 오른쪽 통계 영역 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <PersonIcon
                width={16}
                height={16}
                fill={theme.colors.gray[500]}
              />
              <Text style={styles.statText}>{group.participants ?? 0}</Text>
            </View>

            <TouchableOpacity
              style={styles.statItem}
              onPress={onLikePress}
              disabled={likeDisabled || !onLikePress}
              activeOpacity={onLikePress && !likeDisabled ? 0.8 : 1}
            >
              <HeartIcon width={16} height={16} fill={theme.colors.gray[500]} />
              <Text style={styles.statText}>{group.likes ?? 0}</Text>
            </TouchableOpacity>

            {typeof group.comments === "number" ? (
              <TouchableOpacity
                style={styles.statItem}
                onPress={onCommentPress}
                disabled={commentDisabled || !onCommentPress}
                activeOpacity={
                  onCommentPress && !commentDisabled ? 0.8 : 1
                }
              >
                <ChatIcon
                  width={16}
                  height={16}
                  fill={theme.colors.gray[500]}
                />
                <Text style={styles.statText}>{group.comments}</Text>
              </TouchableOpacity>
            ) : null}
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
  actionButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  actionButtonDisabled: {
    backgroundColor: theme.colors.gray[200],
  },
  actionButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.white,
  },
  actionButtonTextDisabled: {
    color: theme.colors.gray[500],
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
