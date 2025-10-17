import { useAuthContext } from "@/src/contexts/AuthContext";
import { useMyPage } from "@/src/hooks/useMyPage";
import { theme } from "@/src/styles/theme";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// SVG 아이콘 import
const CameraIcon = require("@/assets/images/common/chat_icon.svg").default;

export default function ProfileSection() {
  const { username } = useAuthContext();
  const { userInfo, surveyResult, isLoading, error } = useMyPage(username);

  const handleEditProfile = () => {
    Alert.alert("프로필 편집", "프로필 편집 기능은 준비 중입니다.");
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // 사용자 정보가 없는 경우
  if (!userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            사용자 정보를 불러올 수 없습니다.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                userInfo.profileImgUrl ||
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
            }}
            style={styles.profileImage}
            defaultSource={require("@/assets/images/icon.png")}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleEditProfile}
          >
            <CameraIcon width={16} height={16} fill={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nicknameContainer}>
            <Text style={styles.nickname}>{userInfo.nickname}</Text>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
          <Text style={styles.tendency}>
            {surveyResult
              ? `${surveyResult.type} - ${surveyResult.description}`
              : "설문을 완료해주세요"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.black,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileInfo: {
    alignItems: "center",
  },
  nicknameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  nickname: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  tendency: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: "center",
  },
});
