import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MeetingList from "@/components/community/MeetingList";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { homeApi, HomeData } from "@/src/services/api";
import { theme } from "@/src/styles/theme";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("meetings");
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await homeApi.getHomeData();
        if (response.success) {
          setHomeData(response.data);
        } else {
          setError(response.message || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.");
        console.error("홈 데이터 로딩 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  // 포스트 좋아요 토글
  const handlePostLike = async (postId: number) => {
    try {
      const response = await homeApi.togglePostLike(postId);
      if (response.success && homeData) {
        // 홈 데이터 업데이트
        const updatedData = { ...homeData };
        const allPosts = [
          ...updatedData.featuredPosts,
          ...updatedData.recentPosts,
        ];
        const post = allPosts.find((p) => p.postId === postId);
        if (post) {
          post.isLiked = response.data.isLiked;
          post.likeCount = response.data.likeCount;
        }
        setHomeData(updatedData);
      }
    } catch {
      Alert.alert("오류", "좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  // 사용자 팔로우 토글
  const handleUserFollow = async (userId: number) => {
    try {
      const response = await homeApi.toggleUserFollow(userId);
      if (response.success && homeData) {
        // 홈 데이터 업데이트
        const updatedData = { ...homeData };
        const user = updatedData.popularUsers.find((u) => u.userId === userId);
        if (user) {
          user.isFollowing = response.data.isFollowing;
          user.followerCount = response.data.followerCount;
        }
        setHomeData(updatedData);
      }
    } catch {
      Alert.alert("오류", "팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar onNotificationPress={handleNotificationPress} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
        <View style={styles.bottomBarContainer}>
          <BottomNavigationBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
      </View>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar onNotificationPress={handleNotificationPress} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              homeApi
                .getHomeData()
                .then((response) => {
                  if (response.success) {
                    setHomeData(response.data);
                  } else {
                    setError(
                      response.message || "데이터를 불러오는데 실패했습니다."
                    );
                  }
                  setLoading(false);
                })
                .catch(() => {
                  setError("네트워크 오류가 발생했습니다.");
                  setLoading(false);
                });
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomBarContainer}>
          <BottomNavigationBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <TopBar onNotificationPress={handleNotificationPress} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>홈</Text>

        {/* 통계 섹션 */}
        {homeData?.stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>통계</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {homeData.stats.totalPosts}
                </Text>
                <Text style={styles.statLabel}>포스트</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {homeData.stats.totalUsers}
                </Text>
                <Text style={styles.statLabel}>사용자</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {homeData.stats.totalLikes}
                </Text>
                <Text style={styles.statLabel}>좋아요</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {homeData.stats.totalComments}
                </Text>
                <Text style={styles.statLabel}>댓글</Text>
              </View>
            </View>
          </View>
        )}

        {/* 추천 포스트 섹션 */}
        {homeData?.featuredPosts && homeData.featuredPosts.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>추천 포스트</Text>
            {homeData.featuredPosts.map((post) => (
              <TouchableOpacity key={post.postId} style={styles.postItem}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post.content}
                </Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  <Text style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePostLike(post.postId)}
                  >
                    <Text style={styles.actionText}>
                      {post.isLiked ? "❤️" : "🤍"} {post.likeCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>
                      💬 {post.commentCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 추천 사용자 섹션 */}
        {homeData?.popularUsers && homeData.popularUsers.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>추천 사용자</Text>
            {homeData.popularUsers.map((user) => (
              <TouchableOpacity key={user.userId} style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userNickname}>@{user.nickname}</Text>
                  <Text style={styles.userStats}>
                    팔로워 {user.followerCount} • 팔로잉 {user.followingCount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    user.isFollowing && styles.followingButton,
                  ]}
                  onPress={() => handleUserFollow(user.userId)}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      user.isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {user.isFollowing ? "팔로잉" : "팔로우"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 기존 모임 리스트 */}
        <MeetingList />
      </ScrollView>

      <View style={styles.bottomBarContainer}>
        <BottomNavigationBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  mainTitle: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginTop: 80,
    marginBottom: theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  // 로딩 및 에러 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginTop: 80,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginTop: 80,
  },
  errorTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
  // 섹션 스타일
  sectionContainer: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  // 통계 스타일
  statsContainer: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: "center",
  },
  statNumber: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  // 포스트 스타일
  postItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  postTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  postContent: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  postAuthor: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  postDate: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  postActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  // 사용자 스타일
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userNickname: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  userStats: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  followingButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  followButtonText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "600",
    color: theme.colors.white,
  },
  followingButtonText: {
    color: theme.colors.text,
  },
});
