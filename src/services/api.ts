import { AuthUtils } from "@/utils/auth";
import { API_BASE_URL } from "../../constants/env";

// API 기본 설정 및 공통 함수들
const BASE_URL = API_BASE_URL.replace(/\/$/, "");

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

export interface GroupDTO {
  id: number;
  groupName: string;
  groupIntroduction?: string | null;
  createdTime?: string;
  imageUrl?: string | null;
  likeCount?: number;
  participantCount?: number;
}

export interface ChallengeDTO {
  id: number;
  challengeName: string;
  challengeIntroduction?: string | null;
  createdTime?: string;
  imageUrl?: string | null;
  likeCount?: number;
  participantCount?: number;
}

// API 호출을 위한 공통 함수
interface AuthenticatedRequestInit extends RequestInit {
  skipAuth?: boolean;
  retry?: boolean;
}

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await AuthUtils.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${BASE_URL}/user/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Refresh token request failed: ${response.status}`);
    }

    const data: ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }> = await response.json();

    const accessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken ?? refreshToken;

    if (data.success && accessToken) {
      await AuthUtils.saveTokens({
        accessToken,
        refreshToken: newRefreshToken,
      });
      return true;
    }

    console.warn("Refresh token response was not successful:", data.message);
    await AuthUtils.removeToken();
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    await AuthUtils.removeToken();
    return false;
  }
};

let refreshPromise: Promise<boolean> | null = null;

const attemptTokenRefresh = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken();
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

interface ApiRequestError extends Error {
  status?: number;
  response?: Response;
}

const FALLBACK_DEFAULT_MESSAGE = "서버 오류로 요청을 처리하지 못했습니다.";

const createFallbackResponse = <T>(
  endpoint: string,
  method?: string
): ApiResponse<T> => {
  const normalizedEndpoint = endpoint.toLowerCase();
  const normalizedMethod = method?.toUpperCase() ?? "GET";

  if (normalizedEndpoint.includes("/user/check/username")) {
    return {
      success: false,
      message: "이미 사용 중인 아이디입니다.",
      data: "" as unknown as T,
    };
  }

  if (normalizedEndpoint.includes("/user/check/nickname")) {
    return {
      success: false,
      message: "이미 사용 중인 닉네임입니다.",
      data: "" as unknown as T,
    };
  }

  if (normalizedMethod === "GET") {
    if (/\/group\/(groups|participating)/.test(normalizedEndpoint)) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (/\/challenge\/(challenges|participating)/.test(normalizedEndpoint)) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (/\/chatbot\/threads\/me/.test(normalizedEndpoint)) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (/\/chatbot\/messages\/(?:thread\/)?\d+$/.test(normalizedEndpoint)) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (/\/chatbot\/threads\/\d+$/.test(normalizedEndpoint)) {
      return {
        success: false,
        message: FALLBACK_DEFAULT_MESSAGE,
        data: null as unknown as T,
      };
    }

    if (
      /\/api\/posts\/(recent|popular)/.test(normalizedEndpoint) ||
      normalizedEndpoint.includes("/api/posts/search") ||
      normalizedEndpoint.includes("/api/posts/category") ||
      normalizedEndpoint.includes("/api/users/recommended")
    ) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (normalizedEndpoint.includes("/api/home/stats")) {
      return {
        success: true,
        message: "",
        data: {
          totalPosts: 0,
          totalUsers: 0,
          totalLikes: 0,
          totalComments: 0,
        } as unknown as T,
      };
    }

    if (normalizedEndpoint.startsWith("/api/home")) {
      return {
        success: true,
        message: "",
        data: {
          featuredPosts: [],
          recentPosts: [],
          popularUsers: [],
          stats: {
            totalPosts: 0,
            totalUsers: 0,
            totalLikes: 0,
            totalComments: 0,
          },
          categories: [],
        } as unknown as T,
      };
    }

    if (normalizedEndpoint.includes("/user/survey/questions")) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }

    if (normalizedEndpoint.includes("/user/survey/result")) {
      return {
        success: false,
        message: "설문 결과가 없습니다.",
        data: null as unknown as T,
      };
    }

    if (normalizedEndpoint.includes("/user/info")) {
      return {
        success: false,
        message: "사용자 정보가 없습니다.",
        data: null as unknown as T,
      };
    }

    if (normalizedEndpoint.includes("/chatbot/threads")) {
      return {
        success: true,
        message: "",
        data: [] as unknown as T,
      };
    }
  }

  if (
    normalizedEndpoint.includes("/group/") ||
    normalizedEndpoint.includes("/challenge/") ||
    normalizedEndpoint.includes("/chatbot/")
  ) {
    return {
      success: false,
      message: FALLBACK_DEFAULT_MESSAGE,
      data: null as unknown as T,
    };
  }

  return {
    success: false,
    message: FALLBACK_DEFAULT_MESSAGE,
    data: null as unknown as T,
  };
};

export const apiCall = async <T>(
  endpoint: string,
  options: AuthenticatedRequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${BASE_URL}${endpoint}`;

  const {
    skipAuth = false,
    retry = true,
    headers: optionHeaders,
    method: inputMethod,
    ...rest
  } = options;

  const method = (inputMethod ?? "GET").toString().toUpperCase();

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (optionHeaders) {
    const merged = new Headers(optionHeaders as HeadersInit);
    merged.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (!skipAuth) {
    const accessToken = await AuthUtils.getToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const config: RequestInit = {
    ...rest,
    method,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !skipAuth && retry) {
      const refreshed = await attemptTokenRefresh();

      if (refreshed) {
        return apiCall<T>(endpoint, {
          ...options,
          retry: false,
        });
      }
    }

    if (!response.ok) {
      if (response.status === 500) {
        console.warn(
          `API 500 encountered at ${endpoint}. Returning fallback response.`
        );
        return createFallbackResponse<T>(endpoint, method);
      }

      const error: ApiRequestError = new Error(
        `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.response = response;
      throw error;
    }

    const rawBody = await response.text();

    if (!rawBody) {
      return {} as ApiResponse<T>;
    }

    try {
      return JSON.parse(rawBody);
    } catch (parseError) {
      console.error("API response parse error:", parseError);
      return {} as ApiResponse<T>;
    }
  } catch (error) {
    const status = (error as ApiRequestError)?.status;
    if (status === 500) {
      console.warn(
        `API call throw with 500 at ${endpoint}. Returning fallback response.`
      );
      return createFallbackResponse<T>(endpoint, method);
    }

    console.error("API call failed:", error);
    throw error;
  }
};

const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  return (
    typeof value === "object" && value !== null && "data" in value && "success" in value
  );
};

const unwrapApiResponse = <T>(value: ApiResponse<T> | T): T => {
  if (isApiResponse<T>(value)) {
    return value.data;
  }

  return value as T;
};

const unwrapArrayResponse = <T>(value: ApiResponse<T[]> | T[]): T[] => {
  const data = unwrapApiResponse<T[]>(value);

  if (!Array.isArray(data)) {
    throw new Error("Unexpected API response format");
  }

  return data;
};

const buildPaginationQuery = (lastId?: number): string => {
  if (typeof lastId === "number") {
    return `?lastId=${lastId}`;
  }

  return "";
};

// 마이페이지 관련 API 함수들
export const myPageApi = {
  // 사용자 정보 조회
  getUserInfo: async (): Promise<ApiResponse<UserInfo>> => {
    return apiCall<UserInfo>("/user/info", {
      method: "GET",
    });
  },

  // 설문 결과 조회
  getSurveyResult: async (): Promise<ApiResponse<SurveyResult>> => {
    return apiCall<SurveyResult>("/user/survey/result", {
      method: "GET",
    });
  },

  // 회원 탈퇴
  deleteUser: async (): Promise<ApiResponse<object>> => {
    return apiCall<object>("/user/withdraw", {
      method: "DELETE",
    });
  },
};

// 설문 관련 API 함수들
export const surveyApi = {
  // 설문 문항 조회
  getSurveyQuestions: async (): Promise<SurveyQuestion[]> => {
    const response = await apiCall<
      SurveyQuestion[] | ApiResponse<SurveyQuestion[]>
    >("/user/survey/questions", {
      method: "GET",
      retry: false,
    });

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    throw new Error("Unexpected survey questions response format");
  },

  // 설문 제출
  submitSurvey: async (
    surveyData: SurveyRequest
  ): Promise<ApiResponse<SurveyResult>> => {
    const response = await apiCall<SurveyResult | ApiResponse<SurveyResult>>(
      "/user/survey/submit",
      {
        method: "POST",
        body: JSON.stringify(surveyData),
      }
    );

    if (
      typeof response === "object" &&
      response !== null &&
      "success" in response &&
      "data" in response
    ) {
      return response as ApiResponse<SurveyResult>;
    }

    return {
      success: true,
      message: "",
      data: response as SurveyResult,
    };
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
        skipAuth: true,
        retry: false,
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
      skipAuth: true,
      retry: false,
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
        skipAuth: true,
        retry: false,
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

// 모임(그룹) 관련 API 함수들
export const groupApi = {
  getAvailableGroups: async (lastId?: number): Promise<GroupDTO[]> => {
    const response = await apiCall<GroupDTO[] | ApiResponse<GroupDTO[]>>(
      `/group/groups${buildPaginationQuery(lastId)}`,
      {
        method: "GET",
      }
    );

    return unwrapArrayResponse(response);
  },

  getParticipatingGroups: async (lastId?: number): Promise<GroupDTO[]> => {
    const response = await apiCall<GroupDTO[] | ApiResponse<GroupDTO[]>>(
      `/group/participating${buildPaginationQuery(lastId)}`,
      {
        method: "GET",
      }
    );

    return unwrapArrayResponse(response);
  },

  likeGroup: async (groupId: number): Promise<void> => {
    const response = await apiCall<void>(`/group/like`, {
      method: "POST",
      body: JSON.stringify({ groupId }),
    });

    if (isApiResponse(response) && !response.success) {
      throw new Error(response.message || "모임 좋아요 처리에 실패했습니다.");
    }
  },

  joinGroup: async (groupId: number): Promise<void> => {
    const response = await apiCall<void>(`/group/join`, {
      method: "POST",
      body: JSON.stringify({ groupId }),
    });

    if (isApiResponse(response) && !response.success) {
      throw new Error(response.message || "모임 참여에 실패했습니다.");
    }
  },
};

// 챌린지 관련 API 함수들
export const challengeApi = {
  getAvailableChallenges: async (
    lastId?: number
  ): Promise<ChallengeDTO[]> => {
    const response = await apiCall<
      ChallengeDTO[] | ApiResponse<ChallengeDTO[]>
    >(`/challenge/challenges${buildPaginationQuery(lastId)}`, {
      method: "GET",
    });

    return unwrapArrayResponse(response);
  },

  getParticipatingChallenges: async (
    lastId?: number
  ): Promise<ChallengeDTO[]> => {
    const response = await apiCall<
      ChallengeDTO[] | ApiResponse<ChallengeDTO[]>
    >(`/challenge/participating${buildPaginationQuery(lastId)}`, {
      method: "GET",
    });

    return unwrapArrayResponse(response);
  },

  likeChallenge: async (challengeId: number): Promise<void> => {
    const response = await apiCall<void>(`/challenge/like`, {
      method: "POST",
      body: JSON.stringify({ challengeId }),
    });

    if (isApiResponse(response) && !response.success) {
      throw new Error(response.message || "챌린지 좋아요 처리에 실패했습니다.");
    }
  },

  startChallenge: async (challengeId: number): Promise<void> => {
    const response = await apiCall<void>(`/challenge/start`, {
      method: "POST",
      body: JSON.stringify({ challengeId }),
    });

    if (isApiResponse(response) && !response.success) {
      throw new Error(response.message || "챌린지 시작에 실패했습니다.");
    }
  },
};

// 홈 화면 관련 타입 정의
export interface HomePost {
  postId: number;
  title: string;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  category: string;
  tags: string[];
  isLiked: boolean;
}

export interface HomeUser {
  userId: number;
  username: string;
  name: string;
  nickname: string;
  profileImgUrl: string;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export interface HomeStats {
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
}

export interface HomeData {
  featuredPosts: HomePost[];
  recentPosts: HomePost[];
  popularUsers: HomeUser[];
  stats: HomeStats;
  categories: string[];
}

// Mock 데이터
const mockHomeData: HomeData = {
  featuredPosts: [
    {
      postId: 1,
      title: "React Native 개발 팁",
      content:
        "React Native로 앱을 개발할 때 유용한 팁들을 공유합니다. 성능 최적화부터 디버깅까지 다양한 내용을 다룹니다.",
      author: "김개발",
      authorId: 1,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      likeCount: 42,
      commentCount: 8,
      category: "개발",
      tags: ["React Native", "모바일", "개발"],
      isLiked: false,
    },
    {
      postId: 2,
      title: "TypeScript 활용법",
      content:
        "TypeScript를 활용한 안전한 코드 작성 방법에 대해 알아보겠습니다. 타입 안전성과 개발 생산성을 높이는 방법들을 소개합니다.",
      author: "박타입",
      authorId: 2,
      createdAt: "2024-01-14T15:20:00Z",
      updatedAt: "2024-01-14T15:20:00Z",
      likeCount: 38,
      commentCount: 12,
      category: "개발",
      tags: ["TypeScript", "JavaScript", "타입"],
      isLiked: true,
    },
  ],
  recentPosts: [
    {
      postId: 3,
      title: "최신 웹 기술 트렌드",
      content:
        "2024년 웹 개발 트렌드를 정리해봤습니다. 새로운 프레임워크와 도구들에 대해 알아보세요.",
      author: "이웹",
      authorId: 3,
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T09:15:00Z",
      likeCount: 25,
      commentCount: 5,
      category: "웹",
      tags: ["웹", "트렌드", "기술"],
      isLiked: false,
    },
    {
      postId: 4,
      title: "데이터베이스 설계 가이드",
      content:
        "효율적인 데이터베이스 설계를 위한 기본 원칙과 모범 사례를 소개합니다.",
      author: "최데이터",
      authorId: 4,
      createdAt: "2024-01-12T14:45:00Z",
      updatedAt: "2024-01-12T14:45:00Z",
      likeCount: 31,
      commentCount: 7,
      category: "데이터베이스",
      tags: ["DB", "설계", "최적화"],
      isLiked: false,
    },
  ],
  popularUsers: [
    {
      userId: 1,
      username: "kimdev",
      name: "김개발",
      nickname: "개발킴",
      profileImgUrl: "https://via.placeholder.com/50",
      isFollowing: false,
      followerCount: 1250,
      followingCount: 320,
    },
    {
      userId: 2,
      username: "parktype",
      name: "박타입",
      nickname: "타입박",
      profileImgUrl: "https://via.placeholder.com/50",
      isFollowing: true,
      followerCount: 980,
      followingCount: 180,
    },
    {
      userId: 3,
      username: "leeweb",
      name: "이웹",
      nickname: "웹이",
      profileImgUrl: "https://via.placeholder.com/50",
      isFollowing: false,
      followerCount: 750,
      followingCount: 250,
    },
  ],
  stats: {
    totalPosts: 1247,
    totalUsers: 342,
    totalLikes: 15680,
    totalComments: 3240,
  },
  categories: ["개발", "웹", "모바일", "데이터베이스", "AI", "디자인"],
};

// Mock 모드 설정 (개발 중에는 true로 설정)
const USE_MOCK_DATA = true;

// 홈 화면 관련 API 함수들
export const homeApi = {
  // 홈 화면 메인 데이터 가져오기
  getHomeData: async (): Promise<ApiResponse<HomeData>> => {
    if (USE_MOCK_DATA) {
      // Mock 데이터 사용
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "Success",
            data: mockHomeData,
          });
        }, 1000); // 1초 지연으로 로딩 테스트
      });
    }

    return apiCall<HomeData>("/api/home", {
      method: "GET",
    });
  },

  // 최신 포스트 가져오기
  getRecentPosts: async (limit: number = 10): Promise<ApiResponse<any[]>> => {
    return apiCall(`/api/posts/recent?limit=${limit}`, {
      method: "GET",
    });
  },

  // 인기 포스트 가져오기
  getPopularPosts: async (limit: number = 10): Promise<ApiResponse<any[]>> => {
    return apiCall(`/api/posts/popular?limit=${limit}`, {
      method: "GET",
    });
  },

  // 추천 사용자 가져오기
  getRecommendedUsers: async (
    limit: number = 5
  ): Promise<ApiResponse<any[]>> => {
    return apiCall(`/api/users/recommended?limit=${limit}`, {
      method: "GET",
    });
  },

  // 포스트 검색
  searchPosts: async (
    query: string,
    limit: number = 10
  ): Promise<ApiResponse<any[]>> => {
    return apiCall(
      `/api/posts/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: "GET",
      }
    );
  },

  // 카테고리별 포스트 가져오기
  getPostsByCategory: async (
    category: string,
    limit: number = 10
  ): Promise<ApiResponse<any[]>> => {
    return apiCall(`/api/posts/category/${category}?limit=${limit}`, {
      method: "GET",
    });
  },

  // 포스트 좋아요 토글
  togglePostLike: async (
    postId: number
  ): Promise<ApiResponse<{ isLiked: boolean; likeCount: number }>> => {
    return apiCall(`/api/posts/${postId}/like`, {
      method: "POST",
    });
  },

  // 사용자 팔로우 토글
  toggleUserFollow: async (
    userId: number
  ): Promise<ApiResponse<{ isFollowing: boolean; followerCount: number }>> => {
    return apiCall(`/api/users/${userId}/follow`, {
      method: "POST",
    });
  },

  // 홈 통계 가져오기
  getHomeStats: async (): Promise<
    ApiResponse<{
      totalPosts: number;
      totalUsers: number;
      totalLikes: number;
      totalComments: number;
    }>
  > => {
    return apiCall("/api/home/stats", {
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
    const response = await apiCall<ChatThreadResponseDto>("/chatbot/threads", {
      method: "POST",
      body: JSON.stringify(threadData),
    });

    if (isApiResponse<ChatThreadResponseDto>(response)) {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "스레드 생성에 실패했습니다.");
    }

    return response as ChatThreadResponseDto;
  },

  // 메시지 전송
  sendMessage: async (
    username: string,
    messageData: ChatMessageDto
  ): Promise<ChatMessageDto> => {
    const response = await apiCall<ChatMessageDto>("/chatbot/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });

    if (isApiResponse<ChatMessageDto>(response)) {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "메시지 전송에 실패했습니다.");
    }

    return response as ChatMessageDto;
  },

  // 단일 스레드 조회
  getThreadById: async (
    username: string,
    threadId: number
  ): Promise<ChatThreadResponseDto> => {
    const response = await apiCall<ChatThreadResponseDto>(
      `/chatbot/threads/${threadId}`,
      {
        method: "GET",
      }
    );

    if (isApiResponse<ChatThreadResponseDto>(response)) {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "스레드 조회에 실패했습니다.");
    }

    return response as ChatThreadResponseDto;
  },

  // 스레드 삭제
  deleteThread: async (username: string, threadId: number): Promise<void> => {
    const response = await apiCall<unknown>(`/chatbot/threads/${threadId}`, {
      method: "DELETE",
    });

    if (isApiResponse(response)) {
      if (!response.success) {
        throw new Error(response.message || "스레드 삭제에 실패했습니다.");
      }
      return;
    }

    if (response !== null && typeof response !== "undefined") {
      return;
    }
  },

  // 내 스레드 목록 조회
  getMyThreads: async (username: string): Promise<ChatThreadResponseDto[]> => {
    const response = await apiCall<ChatThreadResponseDto[]>(
      "/chatbot/threads/me",
      {
        method: "GET",
      }
    );

    if (isApiResponse<ChatThreadResponseDto[]>(response)) {
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    }

    return Array.isArray(response) ? response : [];
  },

  // 스레드별 메시지 조회
  getMessagesByThread: async (
    username: string,
    threadId: number
  ): Promise<ChatMessageDto[]> => {
    const response = await apiCall<ChatMessageDto[]>(
      `/chatbot/messages/thread/${threadId}`,
      {
        method: "GET",
      }
    );

    if (isApiResponse<ChatMessageDto[]>(response)) {
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    }

    return Array.isArray(response) ? response : [];
  },

  // 메시지 삭제
  deleteMessage: async (username: string, messageId: number): Promise<void> => {
    const response = await apiCall<void>(`/chatbot/messages/${messageId}`, {
      method: "DELETE",
    });

    if (isApiResponse(response) && !response.success) {
      throw new Error(response.message || "메시지 삭제에 실패했습니다.");
    }
  },
};
