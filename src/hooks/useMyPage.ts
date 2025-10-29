import { useEffect, useState } from "react";
import { myPageApi, SurveyResult, UserInfo } from "../services/api";

interface MyPageState {
  userInfo: UserInfo | null;
  surveyResult: SurveyResult | null;
  isLoading: boolean;
  error: string | null;
}

const isUserInfo = (value: unknown): value is UserInfo => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<UserInfo>;
  return (
    typeof user.userId === "number" &&
    typeof user.username === "string" &&
    typeof user.nickname === "string"
  );
};

export const useMyPage = (username: string | null) => {
  const [state, setState] = useState<MyPageState>({
    userInfo: null,
    surveyResult: null,
    isLoading: false,
    error: null,
  });

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await myPageApi.getUserInfo();

      const responseData =
        ("data" in response && isUserInfo(response.data)
          ? response.data
          : null) ?? (isUserInfo(response) ? response : null);

      if (responseData) {
        setState((prev) => ({
          ...prev,
          userInfo: responseData,
          isLoading: false,
          error: null,
        }));
        return;
      }

      const errorMessage =
        (typeof response?.message === "string" && response.message) ||
        "사용자 정보를 불러오는데 실패했습니다.";

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      setState((prev) => ({
        ...prev,
        error: "사용자 정보를 불러오는데 실패했습니다.",
        isLoading: false,
      }));
    }
  };

  // 설문 결과 조회
  const fetchSurveyResult = async () => {
    try {
      const response = await myPageApi.getSurveyResult();

      if (response.success) {
        setState((prev) => ({
          ...prev,
          surveyResult: response.data,
        }));
      }
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404) {
        setState((prev) => ({
          ...prev,
          surveyResult: null,
        }));
        return;
      }

      console.error("설문 결과 조회 오류:", error);
      // 설문 결과는 필수가 아니므로 에러를 상태에 저장하지 않음
    }
  };

  // 회원 탈퇴
  const deleteUser = async () => {
    try {
      const response = await myPageApi.deleteUser();

      if (response.success) {
        return { success: true, message: "회원 탈퇴가 완료되었습니다." };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      return { success: false, message: "회원 탈퇴 중 오류가 발생했습니다." };
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (username) {
      fetchUserInfo();
      fetchSurveyResult();
    }
  }, [username]);

  return {
    ...state,
    fetchUserInfo,
    fetchSurveyResult,
    deleteUser,
  };
};
