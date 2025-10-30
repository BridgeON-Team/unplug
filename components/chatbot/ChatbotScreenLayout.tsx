import { IconSymbol } from "@/components/ui/IconSymbol";
import { useChatbot } from "@/src/hooks/useChatbot";
import { useRefreshControl } from "@/src/hooks/useRefreshControl";
import { theme } from "@/src/styles/theme";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
  Dimensions,
  Easing,
  Keyboard,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 280);
const MESSAGE_INPUT_BASE_HEIGHT = 72;

export default function ChatbotScreenLayout() {
  const {
    threads,
    currentThread,
    messages,
    isLoading,
    error,
    createThread,
    selectThread,
    sendMessage,
    deleteThread,
    fetchMyThreads,
    refreshMessages,
  } = useChatbot();

  const [message, setMessage] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const drawerAnim = useRef(new RNAnimated.Value(-DRAWER_WIDTH)).current;
  const newThreadInputRef = useRef<TextInput | null>(null);
  const insets = useSafeAreaInsets();
  const keyboardVerticalOffset = useMemo(() => {
    const estimatedHeaderHeight = 56; // top bar
    const pageHeadingHeight = 64;
    return insets.top + estimatedHeaderHeight + pageHeadingHeight;
  }, [insets.top]);

  const handleMessagesRefresh = useCallback(async () => {
    if (currentThread) {
      await refreshMessages(currentThread.threadId);
    } else {
      await fetchMyThreads();
    }
  }, [currentThread, fetchMyThreads, refreshMessages]);

  const { refreshControlProps: messagesRefreshProps } =
    useRefreshControl(handleMessagesRefresh);

  useEffect(() => {
    if (!currentThread?.threadId) {
      return;
    }

    let isMounted = true;

    const refresh = () => {
      if (isMounted) {
        refreshMessages(currentThread.threadId).catch((error) => {
          console.error("메시지 자동 새로고침 오류:", error);
        });
      }
    };

    refresh();

    const intervalId = setInterval(refresh, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentThread?.threadId, refreshMessages]);

  const toggleDrawer = () => {
    const next = !isDrawerOpen;
    setDrawerOpen(next);
    RNAnimated.timing(drawerAnim, {
      toValue: next ? 0 : -DRAWER_WIDTH,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const openCreateModal = () => {
    setNewThreadTitle("");
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
    setNewThreadTitle("");
    setCreating(false);
  };

  const handleCreateThread = async () => {
    const trimmed = newThreadTitle.trim();
    if (!trimmed) {
      Alert.alert("오류", "스레드 제목을 입력해주세요.");
      return;
    }

    setCreating(true);
    const result = await createThread(trimmed);
    setCreating(false);

    if (!result.success) {
      Alert.alert("오류", result.message);
      return;
    }

    Alert.alert("성공", result.message);
    closeCreateModal();
    if (isDrawerOpen) {
      toggleDrawer();
    }
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert("오류", "메시지를 입력해주세요.");
      return;
    }

    let activeThreadId = currentThread?.threadId;

    if (!activeThreadId) {
      const titleCandidate = trimmed.split("\n")[0].slice(0, 30).trim();
      const threadTitle = titleCandidate || "새로운 대화";

      const createResult = await createThread(threadTitle);
      if (!createResult.success || !createResult.thread) {
        Alert.alert("오류", createResult.message);
        return;
      }

      activeThreadId = createResult.thread.threadId;
      await selectThread(activeThreadId);
    }

    const result = await sendMessage(trimmed, { threadId: activeThreadId });
    if (result.success) {
      setMessage("");
      await refreshMessages(activeThreadId);
    } else {
      Alert.alert("오류", result.message);
    }
  };

  const handleQuickCreatePress = () => {
    if (isDrawerOpen) {
      toggleDrawer();
    }
    openCreateModal();
  };

  useEffect(() => {
    if (isCreateModalVisible) {
      const focusTimer = setTimeout(() => {
        newThreadInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(focusTimer);
    }
  }, [isCreateModalVisible]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  const handleDeleteThread = async (threadId: number) => {
    Alert.alert("스레드 삭제", "정말로 이 스레드를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          const result = await deleteThread(threadId);
          if (result.success) {
            Alert.alert("성공", result.message);
          } else {
            Alert.alert("오류", result.message);
          }
        },
      },
    ]);
  };

  const renderThreadList = () => (
    <View style={styles.threadListContainer}>
      <View style={styles.threadListHeader}>
        <TouchableOpacity
          style={styles.threadListToggle}
          onPress={toggleDrawer}
          activeOpacity={0.8}
        >
          <IconSymbol name="chevron.left" color={theme.colors.text} size={20} />
        </TouchableOpacity>
        <Text style={styles.threadListTitle}>스레드</Text>
        <TouchableOpacity
          style={styles.newThreadButton}
          onPress={openCreateModal}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus.circle" color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.threadList}
        contentContainerStyle={threads.length ? undefined : styles.threadListEmpty}
      >
        {threads.map((thread) => (
          <TouchableOpacity
            key={thread.threadId}
            style={[
              styles.threadItem,
              currentThread?.threadId === thread.threadId && styles.activeThreadItem,
            ]}
            onPress={() => {
              selectThread(thread.threadId);
              if (isDrawerOpen) {
                toggleDrawer();
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.threadTitleWrap}>
              <Text style={styles.threadTitle} numberOfLines={1}>
                {thread.title}
              </Text>
              <TouchableOpacity
                style={styles.deleteThreadButton}
                onPress={() => handleDeleteThread(thread.threadId)}
              >
                <Text style={styles.deleteThreadButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.threadDate}>
              {new Date(thread.updatedDate).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
        {threads.length === 0 && (
          <Text style={styles.emptyThreadCopy}>등록된 스레드가 없습니다.</Text>
        )}
      </ScrollView>
    </View>
  );

  const Drawer = () => (
    <RNAnimated.View
      style={[
        styles.drawer,
        {
          transform: [{ translateX: drawerAnim }],
        },
      ]}
    >
      {renderThreadList()}
    </RNAnimated.View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={styles.container}>
          <Drawer />

          {isDrawerOpen && (
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleDrawer} />
          )}

        <View style={styles.contentContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={toggleDrawer}
              style={styles.headerButton}
              activeOpacity={0.8}
            >
              <IconSymbol
                name="sidebar.left"
                color={isDrawerOpen ? theme.colors.primary : theme.colors.text}
                size={24}
              />
            </TouchableOpacity>

            <Text style={styles.chatHeaderTitle} numberOfLines={1}>
              {currentThread ? currentThread.title : "챗봇"}
            </Text>

            <TouchableOpacity
              onPress={handleQuickCreatePress}
              style={styles.headerButtonRight}
              activeOpacity={0.8}
            >
              <IconSymbol name="plus.circle" color={theme.colors.primary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.chatBody}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
              </View>
            ) : currentThread ? (
              <ScrollView
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl {...messagesRefreshProps} />}
              >
                {messages.map((msg, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageItem,
                      msg.sender === "USER" ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === "USER" && styles.userMessageText,
                      ]}
                    >
                      {msg.message}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noThreadContainer}>
                <Text style={styles.noThreadText}>
                  첫 메시지를 입력하면 새로운 스레드가 생성됩니다.
                </Text>
              </View>
            )}

            <View
              style={[
                styles.messageInputContainer,
                { paddingBottom: Math.max(theme.spacing.xs, insets.bottom) },
              ]}
            >
              {isKeyboardVisible ? (
                <TouchableOpacity
                  style={styles.dismissKeyboardButton}
                  activeOpacity={0.8}
                  onPress={() => Keyboard.dismiss()}
                >
                  <IconSymbol
                    name="keyboard.chevron.compact.down"
                    color={theme.colors.gray[500]}
                    size={20}
                  />
                </TouchableOpacity>
              ) : null}

              <TextInput
                style={styles.messageInput}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={theme.colors.gray[500]}
                value={message}
                onChangeText={setMessage}
                textAlign="left"
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                activeOpacity={0.85}
              >
                <Text style={styles.sendButtonText}>전송</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isCreateModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 스레드 만들기</Text>
            <Text style={styles.modalDescription}>
              이름을 입력하면 바로 대화를 시작할 수 있어요.
            </Text>
            <TextInput
              ref={newThreadInputRef}
              style={styles.modalInput}
              placeholder="스레드 제목을 입력하세요"
              placeholderTextColor={theme.colors.gray[500]}
              value={newThreadTitle}
              onChangeText={setNewThreadTitle}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleCreateThread}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeCreateModal}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonSecondaryText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  (!newThreadTitle.trim() || isCreating) && styles.modalButtonDisabled,
                ]}
                onPress={handleCreateThread}
                disabled={!newThreadTitle.trim() || isCreating}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {isCreating ? "생성 중..." : "생성"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.colors.white,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.gray[200],
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  headerButtonRight: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  chatHeaderTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  chatBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: theme.spacing.xl + MESSAGE_INPUT_BASE_HEIGHT,
  },
  messageItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.gray[100],
  },
  messageText: {
    color: theme.colors.text,
  },
  userMessageText: {
    color: theme.colors.white,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.gray[200],
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    minHeight: MESSAGE_INPUT_BASE_HEIGHT - 16,
    gap: theme.spacing.xs,
  },
  messageInput: {
    flex: 1,
    minHeight: Platform.OS === "ios" ? 36 : 40,
    maxHeight: 100,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.text,
    textAlign: "left",
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minHeight: Platform.OS === "ios" ? 36 : 40,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissKeyboardButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
  },
  sendButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
  noThreadContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noThreadText: {
    color: theme.colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.white,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.gray[200],
    zIndex: 10,
    elevation: 6,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  threadListContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: theme.spacing.lg,
  },
  threadListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  threadListToggle: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
    width: theme.spacing.lg,
    height: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  threadListTitle: {
    flex: 1,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
    textAlign: "center",
  },
  newThreadButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  threadList: {
    flex: 1,
  },
  threadListEmpty: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  threadItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.gray[100],
  },
  activeThreadItem: {
    backgroundColor: "rgba(51, 95, 238, 0.12)",
  },
  threadTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  threadTitle: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  deleteThreadButton: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "rgba(195, 35, 35, 0.12)",
    marginLeft: theme.spacing.xs,
  },
  deleteThreadButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "600",
  },
  threadDate: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  emptyThreadCopy: {
    marginTop: theme.spacing.md,
    color: theme.colors.gray[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
  },
  modalDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    minWidth: 96,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonSecondary: {
    backgroundColor: theme.colors.gray[100],
    marginRight: theme.spacing.sm,
  },
  modalButtonSecondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});
