import { IconSymbol } from "@/components/ui/IconSymbol";
import { groupApi, GroupDTO } from "@/src/services/api";
import { theme } from "@/src/styles/theme";
import { useRouter } from "expo-router";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface GroupSummary {
  id: string;
  title: string;
  description: string;
  participants: number;
  likes: number;
  comments: number;
  avatar?: string | null;
}

const mapToSummary = (group: GroupDTO): GroupSummary => ({
  id: String(group.id),
  title: group.groupName ?? "이름 없는 모임",
  description: group.groupIntroduction ?? "모임 소개가 아직 준비되지 않았어요.",
  participants: group.participantCount ?? 0,
  likes: group.likeCount ?? 0,
  comments: 0,
  avatar: group.imageUrl ?? null,
});

const MAX_COLLAPSED_ITEMS = 3;

export interface AvailableGroupsSectionHandle {
  refresh: () => Promise<void>;
}

const AvailableGroupsSection = forwardRef<AvailableGroupsSectionHandle>(
  function AvailableGroupsSection(_props, ref) {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<"recent" | "popular">("recent");
  const [isExpanded, setIsExpanded] = useState(false);
  const isMountedRef = useRef(true);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await groupApi.getAvailableGroups();

      if (!isMountedRef.current) {
        return;
      }

      setGroups(response.map(mapToSummary));
    } catch (error) {
      console.error("Available groups fetch failed:", error);
      if (isMountedRef.current) {
        setGroups([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void loadGroups();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadGroups]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: loadGroups,
    }),
    [loadGroups]
  );

  const sortedGroups = useMemo(() => {
    if (activeSort === "popular") {
      return [...groups].sort((a, b) => b.likes - a.likes);
    }

    return groups;
  }, [activeSort, groups]);

  const visibleGroups = useMemo(() => {
    if (isExpanded) {
      return sortedGroups;
    }

    return sortedGroups.slice(0, MAX_COLLAPSED_ITEMS);
  }, [isExpanded, sortedGroups]);

  const hasGroups = visibleGroups.length > 0;
  const canExpand = sortedGroups.length > MAX_COLLAPSED_ITEMS;

  const handleToggleExpand = () => {
    if (!canExpand) {
      router.push({
        pathname: "/groups",
        params: { category: "group", filter: "available" },
      });
      return;
    }

    setIsExpanded((prev) => !prev);
  };

  const handleViewAll = () => {
    router.push({
      pathname: "/groups",
      params: { category: "group", filter: "available" },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={handleToggleExpand}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>참여 가능한 모임</Text>
        </View>
        <Text style={styles.subtitle}>
          {canExpand ? (isExpanded ? "접기" : "더보기") : "모임 탭으로 이동"}
        </Text>
      </TouchableOpacity>

      <View style={styles.sortTabs}>
        <TouchableOpacity
          style={[
            styles.sortTab,
            activeSort === "recent" && styles.activeTab,
          ]}
          onPress={() => setActiveSort("recent")}
        >
          <Text
            style={[
              styles.sortTabText,
              activeSort === "recent" && styles.activeTabText,
            ]}
          >
            최신순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortTab,
            activeSort === "popular" && styles.activeTab,
          ]}
          onPress={() => setActiveSort("popular")}
        >
          <Text
            style={[
              styles.sortTabText,
              activeSort === "popular" && styles.activeTabText,
            ]}
          >
            인기순
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>모임을 불러오는 중...</Text>
        </View>
      ) : !hasGroups ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            참여 가능한 모임이 아직 없어요.
          </Text>
        </View>
      ) : (
        <View style={styles.groupsContainer}>
          {visibleGroups.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupItem}>
              <View style={styles.groupHeader}>
                <View style={styles.avatarContainer}>
                  {group.avatar ? (
                    <Image
                      source={{ uri: group.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.defaultAvatar}>
                      <Text style={styles.avatarText}>🌱</Text>
                    </View>
                  )}
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description}
                  </Text>
                </View>
                <View style={styles.participantBadge}>
                  <PersonIcon
                    width={16}
                    height={16}
                    fill={theme.colors.gray[500]}
                  />
                  <Text style={styles.participantCount}>{group.participants}</Text>
                </View>
              </View>

              <View style={styles.groupFooter}>
                <View style={styles.actionButtons}>
                  <View style={styles.actionItem}>
                    <PersonIcon
                      width={16}
                      height={16}
                      fill={theme.colors.gray[500]}
                    />
                    <Text style={styles.actionCount}>{group.participants}</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <HeartIcon
                      width={16}
                      height={16}
                      fill={theme.colors.gray[500]}
                    />
                    <Text style={styles.actionCount}>{group.likes}</Text>
                  </View>
                  <View style={styles.actionItem}>
                    <ChatIcon
                      width={16}
                      height={16}
                      fill={theme.colors.gray[500]}
                    />
                    <Text style={styles.actionCount}>{group.comments}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {groups.length > 0 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          activeOpacity={0.8}
          onPress={handleViewAll}
        >
          <Text style={styles.viewAllText}>모임 탭에서 더 보기</Text>
          <IconSymbol
            name="arrow.up.right"
            size={14}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

AvailableGroupsSection.displayName = "AvailableGroupsSection";

export default AvailableGroupsSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    fontWeight: "600",
  },
  sortTabs: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sortTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: theme.colors.gray[100],
  },
  sortTabText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    justifyContent: "center",
  },
  loadingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  groupsContainer: {
    gap: theme.spacing.md,
  },
  groupItem: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  groupHeader: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
  },
  groupInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  groupDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    lineHeight: 16,
  },
  participantBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  participantCount: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: "600",
  },
  groupFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[300],
    paddingTop: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  actionCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: "600",
  },
  viewAllButton: {
    marginTop: theme.spacing.md,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  viewAllText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
