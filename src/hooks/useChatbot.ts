import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import {
  chatbotApi,
  ChatMessageDto,
  ChatMessageDto as ChatMessageInput,
  ChatThreadDto,
  ChatThreadResponseDto,
} from "../services/api";

interface ChatbotState {
  threads: ChatThreadResponseDto[];
  currentThread: ChatThreadResponseDto | null;
  messages: ChatMessageDto[];
  isLoading: boolean;
  error: string | null;
}

export const useChatbot = () => {
  const { username } = useAuthContext();
  const [state, setState] = useState<ChatbotState>({
    threads: [],
    currentThread: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  // 내 스레드 목록 조회
  const fetchMyThreads = useCallback(async () => {
    if (!username) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const threads = await chatbotApi.getMyThreads(username);
      setState((prev) => ({
        ...prev,
        threads,
        isLoading: false,
      }));
    } catch (error) {
      console.error("스레드 목록 조회 오류:", error);
      setState((prev) => ({
        ...prev,
        error: "스레드 목록을 불러오는데 실패했습니다.",
        isLoading: false,
      }));
    }
  }, [username]);

  // 새 스레드 생성
  const createThread = async (title: string) => {
    if (!username)
      return { success: false, message: "사용자 정보가 없습니다." };

    try {
      const threadData: ChatThreadDto = {
        username,
        title,
      };

      const newThread = await chatbotApi.createThread(username, threadData);

      setState((prev) => ({
        ...prev,
        threads: [newThread, ...prev.threads],
        currentThread: newThread,
      }));

      return {
        success: true,
        message: "스레드가 생성되었습니다.",
        thread: newThread,
      };
    } catch (error) {
      console.error("스레드 생성 오류:", error);
      return { success: false, message: "스레드 생성에 실패했습니다." };
    }
  };

  // 스레드 선택
  const selectThread = async (threadId: number) => {
    if (!username) return;

    try {
      const thread = await chatbotApi.getThreadById(username, threadId);
      const messages = await chatbotApi.getMessagesByThread(username, threadId);

      setState((prev) => ({
        ...prev,
        currentThread: thread,
        messages,
      }));
    } catch (error) {
      console.error("스레드 조회 오류:", error);
      setState((prev) => ({
        ...prev,
        error: "스레드를 불러오는데 실패했습니다.",
      }));
    }
  };

  // 메시지 전송
  const sendMessage = async (
    message: string,
    options?: { threadId?: number }
  ) => {
    if (!username) {
      return { success: false, message: "사용자 정보가 없습니다." };
    }

    const targetThreadId =
      options?.threadId ?? state.currentThread?.threadId ?? null;

    if (!targetThreadId) {
      return { success: false, message: "스레드가 선택되지 않았습니다." };
    }

    try {
      const messageData: ChatMessageInput = {
        threadId: targetThreadId,
        username,
        sender: "USER",
        message,
      };

      const sentMessage = await chatbotApi.sendMessage(username, messageData);

      setState((prev) => ({
        ...prev,
        messages:
          prev.currentThread?.threadId === targetThreadId
            ? [...prev.messages, sentMessage]
            : prev.messages,
      }));

      return { success: true, message: "메시지가 전송되었습니다." };
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      return { success: false, message: "메시지 전송에 실패했습니다." };
    }
  };

  const refreshMessages = useCallback(
    async (threadId?: number) => {
      if (!username) {
        return;
      }

      const targetThreadId = threadId ?? state.currentThread?.threadId;
      if (!targetThreadId) {
        return;
      }

      try {
        const messages = await chatbotApi.getMessagesByThread(
          username,
          targetThreadId
        );

        setState((prev) => {
          if (prev.currentThread?.threadId !== targetThreadId) {
            return prev;
          }

          return {
            ...prev,
            messages,
          };
        });
      } catch (error) {
        console.error("메시지 목록 새로고침 오류:", error);
      }
    },
    [state.currentThread?.threadId, username]
  );

  // 스레드 삭제
  const deleteThread = async (threadId: number) => {
    if (!username)
      return { success: false, message: "사용자 정보가 없습니다." };

    try {
      await chatbotApi.deleteThread(username, threadId);

      setState((prev) => ({
        ...prev,
        threads: prev.threads.filter((thread) => thread.threadId !== threadId),
        currentThread:
          prev.currentThread?.threadId === threadId ? null : prev.currentThread,
        messages:
          prev.currentThread?.threadId === threadId ? [] : prev.messages,
      }));

      return { success: true, message: "스레드가 삭제되었습니다." };
    } catch (error) {
      console.error("스레드 삭제 오류:", error);
      return { success: false, message: "스레드 삭제에 실패했습니다." };
    }
  };

  // 메시지 삭제
  const deleteMessage = async (messageId: number) => {
    if (!username)
      return { success: false, message: "사용자 정보가 없습니다." };

    try {
      await chatbotApi.deleteMessage(username, messageId);

      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter(
          (message) => message.chatMessageId !== messageId
        ),
      }));

      return { success: true, message: "메시지가 삭제되었습니다." };
    } catch (error) {
      console.error("메시지 삭제 오류:", error);
      return { success: false, message: "메시지 삭제에 실패했습니다." };
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (username) {
      fetchMyThreads();
    }
  }, [username, fetchMyThreads]);

  return {
    ...state,
    fetchMyThreads,
    createThread,
    selectThread,
    sendMessage,
    deleteThread,
    deleteMessage,
    refreshMessages,
  };
};
