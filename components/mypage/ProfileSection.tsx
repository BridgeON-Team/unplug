import { useAuthContext } from "@/src/contexts/AuthContext";
import { useMyPage } from "@/src/hooks/useMyPage";
import { surveyApi, SurveyQuestion, SurveyResult } from "@/src/services/api";
import { theme } from "@/src/styles/theme";
import { useRouter } from "expo-router";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshableSectionHandle } from "@/src/types/refresh";

// SVG 아이콘 import
const CameraIcon = require("@/assets/images/common/chat_icon.svg").default;

const LIKERT_OPTIONS = [
  { value: 1, label: "전혀 그렇지 않다" },
  { value: 2, label: "그렇지 않다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "그런 편이다" },
  { value: 5, label: "매우 그렇다" },
];

const ProfileSection = forwardRef<RefreshableSectionHandle>(function ProfileSection(
  _props,
  ref
) {
  const { username, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(
    username
  );
  const [isResolvingUsername, setIsResolvingUsername] = useState(
    !username
  );
  const [isSurveyModalVisible, setSurveyModalVisible] = useState(false);
  const [isSurveyLoading, setSurveyLoading] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [isSurveySubmitting, setSurveySubmitting] = useState(false);
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<SurveyResult | null>(
    null
  );
  const {
    userInfo,
    surveyResult,
    isLoading,
    error,
    fetchUserInfo,
    fetchSurveyResult,
  } = useMyPage(isAuthenticated ? resolvedUsername : null);

  const loadSurveyQuestions = useCallback(async () => {
    setSurveyLoading(true);
    setSurveyError(null);

    try {
      const questions = await surveyApi.getSurveyQuestions();
      setSurveyQuestions(questions);
      setSurveyAnswers(new Array(questions.length).fill(0));
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error("Survey questions load failed:", err);
      setSurveyError("설문 문항을 불러오는데 실패했습니다.");
    } finally {
      setSurveyLoading(false);
    }
  }, []);

  useEffect(() => {
    const resolveUsername = async () => {
      if (!isAuthenticated) {
        setResolvedUsername(null);
        setIsResolvingUsername(false);
        return;
      }

      if (username) {
        setResolvedUsername(username);
        setIsResolvingUsername(false);
        return;
      }

      setResolvedUsername(null);
      setIsResolvingUsername(false);
    };

    resolveUsername();
  }, [username, isAuthenticated]);

  useEffect(() => {
    if (isSurveyModalVisible) {
      loadSurveyQuestions();
    } else {
      setSurveyQuestions([]);
      setSurveyAnswers([]);
      setSurveyError(null);
      setSurveySubmitting(false);
      setCurrentQuestionIndex(0);
    }
  }, [isSurveyModalVisible, loadSurveyQuestions]);

  const openSurveyModal = () => {
    if (!resolvedUsername) {
      Alert.alert("오류", "사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    setSurveyModalVisible(true);
  };

  const closeSurveyModal = () => {
    if (isSurveySubmitting) return;
    setSurveyModalVisible(false);
  };

  const openResultModal = () => {
    const result = submittedResult ?? surveyResult;
    if (!result) return;
    setResultModalVisible(true);
  };

  const closeResultModal = () => {
    setResultModalVisible(false);
  };

  const handleSelectAnswer = (questionIndex: number, value: number) => {
    setSurveyAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const isSurveyReady = useMemo(() => {
    if (!surveyQuestions.length) return false;
    return surveyAnswers.every((answer) => answer >= 1 && answer <= 5);
  }, [surveyAnswers, surveyQuestions]);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const currentAnswer = surveyAnswers[currentQuestionIndex];
  const totalQuestions = surveyQuestions.length;
  const isLastQuestion =
    totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;
  const canProceed = currentAnswer >= 1 && currentAnswer <= 5;
  const isPrevDisabled =
    currentQuestionIndex === 0 || isSurveySubmitting || isSurveyLoading;
  const isPrimaryDisabled =
    isSurveySubmitting ||
    isSurveyLoading ||
    !canProceed ||
    (isLastQuestion && !isSurveyReady);
  const primaryButtonLabel = isLastQuestion ? "제출" : "다음";

  useEffect(() => {
    if (surveyResult) {
      setSubmittedResult(null);
    }
  }, [surveyResult]);

  const handleProfileRefresh = useCallback(async () => {
    await Promise.all([fetchUserInfo(), fetchSurveyResult()]);
  }, [fetchSurveyResult, fetchUserInfo]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: handleProfileRefresh,
    }),
    [handleProfileRefresh]
  );

  const handleGotoNext = () => {
    if (!surveyQuestions.length) {
      return;
    }

    if (surveyAnswers[currentQuestionIndex] < 1) {
      return;
    }

    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleGotoPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!resolvedUsername) {
      Alert.alert("오류", "사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!isSurveyReady) {
      Alert.alert("확인 필요", "모든 문항에 1~5 사이로 답변해주세요.");
      return;
    }

    setSurveySubmitting(true);
    setSurveyError(null);

    try {
      const response = await surveyApi.submitSurvey({
        username: resolvedUsername,
        answers: surveyAnswers,
      });

      if (response.success && response.data) {
        setSubmittedResult(response.data);
        setSurveyModalVisible(false);
        setResultModalVisible(true);
      } else if (response.success && !response.data) {
        setSurveyError("설문 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setSurveyError(
          response.message || "설문 제출 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      console.error("Survey submission failed:", err);
      setSurveyError("설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSurveySubmitting(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert("프로필 편집", "프로필 편집 기능은 준비 중입니다.");
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>로그인이 필요합니다</Text>
          <Text style={styles.guestSubtitle}>
            프로필과 설문 결과는 로그인 후 확인할 수 있어요.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>로그인 하러 가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 로딩 상태
  if (isResolvingUsername || isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  const summaryResult = submittedResult ?? surveyResult;
  const displayedResult = submittedResult ?? surveyResult;

  // 사용자 정보가 없는 경우
  if (!userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            사용자 정보를 불러올 수 없습니다.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                userInfo.profileImgUrl ||
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
            }}
            style={styles.profileImage}
            defaultSource={require("@/assets/images/icon.png")}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleEditProfile}
          >
            <CameraIcon width={16} height={16} fill={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nicknameContainer}>
            <Text style={styles.nickname}>{userInfo.nickname}</Text>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
          {summaryResult ? (
            <View style={styles.surveyCallout}>
              <Text style={styles.resultSummary}>{summaryResult.type}</Text>
              <Text style={styles.resultExcerpt} numberOfLines={2}>
                {summaryResult.description}
              </Text>
              <TouchableOpacity
                style={styles.resultButton}
                onPress={openResultModal}
              >
                <Text style={styles.resultButtonText}>설문 결과 보기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.surveyCallout}>
              <Text style={styles.tendency}>설문을 완료해주세요</Text>
              <TouchableOpacity
                style={styles.surveyButton}
                onPress={openSurveyModal}
              >
                <Text style={styles.surveyButtonText}>설문 진행하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={isResultModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeResultModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>설문 결과</Text>

            {displayedResult ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultType}>{displayedResult.type}</Text>
                <Text style={styles.resultScore}>
                  총점: {displayedResult.totalScore}
                </Text>
                <Text style={styles.resultDescription}>
                  {displayedResult.description}
                </Text>
              </View>
            ) : (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>결과를 불러오는 중...</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeResultModal}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSurveyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeSurveyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>스마트폰 사용 설문</Text>

            {isSurveyLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>
                  설문 문항을 불러오는 중...
                </Text>
              </View>
            ) : surveyError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{surveyError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadSurveyQuestions}
                  disabled={isSurveySubmitting || isSurveyLoading}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : currentQuestion ? (
              <View style={styles.questionContainer}>
                <Text style={styles.questionProgress}>
                  질문 {currentQuestionIndex + 1} / {totalQuestions}
                </Text>
                <Text style={styles.questionPrompt}>{currentQuestion.question}</Text>

                <View style={styles.likertList}>
                  {LIKERT_OPTIONS.map((option, index) => {
                    const isSelected = currentAnswer === option.value;
                    const isLastOption =
                      index === LIKERT_OPTIONS.length - 1;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.likertOption,
                          !isLastOption && styles.likertOptionSpacing,
                          isSelected && styles.likertOptionSelected,
                        ]}
                        onPress={() =>
                          handleSelectAnswer(currentQuestionIndex, option.value)
                        }
                        disabled={isSurveySubmitting}
                      >
                        <View style={styles.likertIndicatorWrapper}>
                          <View
                            style={[
                              styles.likertIndicator,
                              isSelected && styles.likertIndicatorSelected,
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.likertLabel,
                            isSelected && styles.likertLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  styles.navigationButtonSecondary,
                  isPrevDisabled && styles.navigationButtonDisabled,
                ]}
                onPress={handleGotoPrev}
                disabled={isPrevDisabled}
              >
                <Text
                  style={[
                    styles.navigationButtonText,
                    styles.navigationButtonTextSecondary,
                    isPrevDisabled && styles.navigationButtonTextDisabled,
                  ]}
                >
                  이전
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  styles.navigationButtonSpacing,
                  isPrimaryDisabled && styles.navigationButtonDisabled,
                ]}
                onPress={() => {
                  if (isPrimaryDisabled) {
                    return;
                  }
                  if (isLastQuestion) {
                    handleSubmitSurvey();
                  } else {
                    handleGotoNext();
                  }
                }}
                disabled={isPrimaryDisabled}
              >
                {isSurveySubmitting ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.navigationButtonText,
                      isPrimaryDisabled && styles.navigationButtonTextDisabled,
                    ]}
                  >
                    {primaryButtonLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeSurveyModal}
              disabled={isSurveySubmitting}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

ProfileSection.displayName = "ProfileSection";

export default ProfileSection;

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.black,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileInfo: {
    alignItems: "center",
  },
  nicknameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  nickname: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  tendency: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: "center",
  },
  guestCard: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  guestTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  guestSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: theme.typography.body.fontSize,
  },
  surveyCallout: {
    marginTop: theme.spacing.sm,
    alignItems: "center",
  },
  resultSummary: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  resultExcerpt: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  surveyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xs,
  },
  surveyButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  resultButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xs,
  },
  resultButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  resultType: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  resultScore: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultDescription: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[700],
    textAlign: "center",
  },
  modalLoading: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  modalErrorContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  modalErrorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  questionContainer: {
    paddingVertical: theme.spacing.md,
  },
  questionProgress: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  questionPrompt: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  likertList: {
    marginTop: theme.spacing.sm,
  },
  likertOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  likertOptionSpacing: {
    marginBottom: theme.spacing.sm,
  },
  likertOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E8EEFF",
  },
  likertIndicatorWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  likertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  likertIndicatorSelected: {
    backgroundColor: theme.colors.primary,
  },
  likertLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  likertLabelSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  navigationButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  navigationButtonSpacing: {
    marginLeft: theme.spacing.sm,
  },
  navigationButtonSecondary: {
    backgroundColor: theme.colors.gray[200],
  },
  navigationButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  navigationButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  navigationButtonTextSecondary: {
    color: theme.colors.text,
  },
  navigationButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  closeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
  },
  closeButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
    alignSelf: "center",
    marginTop: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
});
