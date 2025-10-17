import { useChatbot } from "@/src/hooks/useChatbot";
import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatbotInterface() {
  const [message, setMessage] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);

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
  } = useChatbot();

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim()) {
      Alert.alert("오류", "스레드 제목을 입력해주세요.");
      return;
    }

    const result = await createThread(newThreadTitle.trim());
    if (result.success) {
      setNewThreadTitle("");
      setShowNewThreadForm(false);
      Alert.alert("성공", result.message);
    } else {
      Alert.alert("오류", result.message);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("오류", "메시지를 입력해주세요.");
      return;
    }

    const result = await sendMessage(message.trim());
    if (result.success) {
      setMessage("");
    } else {
      Alert.alert("오류", result.message);
    }
  };

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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 스레드 목록 */}
      <View style={styles.threadListContainer}>
        <View style={styles.threadListHeader}>
          <Text style={styles.threadListTitle}>채팅 스레드</Text>
          <TouchableOpacity
            style={styles.newThreadButton}
            onPress={() => setShowNewThreadForm(true)}
          >
            <Text style={styles.newThreadButtonText}>+ 새 스레드</Text>
          </TouchableOpacity>
        </View>

        {showNewThreadForm && (
          <View style={styles.newThreadForm}>
            <TextInput
              style={styles.newThreadInput}
              placeholder="스레드 제목을 입력하세요"
              value={newThreadTitle}
              onChangeText={setNewThreadTitle}
            />
            <View style={styles.newThreadButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewThreadForm(false);
                  setNewThreadTitle("");
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateThread}
              >
                <Text style={styles.createButtonText}>생성</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView style={styles.threadList}>
          {threads.map((thread) => (
            <TouchableOpacity
              key={thread.threadId}
              style={[
                styles.threadItem,
                currentThread?.threadId === thread.threadId &&
                  styles.activeThreadItem,
              ]}
              onPress={() => selectThread(thread.threadId)}
            >
              <Text style={styles.threadTitle}>{thread.title}</Text>
              <Text style={styles.threadDate}>
                {new Date(thread.updatedDate).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.deleteThreadButton}
                onPress={() => handleDeleteThread(thread.threadId)}
              >
                <Text style={styles.deleteThreadButtonText}>삭제</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 메시지 영역 */}
      <View style={styles.messageContainer}>
        {currentThread ? (
          <>
            <Text style={styles.currentThreadTitle}>{currentThread.title}</Text>
            <ScrollView style={styles.messagesList}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageItem,
                    msg.sender === "USER"
                      ? styles.userMessage
                      : styles.botMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.message}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="메시지를 입력하세요..."
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Text style={styles.sendButtonText}>전송</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noThreadContainer}>
            <Text style={styles.noThreadText}>
              스레드를 선택하거나 새로 생성해주세요.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: "center",
  },
  threadListContainer: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  threadListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  threadListTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  newThreadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  newThreadButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "500",
  },
  newThreadForm: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  newThreadInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
  },
  newThreadButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cancelButtonText: {
    color: theme.colors.gray[500],
    fontSize: theme.typography.body.fontSize,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "500",
  },
  threadList: {
    flex: 1,
  },
  threadItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
    position: "relative",
  },
  activeThreadItem: {
    backgroundColor: theme.colors.primary + "20",
  },
  threadTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  threadDate: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  deleteThreadButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  deleteThreadButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  currentThreadTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  messagesList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  messageItem: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: theme.colors.white,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  messageText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  messageInputContainer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
  },
  sendButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "500",
  },
  noThreadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noThreadText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
});
