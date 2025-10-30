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
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  comments?: number;
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
  bottomInset?: number;
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
  comments: 0,
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
  comments: 0,
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
  bottomInset = 0,
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
  const [sampleLoading, setSampleLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [isGroupCreateVisible, setGroupCreateVisible] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupIntroInput, setGroupIntroInput] = useState("");
  const [groupCreateLoading, setGroupCreateLoading] = useState(false);
  const [isChallengeCreateVisible, setChallengeCreateVisible] = useState(false);
  const [challengeContentInput, setChallengeContentInput] = useState("");
  const [challengeCreateLoading, setChallengeCreateLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroupListItem | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailAvailableChallenges, setDetailAvailableChallenges] = useState<
    ChallengeDTO[]
  >([]);
  const [detailParticipatingChallenges, setDetailParticipatingChallenges] =
    useState<ChallengeDTO[]>([]);
  const [detailActionLoadingId, setDetailActionLoadingId] = useState<string | null>(
    null
  );

  const updateSelectedItemFromStore = useCallback((item: GroupListItem) => {
    setSelectedItem((prev) => {
      if (!prev || prev.id !== item.id) {
        return prev;
      }

      if (item.type === "group") {
        const currentGroups = groupStateRef.current;
        const participating = currentGroups.participating.data.find(
          (group) => group.id === item.sourceId
        );
        const available = currentGroups.available.data.find(
          (group) => group.id === item.sourceId
        );

        const source = participating ?? available;
        if (!source) {
          return prev;
        }
        return mapGroupToItem(source, Boolean(participating));
      }

      const currentChallenges = challengeStateRef.current;
      const participating = currentChallenges.participating.data.find(
        (challenge) => challenge.id === item.sourceId
      );
      const available = currentChallenges.available.data.find(
        (challenge) => challenge.id === item.sourceId
      );

      const source = participating ?? available;
      if (!source) {
        return prev;
      }

      return mapChallengeToItem(source, Boolean(participating));
    });
  }, []);

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

  const loadGroupChallengeDetail = useCallback(
    async (groupId: number) => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        const [available, participating] = await Promise.all([
          challengeApi.getGroupChallenges(groupId),
          challengeApi.getGroupParticipatingChallenges(groupId),
        ]);

        setDetailAvailableChallenges(available);
        setDetailParticipatingChallenges(participating);
      } catch (error) {
        setDetailError(
          getErrorMessage(error, "모임의 챌린지 정보를 불러오는데 실패했어요.")
        );
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const handleOpenDetail = useCallback(
    (item: GroupListItem) => {
      setSelectedItem(item);
      setDetailVisible(true);

      if (item.type === "group") {
        loadGroupChallengeDetail(item.sourceId);
      } else {
        setDetailAvailableChallenges([]);
        setDetailParticipatingChallenges([]);
        setDetailError(null);
      }
    },
    [loadGroupChallengeDetail]
  );

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedItem(null);
    setDetailAvailableChallenges([]);
    setDetailParticipatingChallenges([]);
    setDetailError(null);
    setDetailActionLoadingId(null);
  }, []);

  const handleSubmitGroupCreate = useCallback(async () => {
    const trimmedName = groupNameInput.trim();
    const trimmedIntro = groupIntroInput.trim();

    if (!trimmedName) {
      Alert.alert("확인 필요", "모임 이름을 입력해주세요.");
      return;
    }

    try {
      setGroupCreateLoading(true);
      await groupApi.createGroup({
        groupName: trimmedName,
        groupIntroduction: trimmedIntro || undefined,
      });

      setGroupNameInput("");
      setGroupIntroInput("");
      setGroupCreateVisible(false);
      await handleRefresh();
    } catch (error) {
      Alert.alert(
        "오류",
        getErrorMessage(error, "모임 생성 중 문제가 발생했습니다.")
      );
    } finally {
      setGroupCreateLoading(false);
    }
  }, [groupNameInput, groupIntroInput, handleRefresh]);

  const handleSubmitChallengeCreate = useCallback(async () => {
    const trimmedContent = challengeContentInput.trim();

    if (!trimmedContent) {
      Alert.alert("확인 필요", "챌린지 내용을 입력해주세요.");
      return;
    }

    try {
      setChallengeCreateLoading(true);
      await challengeApi.createChallenge({ content: trimmedContent });
      setChallengeContentInput("");
      setChallengeCreateVisible(false);
      await handleRefresh();
    } catch (error) {
      Alert.alert(
        "오류",
        getErrorMessage(error, "챌린지 생성 중 문제가 발생했습니다.")
      );
    } finally {
      setChallengeCreateLoading(false);
    }
  }, [challengeContentInput, handleRefresh]);

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
      if (actionLoadingId) {
        return;
      }

      setActionLoadingId(item.id);

      try {
        if (item.type === "group") {
          if (item.isParticipating) {
            Alert.alert("알림", "이미 참여중인 모임입니다.");
          } else {
            await groupApi.joinGroup(item.sourceId);
            await Promise.all([
              fetchGroupData("available", { force: true }),
              fetchGroupData("participating", { force: true }),
            ]);
            updateSelectedItemFromStore(item);
          }
        } else {
          if (item.isParticipating) {
            await challengeApi.completeChallenge(item.sourceId);
          } else {
            await challengeApi.startChallenge(item.sourceId);
          }

          await Promise.all([
            fetchChallengeData("available", { force: true }),
            fetchChallengeData("participating", { force: true }),
          ]);
          updateSelectedItemFromStore(item);
        }
      } catch (error) {
        const message =
          item.type === "group"
            ? getErrorMessage(error, "모임 참여에 실패했어요.")
            : item.isParticipating
            ? getErrorMessage(error, "챌린지 완료에 실패했어요.")
            : getErrorMessage(error, "챌린지 시작에 실패했어요.");
        Alert.alert("오류", message);
      } finally {
        setActionLoadingId(null);
      }
    },
    [actionLoadingId, fetchChallengeData, fetchGroupData, updateSelectedItemFromStore]
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
        updateSelectedItemFromStore(item);
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
    [fetchChallengeData, fetchGroupData, likeLoadingId, updateSelectedItemFromStore]
  );

  const handleGroupChallengeStart = useCallback(
    async (groupId: number, challengeId: number) => {
      const loadingKey = `start-${groupId}-${challengeId}`;
      if (detailActionLoadingId) {
        return;
      }

      setDetailActionLoadingId(loadingKey);
      try {
        await challengeApi.startGroupChallenge({ groupId, challengeId });
        await Promise.all([
          loadGroupChallengeDetail(groupId),
          fetchChallengeData("available", { force: true }),
          fetchChallengeData("participating", { force: true }),
          fetchGroupData("available", { force: true }),
          fetchGroupData("participating", { force: true }),
        ]);
      } catch (error) {
        Alert.alert(
          "오류",
          getErrorMessage(error, "모임 챌린지 시작에 실패했습니다.")
        );
      } finally {
        setDetailActionLoadingId(null);
      }
    },
    [detailActionLoadingId, fetchChallengeData, fetchGroupData, loadGroupChallengeDetail]
  );

  const handleGroupChallengeComplete = useCallback(
    async (groupId: number, challengeId: number) => {
      const loadingKey = `complete-${groupId}-${challengeId}`;
      if (detailActionLoadingId) {
        return;
      }

      setDetailActionLoadingId(loadingKey);
      try {
        await challengeApi.completeGroupChallenge({ groupId, challengeId });
        await Promise.all([
          loadGroupChallengeDetail(groupId),
          fetchChallengeData("available", { force: true }),
          fetchChallengeData("participating", { force: true }),
          fetchGroupData("available", { force: true }),
          fetchGroupData("participating", { force: true }),
        ]);
      } catch (error) {
        Alert.alert(
          "오류",
          getErrorMessage(error, "모임 챌린지 완료에 실패했습니다.")
        );
      } finally {
        setDetailActionLoadingId(null);
      }
    },
    [detailActionLoadingId, fetchChallengeData, fetchGroupData, loadGroupChallengeDetail]
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

  const handleInsertSampleData = useCallback(async () => {
    if (sampleLoading) {
      return;
    }

    const isGroupCategory = activeCategory === "group";
    setSampleLoading(true);

    try {
      const response = isGroupCategory
        ? await groupApi.insertSample()
        : await challengeApi.insertSample();

      const defaultMessage = isGroupCategory
        ? "모임 예시 데이터를 추가했어요."
        : "챌린지 예시 데이터를 추가했어요.";

      const successMessage =
        typeof response === "string" && response.trim().length > 0
          ? response
          : defaultMessage;

      Alert.alert("완료", successMessage);
      try {
        await handleRefresh();
      } catch (refreshError) {
        console.warn("Sample refresh failed:", refreshError);
      }
    } catch (error) {
      Alert.alert(
        "오류",
        getErrorMessage(
          error,
          isGroupCategory
            ? "모임 예시 데이터를 추가하지 못했어요."
            : "챌린지 예시 데이터를 추가하지 못했어요."
        )
      );
    } finally {
      setSampleLoading(false);
    }
  }, [activeCategory, handleRefresh, sampleLoading]);

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
          ? "완료하기"
          : "시작하기";

      const isActionLoading = actionLoadingId === item.id;
      const shouldDisableAction =
        item.type === "group"
          ? item.isParticipating ||
            (actionLoadingId !== null && actionLoadingId !== item.id)
          : actionLoadingId !== null && actionLoadingId !== item.id;
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
            comments: item.comments,
            actionLabel,
            actionDisabled: shouldDisableAction,
            actionLoading: isActionLoading,
            isParticipating: item.isParticipating,
          }}
          onPress={() => handleOpenDetail(item)}
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
      handleOpenDetail,
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

  const computedBottomPadding = Math.max(theme.spacing.md, bottomInset);

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

      <View style={styles.listActionsRow}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            sampleLoading && styles.secondaryButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleInsertSampleData}
          disabled={sampleLoading}
        >
          {sampleLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {activeCategory === "group"
                ? "모임 예시 데이터"
                : "챌린지 예시 데이터"}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.85}
          onPress={() =>
            activeCategory === "group"
              ? setGroupCreateVisible(true)
              : setChallengeCreateVisible(true)
          }
        >
          <Text style={styles.createButtonText}>
            {activeCategory === "group" ? "＋ 모임 만들기" : "＋ 챌린지 만들기"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentMeta.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: computedBottomPadding },
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />

      <Modal
        visible={isGroupCreateVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setGroupCreateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>새 모임 만들기</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="모임 이름"
              placeholderTextColor={theme.colors.gray[500]}
              value={groupNameInput}
              onChangeText={setGroupNameInput}
            />
            <TextInput
              style={[styles.modalInput, styles.modalMultilineInput]}
              placeholder="모임 소개"
              placeholderTextColor={theme.colors.gray[500]}
              value={groupIntroInput}
              onChangeText={setGroupIntroInput}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setGroupCreateVisible(false)}
                disabled={groupCreateLoading}
              >
                <Text style={styles.modalButtonSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitGroupCreate}
                disabled={groupCreateLoading}
                activeOpacity={0.85}
              >
                {groupCreateLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>생성</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={isChallengeCreateVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setChallengeCreateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>새 챌린지 만들기</Text>
            <TextInput
              style={[styles.modalInput, styles.modalMultilineInput]}
              placeholder="챌린지 내용을 입력하세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={challengeContentInput}
              onChangeText={setChallengeContentInput}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setChallengeCreateVisible(false)}
                disabled={challengeCreateLoading}
              >
                <Text style={styles.modalButtonSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitChallengeCreate}
                disabled={challengeCreateLoading}
                activeOpacity={0.85}
              >
                {challengeCreateLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>생성</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={isDetailVisible}
        animationType="fade"
        transparent
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailContainer}>
            <ScrollView
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.detailTitle}>{selectedItem?.title}</Text>
              {selectedItem?.description ? (
                <Text style={styles.detailDescription}>
                  {selectedItem.description}
                </Text>
              ) : null}

              {selectedItem?.type === "group" ? (
                <>
                  <View style={styles.detailStatsRow}>
                    <Text style={styles.detailStat}>👥 {selectedItem.participants}</Text>
                    <Text style={styles.detailStat}>❤️ {selectedItem.likes}</Text>
                  </View>

                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity
                      style={[styles.detailButton, styles.detailPrimaryButton]}
                      onPress={() => handleActionPress(selectedItem)}
                      disabled={
                        selectedItem.isParticipating || actionLoadingId === selectedItem.id
                      }
                    >
                      {actionLoadingId === selectedItem.id ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                      ) : (
                        <Text style={styles.detailButtonText}>
                          {selectedItem.isParticipating ? "참여중" : "참여하기"}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => handleToggleLike(selectedItem)}
                      disabled={likeLoadingId === selectedItem.id}
                    >
                      {likeLoadingId === selectedItem.id ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      ) : (
                        <Text style={styles.detailSecondaryText}>좋아요</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>적용 가능한 챌린지</Text>
                    {detailLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : detailError ? (
                      <Text style={styles.detailErrorText}>{detailError}</Text>
                    ) : detailAvailableChallenges.length === 0 ? (
                      <Text style={styles.detailEmptyText}>적용 가능한 챌린지가 없습니다.</Text>
                    ) : (
                      detailAvailableChallenges.map((challenge) => {
                        const loadingKey = `start-${selectedItem?.sourceId}-${challenge.id}`;
                        return (
                          <View key={challenge.id} style={styles.detailChallengeItem}>
                            <View style={styles.detailChallengeInfo}>
                              <Text style={styles.detailChallengeTitle}>{challenge.challengeName}</Text>
                              {challenge.challengeIntroduction ? (
                                <Text style={styles.detailChallengeDescription}>
                                  {challenge.challengeIntroduction}
                                </Text>
                              ) : null}
                            </View>
                            <TouchableOpacity
                              style={[styles.detailButton, styles.detailPrimaryButton]}
                              onPress={() =>
                                handleGroupChallengeStart(
                                  selectedItem!.sourceId,
                                  challenge.id
                                )
                              }
                              disabled={detailActionLoadingId === loadingKey}
                            >
                              {detailActionLoadingId === loadingKey ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                              ) : (
                                <Text style={styles.detailButtonText}>시작하기</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>진행중인 챌린지</Text>
                    {detailParticipatingChallenges.length === 0 ? (
                      <Text style={styles.detailEmptyText}>진행중인 챌린지가 없습니다.</Text>
                    ) : (
                      detailParticipatingChallenges.map((challenge) => {
                        const loadingKey = `complete-${selectedItem?.sourceId}-${challenge.id}`;
                        return (
                          <View key={challenge.id} style={styles.detailChallengeItem}>
                            <View style={styles.detailChallengeInfo}>
                              <Text style={styles.detailChallengeTitle}>{challenge.challengeName}</Text>
                              {challenge.challengeIntroduction ? (
                                <Text style={styles.detailChallengeDescription}>
                                  {challenge.challengeIntroduction}
                                </Text>
                              ) : null}
                            </View>
                            <TouchableOpacity
                              style={[styles.detailButton, styles.detailPrimaryButton]}
                              onPress={() =>
                                handleGroupChallengeComplete(
                                  selectedItem!.sourceId,
                                  challenge.id
                                )
                              }
                              disabled={detailActionLoadingId === loadingKey}
                            >
                              {detailActionLoadingId === loadingKey ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                              ) : (
                                <Text style={styles.detailButtonText}>완료하기</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </View>
                </>
              ) : selectedItem ? (
                <>
                  <View style={styles.detailStatsRow}>
                    <Text style={styles.detailStat}>👥 {selectedItem.participants}</Text>
                    <Text style={styles.detailStat}>❤️ {selectedItem.likes}</Text>
                  </View>

                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity
                      style={[styles.detailButton, styles.detailPrimaryButton]}
                      onPress={() => handleActionPress(selectedItem)}
                      disabled={actionLoadingId === selectedItem.id}
                    >
                      {actionLoadingId === selectedItem.id ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                      ) : (
                        <Text style={styles.detailButtonText}>
                          {selectedItem.isParticipating ? "완료하기" : "시작하기"}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => handleToggleLike(selectedItem)}
                      disabled={likeLoadingId === selectedItem.id}
                    >
                      {likeLoadingId === selectedItem.id ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      ) : (
                        <Text style={styles.detailSecondaryText}>좋아요</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={closeDetail}
            >
              <Text style={styles.modalButtonSecondaryText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[200],
  },
  secondaryButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
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
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.text,
  },
  modalMultilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
  modalButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  modalButtonSecondary: {
    backgroundColor: theme.colors.gray[100],
  },
  modalButtonSecondaryText: {
    color: theme.colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  detailContainer: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "80%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailContent: {
    gap: theme.spacing.md,
  },
  detailTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
  },
  detailDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
  },
  detailStatsRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  detailStat: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  detailActionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  detailButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
  },
  detailPrimaryButton: {
    backgroundColor: theme.colors.primary,
  },
  detailButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  detailSecondaryText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  detailSection: {
    gap: theme.spacing.sm,
  },
  detailSectionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  detailEmptyText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  detailErrorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error,
  },
  detailChallengeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  detailChallengeInfo: {
    flex: 1,
    gap: 2,
  },
  detailChallengeTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  detailChallengeDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
});
