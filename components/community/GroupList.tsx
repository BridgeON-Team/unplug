import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  challengeApi,
  ChallengeDTO,
  groupApi,
  GroupDTO,
} from "@/src/services/api";
import { theme } from "@/src/styles/theme";
import {
  ChallengeTodoItem,
  encodeChallengeTodoContent,
  getChallengeContentSummary,
  parseChallengeContent,
} from "@/src/utils/challengeTodo";
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

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;

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
  isTodoFormat?: boolean;
  todoItems?: ChallengeTodoItem[];
  todoDescription?: string | null;
  todoName?: string | null;
  rawContent?: string | null;
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

const isLikelyJsonString = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const startsWith = trimmed[0];
  const endsWith = trimmed[trimmed.length - 1];

  return (
    (startsWith === "{" && endsWith === "}") ||
    (startsWith === "[" && endsWith === "]")
  );
};

const getPlainTextIfNotJson = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return isLikelyJsonString(trimmed) ? null : trimmed;
};

const getPlainChallengeIntroduction = (value: string | null | undefined) =>
  getPlainTextIfNotJson(value);

const extractTodoData = (
  challenge: ChallengeDTO
):
  | {
      parsed: ReturnType<typeof parseChallengeContent>;
      source: "introduction" | "name";
      raw: string | null;
    }
  | null => {
  const parsedIntro = parseChallengeContent(challenge.challengeIntroduction);
  if (parsedIntro.isTodoFormat) {
    return {
      parsed: parsedIntro,
      source: "introduction",
      raw: challenge.challengeIntroduction ?? null,
    };
  }

  const parsedName = parseChallengeContent(challenge.challengeName);
  if (parsedName.isTodoFormat) {
    return {
      parsed: parsedName,
      source: "name",
      raw: challenge.challengeName ?? null,
    };
  }

  return null;
};

const deriveChallengeTitle = (
  challenge: ChallengeDTO,
  parsedName?: string | null
): string => {
  const sanitizedParsedName = parsedName?.trim();
  if (sanitizedParsedName) {
    return sanitizedParsedName;
  }

  const plainName = getPlainTextIfNotJson(challenge.challengeName);
  if (plainName) {
    return plainName;
  }

  return "이름 없는 챌린지";
};

const deriveChallengeSummary = (
  challenge: ChallengeDTO,
  parsed: ReturnType<typeof parseChallengeContent> | null,
  source: "introduction" | "name" | undefined
): string | null => {
  if (parsed) {
    const summary = getChallengeContentSummary(parsed);
    if (summary) {
      return summary;
    }
    if (source !== "introduction") {
      const plainIntro = getPlainChallengeIntroduction(challenge.challengeIntroduction);
      if (plainIntro) {
        return plainIntro;
      }
    }
    return null;
  }

  return getPlainChallengeIntroduction(challenge.challengeIntroduction);
};

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
): GroupListItem => {
  const todoData = extractTodoData(challenge);
  const parsed = todoData?.parsed ?? null;
  const title = deriveChallengeTitle(challenge, parsed?.name ?? null);
  const summary = deriveChallengeSummary(challenge, parsed, todoData?.source);

  return {
    id: String(challenge.id),
    sourceId: challenge.id,
    type: "challenge",
    title,
    description: summary,
    image: challenge.imageUrl ?? null,
    participants: challenge.participantCount ?? 0,
    likes: challenge.likeCount ?? 0,
    isParticipating,
    comments: 0,
    isTodoFormat: Boolean(todoData),
    todoItems: parsed?.items ?? [],
    todoDescription: parsed?.description ?? null,
    todoName: parsed?.name ?? null,
    rawContent: todoData?.raw ?? null,
  };
};

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
  const [challengeNameInput, setChallengeNameInput] = useState("");
  const [challengeContentInput, setChallengeContentInput] = useState("");
  const [challengeTodoInput, setChallengeTodoInput] = useState("");
  const [challengeTodoItems, setChallengeTodoItems] = useState<ChallengeTodoItem[]>([]);
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
  const [todoCompletion, setTodoCompletion] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const toggleTodoCompletion = useCallback(
    (challengeId: number | string, todoId: string) => {
      const key = String(challengeId);
      setTodoCompletion((prev) => {
        const current = prev[key] ?? {};
        return {
          ...prev,
          [key]: {
            ...current,
            [todoId]: !current[todoId],
          },
        };
      });
    },
    []
  );

  const isTodoListComplete = useCallback(
    (challengeId: number | string, items: ChallengeTodoItem[]) => {
      if (items.length === 0) {
        return true;
      }

      const key = String(challengeId);
      const completion = todoCompletion[key] ?? {};
      return items.every((item) => Boolean(completion[item.id]));
    },
    [todoCompletion]
  );

  const getTodoProgress = useCallback(
    (challengeId: number | string, items: ChallengeTodoItem[]) => {
      const key = String(challengeId);
      const completion = todoCompletion[key] ?? {};
      const completed = items.filter((item) => completion[item.id]).length;
      return {
        completed,
        total: items.length,
      };
    },
    [todoCompletion]
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

      if (
        item.type === "challenge" &&
        item.isParticipating &&
        item.todoItems &&
        item.todoItems.length > 0 &&
        !isTodoListComplete(item.id, item.todoItems)
      ) {
        Alert.alert("확인 필요", "모든 TODO를 완료해야 챌린지를 종료할 수 있어요.");
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
            if (item.todoItems && item.todoItems.length > 0) {
              setTodoCompletion((prev) => {
                const key = item.id;
                if (!(key in prev)) {
                  return prev;
                }
                const next = { ...prev };
                delete next[key];
                return next;
              });
            }
          } else {
            await challengeApi.startChallenge(item.sourceId);
            if (item.todoItems && item.todoItems.length > 0) {
              setTodoCompletion((prev) => ({
                ...prev,
                [item.id]: item.todoItems!.reduce<Record<string, boolean>>(
                  (acc, todo) => {
                    acc[todo.id] = false;
                    return acc;
                  },
                  {}
                ),
              }));
            }
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
    [
      actionLoadingId,
      fetchChallengeData,
      fetchGroupData,
      isTodoListComplete,
      updateSelectedItemFromStore,
    ]
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
    async (
      groupId: number,
      challenge: ChallengeDTO,
      todos: ChallengeTodoItem[]
    ) => {
      const loadingKey = `start-${groupId}-${challenge.id}`;
      if (detailActionLoadingId) {
        return;
      }

      setDetailActionLoadingId(loadingKey);
      try {
        await challengeApi.startGroupChallenge({
          groupId,
          challengeId: challenge.id,
        });
        if (todos.length > 0) {
          setTodoCompletion((prev) => ({
            ...prev,
            [String(challenge.id)]: todos.reduce<Record<string, boolean>>(
              (acc, todo) => {
                acc[todo.id] = false;
                return acc;
              },
              {}
            ),
          }));
        }
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
    async (
      groupId: number,
      challenge: ChallengeDTO,
      todos: ChallengeTodoItem[]
    ) => {
      const loadingKey = `complete-${groupId}-${challenge.id}`;
      if (detailActionLoadingId) {
        return;
      }

      if (todos.length > 0 && !isTodoListComplete(challenge.id, todos)) {
        Alert.alert("확인 필요", "모든 TODO를 완료해야 챌린지를 종료할 수 있어요.");
        return;
      }

      setDetailActionLoadingId(loadingKey);
      try {
        await challengeApi.completeGroupChallenge({
          groupId,
          challengeId: challenge.id,
        });
        if (todos.length > 0) {
          setTodoCompletion((prev) => {
            const key = String(challenge.id);
            if (!(key in prev)) {
              return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
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
    [
      detailActionLoadingId,
      fetchChallengeData,
      fetchGroupData,
      isTodoListComplete,
      loadGroupChallengeDetail,
    ]
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

  const resetChallengeCreateForm = useCallback(() => {
    setChallengeNameInput("");
    setChallengeContentInput("");
    setChallengeTodoInput("");
    setChallengeTodoItems([]);
  }, []);

  const handleAddChallengeTodoItem = useCallback(() => {
    const trimmed = challengeTodoInput.trim();

    if (!trimmed) {
      Alert.alert("확인 필요", "추가할 TODO 내용을 입력해주세요.");
      return;
    }

    setChallengeTodoItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: trimmed,
      },
    ]);
    setChallengeTodoInput("");
  }, [challengeTodoInput]);

  const handleRemoveChallengeTodoItem = useCallback((id: string) => {
    setChallengeTodoItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSubmitChallengeCreate = useCallback(async () => {
    const trimmedName = challengeNameInput.trim();
    const trimmedDescription = challengeContentInput.trim();
    const sanitizedTodos = challengeTodoItems
      .map<ChallengeTodoItem>((item, index) => ({
        id: item.id || `${index}`,
        text: item.text.trim(),
      }))
      .filter((item) => item.text.length > 0);

    if (!trimmedName) {
      Alert.alert("확인 필요", "챌린지 이름을 입력해주세요.");
      return;
    }

    if (sanitizedTodos.length === 0) {
      Alert.alert("확인 필요", "최소 1개의 TODO 항목을 추가해주세요.");
      return;
    }

    try {
      setChallengeCreateLoading(true);
      const contentPayload = encodeChallengeTodoContent(
        sanitizedTodos,
        {
          description: trimmedDescription || null,
          name: trimmedName,
        }
      );
      await challengeApi.createChallenge({ content: contentPayload });
      resetChallengeCreateForm();
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
  }, [
    challengeNameInput,
    challengeContentInput,
    challengeTodoItems,
    handleRefresh,
    resetChallengeCreateForm,
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
      const challengeTodos = item.todoItems ?? [];
      const allTodosCompleted =
        item.type === "challenge"
          ? isTodoListComplete(item.id, challengeTodos)
          : true;
      const shouldDisableAction =
        item.type === "group"
          ? item.isParticipating ||
            (actionLoadingId !== null && actionLoadingId !== item.id)
          : (item.isParticipating && !allTodosCompleted) ||
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
      isTodoListComplete,
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
  const selectedChallengeTodos =
    selectedItem && selectedItem.type === "challenge"
      ? selectedItem.todoItems ?? []
      : [];
  const selectedChallengeProgress =
    selectedItem && selectedItem.type === "challenge"
      ? getTodoProgress(selectedItem.id, selectedChallengeTodos)
      : { completed: 0, total: 0 };
  const selectedChallengeTodosCompleted =
    selectedItem && selectedItem.type === "challenge"
      ? isTodoListComplete(selectedItem.id, selectedChallengeTodos)
      : true;
  const selectedChallengeCompletionMap =
    selectedItem && selectedItem.type === "challenge"
      ? todoCompletion[selectedItem.id] ?? {}
      : {};

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
          onPress={() => {
            if (activeCategory === "group") {
              setGroupCreateVisible(true);
            } else {
              resetChallengeCreateForm();
              setChallengeCreateVisible(true);
            }
          }}
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
        onRequestClose={() => {
          resetChallengeCreateForm();
          setChallengeCreateVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>새 챌린지 만들기</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="챌린지 이름을 입력하세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={challengeNameInput}
              onChangeText={setChallengeNameInput}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.modalInput, styles.modalMultilineInput]}
              placeholder="챌린지 설명을 입력하세요 (선택)"
              placeholderTextColor={theme.colors.gray[500]}
              value={challengeContentInput}
              onChangeText={setChallengeContentInput}
              multiline
            />
            <View style={styles.modalTodoSection}>
              <Text style={styles.modalTodoLabel}>TODO 리스트</Text>
              <View style={styles.modalTodoInputRow}>
                <TextInput
                  style={[styles.modalInput, styles.modalTodoInput]}
                  placeholder="추가할 TODO 내용을 입력하세요"
                  placeholderTextColor={theme.colors.gray[500]}
                  value={challengeTodoInput}
                  onChangeText={setChallengeTodoInput}
                  returnKeyType="done"
                  onSubmitEditing={handleAddChallengeTodoItem}
                />
                <TouchableOpacity
                  style={[
                    styles.modalTodoAddButton,
                    !challengeTodoInput.trim() && styles.modalTodoAddButtonDisabled,
                  ]}
                  onPress={handleAddChallengeTodoItem}
                  disabled={!challengeTodoInput.trim() || challengeCreateLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalTodoAddButtonText}>추가</Text>
                </TouchableOpacity>
              </View>
              {challengeTodoItems.length === 0 ? (
                <Text style={styles.modalTodoEmptyText}>
                  TODO 항목을 추가해주세요.
                </Text>
              ) : (
                <ScrollView
                  style={styles.modalTodoList}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalTodoListContent}
                >
                  {challengeTodoItems.map((todo) => (
                    <View key={todo.id} style={styles.modalTodoListItem}>
                      <Text style={styles.modalTodoListItemText}>{todo.text}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveChallengeTodoItem(todo.id)}
                        style={styles.modalTodoRemoveButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalTodoRemoveButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  resetChallengeCreateForm();
                  setChallengeCreateVisible(false);
                }}
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
            <TouchableOpacity
              style={styles.detailCloseButton}
              onPress={closeDetail}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconSymbol name="xmark" size={20} color={theme.colors.gray[700]} />
            </TouchableOpacity>
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
                    <View style={styles.detailStatItem}>
                      <View style={styles.detailStatIcon}>
                        <PersonIcon
                          width={16}
                          height={16}
                          fill={theme.colors.gray[500]}
                        />
                      </View>
                      <Text style={styles.detailStatText}>{selectedItem.participants}</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <View style={styles.detailStatIcon}>
                        <HeartIcon
                          width={16}
                          height={16}
                          fill={theme.colors.gray[500]}
                        />
                      </View>
                      <Text style={styles.detailStatText}>{selectedItem.likes}</Text>
                    </View>
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

                  {selectedItem.isParticipating ? (
                    <>
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
                            const todoData = extractTodoData(challenge);
                            const parsed = todoData?.parsed ?? null;
                            const todos = parsed?.items ?? [];
                            const challengeTitle = deriveChallengeTitle(
                              challenge,
                              parsed?.name ?? null
                            );
                            const summary = deriveChallengeSummary(
                              challenge,
                              parsed,
                              todoData?.source
                            );
                            return (
                              <View key={challenge.id} style={styles.detailChallengeItem}>
                                <View style={styles.detailChallengeInfo}>
                                  <Text style={styles.detailChallengeTitle}>{challengeTitle}</Text>
                                  {summary ? (
                                    <Text style={styles.detailChallengeDescription}>
                                      {summary}
                                    </Text>
                                  ) : null}
                                  {todos.length > 0 ? (
                                    <View style={styles.detailTodoPreview}>
                                      {todos.slice(0, 3).map((todo) => (
                                        <View key={todo.id} style={styles.detailTodoPreviewItem}>
                                          <View style={styles.detailTodoBullet} />
                                          <Text style={styles.detailTodoText}>{todo.text}</Text>
                                        </View>
                                      ))}
                                      {todos.length > 3 ? (
                                        <Text style={styles.detailTodoMoreText}>
                                          외 {todos.length - 3}개 TODO
                                        </Text>
                                      ) : null}
                                    </View>
                                  ) : null}
                                </View>
                                <TouchableOpacity
                                  style={[styles.detailButton, styles.detailPrimaryButton]}
                                  onPress={() =>
                                    handleGroupChallengeStart(
                                      selectedItem!.sourceId,
                                      challenge,
                                      todos
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
                            const todoData = extractTodoData(challenge);
                            const parsed = todoData?.parsed ?? null;
                            const todos = parsed?.items ?? [];
                            const challengeTitle = deriveChallengeTitle(
                              challenge,
                              parsed?.name ?? null
                            );
                            const summary = deriveChallengeSummary(
                              challenge,
                              parsed,
                              todoData?.source
                            );
                            const completionMap = todoCompletion[String(challenge.id)] ?? {};
                            const progress = getTodoProgress(challenge.id, todos);
                            const allCompleted = isTodoListComplete(challenge.id, todos);
                            return (
                              <View key={challenge.id} style={styles.detailChallengeItem}>
                                <View style={styles.detailChallengeInfo}>
                                  <Text style={styles.detailChallengeTitle}>{challengeTitle}</Text>
                                  {summary ? (
                                    <Text style={styles.detailChallengeDescription}>
                                      {summary}
                                    </Text>
                                  ) : null}
                                  {todos.length > 0 ? (
                                    <View style={styles.detailTodoSection}>
                                      <View style={styles.detailTodoHeader}>
                                        <Text style={styles.detailTodoProgress}>
                                          {progress.completed}/{progress.total} 완료
                                        </Text>
                                      </View>
                                      {todos.map((todo) => {
                                        const isCompleted = Boolean(completionMap[todo.id]);
                                        return (
                                          <TouchableOpacity
                                            key={todo.id}
                                            style={styles.detailTodoItem}
                                            onPress={() =>
                                              toggleTodoCompletion(challenge.id, todo.id)
                                            }
                                            activeOpacity={0.8}
                                          >
                                            <View
                                              style={[
                                                styles.todoCheckbox,
                                                isCompleted && styles.todoCheckboxCompleted,
                                              ]}
                                            >
                                              {isCompleted ? (
                                                <IconSymbol
                                                  name="checkmark"
                                                  size={14}
                                                  color={theme.colors.white}
                                                />
                                              ) : null}
                                            </View>
                                            <Text
                                              style={[
                                                styles.todoItemText,
                                                isCompleted && styles.todoItemTextCompleted,
                                              ]}
                                            >
                                              {todo.text}
                                            </Text>
                                          </TouchableOpacity>
                                        );
                                      })}
                                      {!allCompleted ? (
                                        <Text style={styles.todoHintText}>
                                          모든 TODO를 완료해야 챌린지를 종료할 수 있어요.
                                        </Text>
                                      ) : null}
                                    </View>
                                  ) : null}
                                </View>
                                <TouchableOpacity
                                  style={[styles.detailButton, styles.detailPrimaryButton]}
                                  onPress={() =>
                                    handleGroupChallengeComplete(
                                      selectedItem!.sourceId,
                                      challenge,
                                      todos
                                    )
                                  }
                                  disabled={
                                    detailActionLoadingId === loadingKey || !allCompleted
                                  }
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
                  ) : null}
                </>
              ) : selectedItem ? (
                <>
                  <View style={styles.detailStatsRow}>
                    <View style={styles.detailStatItem}>
                      <View style={styles.detailStatIcon}>
                        <PersonIcon
                          width={16}
                          height={16}
                          fill={theme.colors.gray[500]}
                        />
                      </View>
                      <Text style={styles.detailStatText}>{selectedItem.participants}</Text>
                    </View>
                    <View style={styles.detailStatItem}>
                      <View style={styles.detailStatIcon}>
                        <HeartIcon
                          width={16}
                          height={16}
                          fill={theme.colors.gray[500]}
                        />
                      </View>
                      <Text style={styles.detailStatText}>{selectedItem.likes}</Text>
                    </View>
                  </View>

                  {selectedItem.isTodoFormat ? (
                    <View style={styles.todoSection}>
                      <View style={styles.todoHeader}>
                        <Text style={styles.todoSectionTitle}>TODO 리스트</Text>
                        {selectedChallengeTodos.length > 0 ? (
                          <Text style={styles.todoProgressText}>
                            {selectedChallengeProgress.completed}/
                            {selectedChallengeProgress.total} 완료
                          </Text>
                        ) : null}
                      </View>
                      {selectedItem.todoDescription ? (
                        <Text style={styles.todoSectionDescription}>
                          {selectedItem.todoDescription}
                        </Text>
                      ) : null}
                      {selectedChallengeTodos.length === 0 ? (
                        <Text style={styles.todoEmptyText}>
                          등록된 TODO가 없습니다.
                        </Text>
                      ) : (
                        selectedChallengeTodos.map((todo) => {
                          const isCompleted = Boolean(
                            selectedChallengeCompletionMap[todo.id]
                          );
                          const isInteractive = selectedItem.isParticipating;
                          return (
                            <TouchableOpacity
                              key={todo.id}
                              style={styles.todoItem}
                              activeOpacity={isInteractive ? 0.8 : 1}
                              onPress={
                                isInteractive
                                  ? () => toggleTodoCompletion(selectedItem.id, todo.id)
                                  : undefined
                              }
                            >
                              <View
                                style={[
                                  styles.todoCheckbox,
                                  isCompleted && styles.todoCheckboxCompleted,
                                ]}
                              >
                                {isCompleted ? (
                                  <IconSymbol
                                    name="checkmark"
                                    size={14}
                                    color={theme.colors.white}
                                  />
                                ) : null}
                              </View>
                              <Text
                                style={[
                                  styles.todoItemText,
                                  isCompleted && styles.todoItemTextCompleted,
                                ]}
                              >
                                {todo.text}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                      {selectedItem.isParticipating && !selectedChallengeTodosCompleted ? (
                        <Text style={styles.todoHintText}>
                          모든 TODO를 완료하면 챌린지를 종료할 수 있어요.
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.detailButton,
                        styles.detailPrimaryButton,
                        selectedItem.isParticipating &&
                          !selectedChallengeTodosCompleted &&
                          styles.detailButtonDisabled,
                      ]}
                      onPress={() => handleActionPress(selectedItem)}
                      disabled={
                        actionLoadingId === selectedItem.id ||
                        (selectedItem.isParticipating && !selectedChallengeTodosCompleted)
                      }
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
  detailCloseButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
    zIndex: 1,
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
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  detailStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  detailStatIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  detailStatText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    minWidth: 28,
    textAlign: "left",
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
  detailButtonDisabled: {
    opacity: 0.6,
  },
  modalTodoSection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
  },
  modalTodoLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  modalTodoInputRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  modalTodoInput: {
    flex: 1,
  },
  modalTodoAddButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  modalTodoAddButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  modalTodoAddButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  modalTodoEmptyText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  modalTodoList: {
    maxHeight: 180,
  },
  modalTodoListContent: {
    gap: theme.spacing.xs,
  },
  modalTodoListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.white,
  },
  modalTodoListItemText: {
    flex: 1,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
  },
  modalTodoRemoveButton: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
  },
  modalTodoRemoveButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "600",
  },
  todoSection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
  },
  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoSectionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  todoProgressText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  todoSectionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  todoEmptyText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  todoCheckboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  todoItemText: {
    flex: 1,
    color: theme.colors.text,
  },
  todoItemTextCompleted: {
    color: theme.colors.gray[500],
    textDecorationLine: "line-through",
  },
  todoHintText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  detailTodoPreview: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  detailTodoPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  detailTodoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  detailTodoText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    flex: 1,
  },
  detailTodoMoreText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs / 2,
  },
  detailTodoSection: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  detailTodoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailTodoProgress: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    fontWeight: "600",
  },
  detailTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});
