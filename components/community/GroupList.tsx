import {
  challengeApi,
  ChallengeDTO,
  groupApi,
  GroupDTO,
} from "@/src/services/api";
import { theme } from "@/src/styles/theme";
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
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GroupCard from "./GroupCard";
import { RefreshableSectionHandle } from "@/src/types/refresh";

type MainCategory = "group" | "challenge";
type FilterKey = "all" | "available" | "participating";
type GroupKey = "available" | "participating";
type ChallengeKey = "available" | "participating";

interface DataState<T> {
  data: T[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

interface GroupListItem {
  id: string;
  sourceId: number;
  type: MainCategory;
  title: string;
  description?: string | null;
  image?: string | null;
  participants: number;
  likes: number;
  isParticipating?: boolean;
}

interface ViewState {
  data: GroupListItem[];
  loading: boolean;
  error: string | null;
}

interface GroupListProps {
  initialCategory?: MainCategory;
  initialGroupFilter?: FilterKey;
  initialChallengeFilter?: FilterKey;
}

const MAIN_TABS: { key: MainCategory; label: string }[] = [
  { key: "group", label: "모임" },
  { key: "challenge", label: "챌린지" },
];

const SUB_TABS: Record<MainCategory, { key: FilterKey; label: string }[]> = {
  group: [
    { key: "all", label: "전체" },
    { key: "available", label: "참여가능" },
    { key: "participating", label: "참여중" },
  ],
  challenge: [
    { key: "all", label: "전체" },
    { key: "available", label: "참여가능" },
    { key: "participating", label: "참여중" },
  ],
};

const EMPTY_MESSAGES: Record<MainCategory, Record<FilterKey, string>> = {
  group: {
    all: "현재 등록된 모임이 없어요.",
    available: "참여 가능한 모임이 없어요.",
    participating: "참여중인 모임이 없어요.",
  },
  challenge: {
    all: "현재 등록된 챌린지가 없어요.",
    available: "시작 가능한 챌린지가 없어요.",
    participating: "참여중인 챌린지가 없어요.",
  },
};

const createInitialGroupState = (): Record<GroupKey, DataState<GroupDTO>> => ({
  available: { data: [], loading: false, loaded: false, error: null },
  participating: { data: [], loading: false, loaded: false, error: null },
});

const createInitialChallengeState = (): Record<
  ChallengeKey,
  DataState<ChallengeDTO>
> => ({
  available: { data: [], loading: false, loaded: false, error: null },
  participating: { data: [], loading: false, loaded: false, error: null },
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const mapGroupToItem = (
  group: GroupDTO,
  isParticipating = false
): GroupListItem => ({
  id: String(group.id),
  sourceId: group.id,
  type: "group",
  title: group.groupName ?? "이름 없는 모임",
  description: group.groupIntroduction ?? "",
  image: group.imageUrl ?? null,
  participants: group.participantCount ?? 0,
  likes: group.likeCount ?? 0,
  isParticipating,
});

const mapChallengeToItem = (
  challenge: ChallengeDTO,
  isParticipating = false
): GroupListItem => ({
  id: String(challenge.id),
  sourceId: challenge.id,
  type: "challenge",
  title: challenge.challengeName ?? "이름 없는 챌린지",
  description: challenge.challengeIntroduction ?? "",
  image: challenge.imageUrl ?? null,
  participants: challenge.participantCount ?? 0,
  likes: challenge.likeCount ?? 0,
  isParticipating,
});

const mergeItems = (
  available: GroupListItem[],
  participating: GroupListItem[]
): GroupListItem[] => {
  const map = new Map<string, GroupListItem>();
  available.forEach((item) => {
    map.set(item.id, item);
  });
  participating.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
};

const GroupList = forwardRef<RefreshableSectionHandle, GroupListProps>(
function GroupListComponent({
  initialCategory = "group",
  initialGroupFilter = "all",
  initialChallengeFilter = "all",
}: GroupListProps = {},
ref) {
  const [activeCategory, setActiveCategory] = useState<MainCategory>(initialCategory);
  const [groupFilter, setGroupFilter] = useState<FilterKey>(initialGroupFilter);
  const [challengeFilter, setChallengeFilter] = useState<FilterKey>(initialChallengeFilter);

  const [groupState, setGroupState] = useState(createInitialGroupState);
  const groupStateRef = useRef(groupState);
  const [challengeState, setChallengeState] = useState(
    createInitialChallengeState
  );
  const challengeStateRef = useRef(challengeState);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setGroupFilter(initialGroupFilter);
  }, [initialGroupFilter]);

  useEffect(() => {
    setChallengeFilter(initialChallengeFilter);
  }, [initialChallengeFilter]);

  useEffect(() => {
    groupStateRef.current = groupState;
  }, [groupState]);

  useEffect(() => {
    challengeStateRef.current = challengeState;
  }, [challengeState]);

  const fetchGroupData = useCallback(
    async (target: GroupKey, options: { force?: boolean } = {}) => {
      const currentState = groupStateRef.current;
      const shouldFetch = options.force || !currentState[target].loaded;

      if (!shouldFetch) {
        return currentState[target].data;
      }

      setGroupState((prev) => {
        const nextState = {
          ...prev,
          [target]: {
            ...prev[target],
            loading: true,
            error: null,
          },
        };
        groupStateRef.current = nextState;
        return nextState;
      });

      try {
        const data =
          target === "available"
            ? await groupApi.getAvailableGroups()
            : await groupApi.getParticipatingGroups();

        setGroupState((prev) => {
          const nextState = {
            ...prev,
            [target]: {
              data,
              loading: false,
              loaded: true,
              error: null,
            },
          };
          groupStateRef.current = nextState;
          return nextState;
        });

        return data;
      } catch (error) {
        const message = getErrorMessage(
          error,
          target === "available"
            ? "모임 정보를 불러오는 중 문제가 발생했어요."
            : "참여중인 모임을 불러오는 중 문제가 발생했어요."
        );

        setGroupState((prev) => {
          const nextState = {
            ...prev,
            [target]: {
              ...prev[target],
              loading: false,
              error: message,
            },
          };
          groupStateRef.current = nextState;
          return nextState;
        });

        throw error;
      }
    },
    []
  );

  const fetchChallengeData = useCallback(
    async (target: ChallengeKey, options: { force?: boolean } = {}) => {
      const currentState = challengeStateRef.current;
      const shouldFetch = options.force || !currentState[target].loaded;

      if (!shouldFetch) {
        return currentState[target].data;
      }

      setChallengeState((prev) => {
        const nextState = {
          ...prev,
          [target]: {
            ...prev[target],
            loading: true,
            error: null,
          },
        };
        challengeStateRef.current = nextState;
        return nextState;
      });

      try {
        const data =
          target === "available"
            ? await challengeApi.getAvailableChallenges()
            : await challengeApi.getParticipatingChallenges();

        setChallengeState((prev) => {
          const nextState = {
            ...prev,
            [target]: {
              data,
              loading: false,
              loaded: true,
              error: null,
            },
          };
          challengeStateRef.current = nextState;
          return nextState;
        });

        return data;
      } catch (error) {
        const message = getErrorMessage(
          error,
          target === "available"
            ? "챌린지 정보를 불러오는 중 문제가 발생했어요."
            : "참여중인 챌린지를 불러오는 중 문제가 발생했어요."
        );

        setChallengeState((prev) => {
          const nextState = {
            ...prev,
            [target]: {
              ...prev[target],
              loading: false,
              error: message,
            },
          };
          challengeStateRef.current = nextState;
          return nextState;
        });

        throw error;
      }
    },
    []
  );

  useEffect(() => {
    if (activeCategory !== "group") {
      return;
    }

    if (groupFilter === "all") {
      fetchGroupData("available").catch(() => {});
      fetchGroupData("participating").catch(() => {});
    } else {
      const key: GroupKey =
        groupFilter === "available" ? "available" : "participating";
      fetchGroupData(key).catch(() => {});
    }
  }, [activeCategory, groupFilter, fetchGroupData]);

  useEffect(() => {
    if (activeCategory !== "challenge") {
      return;
    }

    if (challengeFilter === "all") {
      fetchChallengeData("available").catch(() => {});
      fetchChallengeData("participating").catch(() => {});
    } else {
      const key: ChallengeKey =
        challengeFilter === "available" ? "available" : "participating";
      fetchChallengeData(key).catch(() => {});
    }
  }, [activeCategory, challengeFilter, fetchChallengeData]);

  const groupView = useMemo<Record<FilterKey, ViewState>>(() => {
    const availableItems = groupState.available.data.map((group) =>
      mapGroupToItem(group)
    );
    const participatingItems = groupState.participating.data.map((group) =>
      mapGroupToItem(group, true)
    );

    const allItems = mergeItems(availableItems, participatingItems);

    const allError =
      groupState.available.error && groupState.participating.error
        ? groupState.available.error
        : null;

    return {
      available: {
        data: availableItems,
        loading: groupState.available.loading,
        error: groupState.available.error,
      },
      participating: {
        data: participatingItems,
        loading: groupState.participating.loading,
        error: groupState.participating.error,
      },
      all: {
        data: allItems,
        loading:
          groupState.available.loading || groupState.participating.loading,
        error: allError,
      },
    };
  }, [groupState]);

  const challengeView = useMemo<Record<FilterKey, ViewState>>(() => {
    const availableItems = challengeState.available.data.map((challenge) =>
      mapChallengeToItem(challenge)
    );
    const participatingItems = challengeState.participating.data.map(
      (challenge) => mapChallengeToItem(challenge, true)
    );

    const allItems = mergeItems(availableItems, participatingItems);

    const allError =
      challengeState.available.error && challengeState.participating.error
        ? challengeState.available.error
        : null;

    return {
      available: {
        data: availableItems,
        loading: challengeState.available.loading,
        error: challengeState.available.error,
      },
      participating: {
        data: participatingItems,
        loading: challengeState.participating.loading,
        error: challengeState.participating.error,
      },
      all: {
        data: allItems,
        loading:
          challengeState.available.loading ||
          challengeState.participating.loading,
        error: allError,
      },
    };
  }, [challengeState]);

  const categoryView = activeCategory === "group" ? groupView : challengeView;
  const currentFilter =
    activeCategory === "group" ? groupFilter : challengeFilter;
  const currentMeta = categoryView[currentFilter];

  const isLoading = currentMeta.loading && currentMeta.data.length === 0;
  const isError = Boolean(currentMeta.error) && currentMeta.data.length === 0;
  const emptyMessage = EMPTY_MESSAGES[activeCategory][currentFilter];

  const handleCategoryPress = (category: MainCategory) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  const handleFilterPress = (category: MainCategory, filter: FilterKey) => {
    if (category === "group") {
      setGroupFilter(filter);
    } else {
      setChallengeFilter(filter);
    }
  };

  const handleActionPress = useCallback(
    async (item: GroupListItem) => {
      if (item.isParticipating || actionLoadingId) {
        return;
      }

      setActionLoadingId(item.id);

      try {
        if (item.type === "group") {
          await groupApi.joinGroup(item.sourceId);
          await Promise.all([
            fetchGroupData("available", { force: true }),
            fetchGroupData("participating", { force: true }),
          ]);
        } else {
          await challengeApi.startChallenge(item.sourceId);
          await Promise.all([
            fetchChallengeData("available", { force: true }),
            fetchChallengeData("participating", { force: true }),
          ]);
        }
      } catch (error) {
        const message =
          item.type === "group"
            ? getErrorMessage(error, "모임 참여에 실패했어요.")
            : getErrorMessage(error, "챌린지 시작에 실패했어요.");
        Alert.alert("오류", message);
      } finally {
        setActionLoadingId(null);
      }
    },
    [actionLoadingId, fetchChallengeData, fetchGroupData]
  );

  const handleToggleLike = useCallback(
    async (item: GroupListItem) => {
      if (likeLoadingId) {
        return;
      }

      setLikeLoadingId(item.id);

      try {
        if (item.type === "group") {
          await groupApi.likeGroup(item.sourceId);
          await Promise.all([
            fetchGroupData("available", { force: true }),
            fetchGroupData("participating", { force: true }),
          ]);
        } else {
          await challengeApi.likeChallenge(item.sourceId);
          await Promise.all([
            fetchChallengeData("available", { force: true }),
            fetchChallengeData("participating", { force: true }),
          ]);
        }
      } catch (error) {
        const message =
          item.type === "group"
            ? getErrorMessage(error, "모임 좋아요 처리에 실패했어요.")
            : getErrorMessage(error, "챌린지 좋아요 처리에 실패했어요.");
        Alert.alert("오류", message);
      } finally {
        setLikeLoadingId(null);
      }
    },
    [fetchChallengeData, fetchGroupData, likeLoadingId]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (activeCategory === "group") {
        if (groupFilter === "all") {
          await Promise.all([
            fetchGroupData("available", { force: true }),
            fetchGroupData("participating", { force: true }),
          ]);
        } else {
          const key: GroupKey =
            groupFilter === "available" ? "available" : "participating";
          await fetchGroupData(key, { force: true });
        }
      } else {
        if (challengeFilter === "all") {
          await Promise.all([
            fetchChallengeData("available", { force: true }),
            fetchChallengeData("participating", { force: true }),
          ]);
        } else {
          const key: ChallengeKey =
            challengeFilter === "available" ? "available" : "participating";
          await fetchChallengeData(key, { force: true });
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [
    activeCategory,
    challengeFilter,
    fetchChallengeData,
    fetchGroupData,
    groupFilter,
  ]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{currentMeta.error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [currentMeta.error, emptyMessage, handleRefresh, isError, isLoading]);

  const renderItem = useCallback(
    ({ item }: { item: GroupListItem }) => {
      const actionLabel =
        item.type === "group"
          ? item.isParticipating
            ? "참여중"
            : "참여하기"
          : item.isParticipating
          ? "진행중"
          : "시작하기";

      const isActionLoading = actionLoadingId === item.id;
      const shouldDisableAction =
        item.isParticipating ||
        (actionLoadingId !== null && actionLoadingId !== item.id);
      const shouldDisableLike = likeLoadingId !== null;

      return (
        <GroupCard
          group={{
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image ?? null,
            participants: item.participants,
            likes: item.likes,
            actionLabel,
            actionDisabled: shouldDisableAction,
            actionLoading: isActionLoading,
          }}
          onActionPress={
            shouldDisableAction ? undefined : () => handleActionPress(item)
          }
          onLikePress={
            shouldDisableLike ? undefined : () => handleToggleLike(item)
          }
          likeDisabled={shouldDisableLike}
        />
      );
    },
    [
      actionLoadingId,
      handleActionPress,
      handleToggleLike,
      likeLoadingId,
    ]
  );

  useImperativeHandle(
    ref,
    () => ({
      refresh: handleRefresh,
    }),
    [handleRefresh]
  );

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        {MAIN_TABS.map(({ key, label }) => {
          const isActive = activeCategory === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryButton,
                isActive && styles.activeCategoryButton,
              ]}
              onPress={() => handleCategoryPress(key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContainer}>
        {SUB_TABS[activeCategory].map(({ key, label }) => {
          const current =
            activeCategory === "group" ? groupFilter : challengeFilter;
          const isActive = current === key;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleFilterPress(activeCategory, key)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, isActive && styles.activeTabText]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={currentMeta.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
});

GroupList.displayName = "GroupList";

export default GroupList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoryContainer: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.sm,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  categoryText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    fontWeight: "500",
  },
  activeCategoryText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  tabText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    fontWeight: "500",
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
});
