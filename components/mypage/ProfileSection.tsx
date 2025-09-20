import { theme } from "@/src/styles/theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// SVG 아이콘 import
const CameraIcon = require("@/assets/images/common/chat_icon.svg").default;

// 샘플 데이터
const sampleProfile = {
  nickname: "닉네임",
  tendency: "성향 분류",
  profileImage:
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
  isVerified: true,
};

export default function ProfileSection() {
  const handleEditProfile = () => {
    console.log("Edit profile pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: sampleProfile.profileImage }}
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
            <Text style={styles.nickname}>{sampleProfile.nickname}</Text>
            {sampleProfile.isVerified && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.tendency}>{sampleProfile.tendency}</Text>
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
  },
});
