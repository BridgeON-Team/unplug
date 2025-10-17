// API 기본 설정 및 공통 함수들
const BASE_URL = "http://localhost:8080";

// Mock 모드 설정 (백엔드가 없을 때 true로 설정)
// const USE_MOCK_DATA = false;

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Mock 데이터 import

// 사용자 정보 타입
export interface UserInfo {
  userId: number;
  username: string;
  name: string;
  nickname: string;
  profileImgUrl: string;
}

// 설문 결과 타입
export interface SurveyResult {
  username: string;
  totalScore: number;
  type: string;
  description: string;
}

// 설문 문항 타입
export interface SurveyQuestion {
  questionId: number;
  question: string;
}

// 설문 요청 타입
export interface SurveyRequest {
  username: string;
  answers: number[];
}

// 챗봇 관련 타입들
export interface ChatThreadDto {
  username: string;
  title: string;
}

export interface ChatThreadResponseDto {
  threadId: number;
  title: string;
  username: string;
  createdDate: string;
  updatedDate: string;
}

export interface ChatMessageDto {
  chatMessageId?: number;
  threadId: number;
  username: string;
  sender: "USER" | "BOT";
  message: string;
}

// API 호출을 위한 공통 함수
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// 인증 헤더를 포함한 API 호출
const apiCallWithAuth = async <T>(
  endpoint: string,
  username: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "X-Auth-Username": username,
    },
  });
};

// 마이페이지 관련 API 함수들
export const myPageApi = {
  // 사용자 정보 조회
  getUserInfo: async (username: string): Promise<ApiResponse<UserInfo>> => {
    return apiCallWithAuth<UserInfo>("/user/info", username, {
      method: "GET",
    });
  },

  // 설문 결과 조회
  getSurveyResult: async (
    username: string
  ): Promise<ApiResponse<SurveyResult>> => {
    return apiCallWithAuth<SurveyResult>("/user/survey/result", username, {
      method: "GET",
    });
  },

  // 회원 탈퇴
  deleteUser: async (username: string): Promise<ApiResponse<object>> => {
    return apiCallWithAuth<object>("/user/withdraw", username, {
      method: "DELETE",
    });
  },
};

// 설문 관련 API 함수들
export const surveyApi = {
  // 설문 문항 조회
  getSurveyQuestions: async (): Promise<SurveyQuestion[]> => {
    const response = await apiCall<SurveyQuestion[]>("/user/survey/questions", {
      method: "GET",
    });
    return response.data;
  },

  // 설문 제출
  submitSurvey: async (
    surveyData: SurveyRequest
  ): Promise<ApiResponse<SurveyResult>> => {
    return apiCall<SurveyResult>("/user/survey/submit", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  },
};

// 인증 관련 API 함수들
export const authApi = {
  // 로그인
  login: async (
    username: string,
    password: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiCall<{ accessToken: string; refreshToken: string }>(
      "/user/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
  },

  // 회원가입
  signup: async (userData: {
    username: string;
    name: string;
    password: string;
    nickname: string;
  }): Promise<ApiResponse<UserInfo>> => {
    return apiCall<UserInfo>("/user/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // 토큰 갱신
  refreshToken: async (
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiCall<{ accessToken: string; refreshToken: string }>(
      "/user/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    );
  },

  // 로그아웃
  logout: async (refreshToken: string): Promise<ApiResponse<string>> => {
    return apiCall<string>("/user/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  // 아이디 중복 확인
  checkUsername: async (username: string): Promise<ApiResponse<string>> => {
    return apiCall<string>(`/user/check/username?username=${username}`, {
      method: "GET",
    });
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname: string): Promise<ApiResponse<string>> => {
    return apiCall<string>(`/user/check/nickname?nickname=${nickname}`, {
      method: "GET",
    });
  },
};

// 챗봇 관련 API 함수들
export const chatbotApi = {
  // 채팅 스레드 생성
  createThread: async (
    username: string,
    threadData: ChatThreadDto
  ): Promise<ChatThreadResponseDto> => {
    const response = await apiCallWithAuth<ChatThreadResponseDto>(
      "/chatbot/threads",
      username,
      {
        method: "POST",
        body: JSON.stringify(threadData),
      }
    );
    return response.data;
  },

  // 메시지 전송
  sendMessage: async (
    username: string,
    messageData: ChatMessageDto
  ): Promise<ChatMessageDto> => {
    const response = await apiCallWithAuth<ChatMessageDto>(
      "/chatbot/messages",
      username,
      {
        method: "POST",
        body: JSON.stringify(messageData),
      }
    );
    return response.data;
  },

  // 단일 스레드 조회
  getThreadById: async (
    username: string,
    threadId: number
  ): Promise<ChatThreadResponseDto> => {
    const response = await apiCallWithAuth<ChatThreadResponseDto>(
      `/chatbot/threads/${threadId}`,
      username,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  // 스레드 삭제
  deleteThread: async (username: string, threadId: number): Promise<void> => {
    await apiCallWithAuth<void>(`/chatbot/threads/${threadId}`, username, {
      method: "DELETE",
    });
  },

  // 내 스레드 목록 조회
  getMyThreads: async (username: string): Promise<ChatThreadResponseDto[]> => {
    const response = await apiCallWithAuth<ChatThreadResponseDto[]>(
      "/chatbot/threads/me",
      username,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  // 스레드별 메시지 조회
  getMessagesByThread: async (
    username: string,
    threadId: number
  ): Promise<ChatMessageDto[]> => {
    const response = await apiCallWithAuth<ChatMessageDto[]>(
      `/chatbot/messages/thread/${threadId}`,
      username,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  // 메시지 삭제
  deleteMessage: async (username: string, messageId: number): Promise<void> => {
    await apiCallWithAuth<void>(`/chatbot/messages/${messageId}`, username, {
      method: "DELETE",
    });
  },
};
