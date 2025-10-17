// API 연동 테스트를 위한 유틸리티 함수들
import { authApi, myPageApi, surveyApi } from "../services/api";

export const testApiConnection = async () => {
  console.log("=== API 연동 테스트 시작 ===");

  try {
    // 1. 설문 문항 조회 테스트
    console.log("1. 설문 문항 조회 테스트...");
    const questions = await surveyApi.getSurveyQuestions();
    console.log("설문 문항 조회 성공:", questions.length, "개 문항");

    // 2. 아이디 중복 확인 테스트
    console.log("2. 아이디 중복 확인 테스트...");
    const usernameCheck = await authApi.checkUsername("testuser");
    console.log("아이디 중복 확인 성공:", usernameCheck);

    // 3. 닉네임 중복 확인 테스트
    console.log("3. 닉네임 중복 확인 테스트...");
    const nicknameCheck = await authApi.checkNickname("테스트닉네임");
    console.log("닉네임 중복 확인 성공:", nicknameCheck);

    console.log("=== API 연동 테스트 완료 ===");
    return { success: true, message: "모든 API 테스트 통과" };
  } catch (error) {
    console.error("API 테스트 실패:", error);
    return { success: false, message: `API 테스트 실패: ${error}` };
  }
};

// 인증이 필요한 API 테스트 (실제 사용자 정보가 있을 때만)
export const testAuthenticatedApi = async (username: string) => {
  console.log("=== 인증 API 테스트 시작 ===");

  try {
    // 1. 사용자 정보 조회 테스트
    console.log("1. 사용자 정보 조회 테스트...");
    const userInfo = await myPageApi.getUserInfo(username);
    console.log("사용자 정보 조회 성공:", userInfo);

    // 2. 설문 결과 조회 테스트
    console.log("2. 설문 결과 조회 테스트...");
    const surveyResult = await myPageApi.getSurveyResult(username);
    console.log("설문 결과 조회 성공:", surveyResult);

    console.log("=== 인증 API 테스트 완료 ===");
    return { success: true, message: "모든 인증 API 테스트 통과" };
  } catch (error) {
    console.error("인증 API 테스트 실패:", error);
    return { success: false, message: `인증 API 테스트 실패: ${error}` };
  }
};
