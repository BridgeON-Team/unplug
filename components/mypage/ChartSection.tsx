import { useAuthContext } from "@/src/contexts/AuthContext";
import { useMyPage } from "@/src/hooks/useMyPage";
import { theme } from "@/src/styles/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ChartSection() {
  const { username } = useAuthContext();
  const { surveyResult, isLoading } = useMyPage(username);

  // 설문 결과가 없을 때의 기본 데이터
  const defaultChartData = {
    deviceUsage: {
      title: "# 기기 사용 통계",
      description: "설문을 완료하면 통계를 확인할 수 있습니다",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    generalChart: {
      title: "디지털 디톡스 점수",
      description: "설문을 완료하면 점수를 확인할 수 있습니다",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  };

  // 설문 결과가 있을 때의 데이터
  const getChartData = () => {
    if (!surveyResult) {
      return defaultChartData;
    }

    // 설문 점수를 기반으로 차트 데이터 생성 (예시)
    const score = surveyResult.totalScore;
    const normalizedScore = Math.min(score / 5, 10); // 5점 만점을 10으로 정규화

    return {
      deviceUsage: {
        title: "# 기기 사용 통계",
        description: `총점: ${score}점 (${surveyResult.type})`,
        data: Array.from({ length: 10 }, (_, i) =>
          Math.max(0, normalizedScore - Math.abs(i - 5) * 2)
        ),
      },
      generalChart: {
        title: "디지털 디톡스 점수",
        description: surveyResult.description,
        data: Array.from({ length: 10 }, (_, i) =>
          Math.max(0, normalizedScore - Math.abs(i - 5) * 1.5)
        ),
      },
    };
  };

  const chartData = getChartData();

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>차트 데이터를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 기기 사용 통계 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{chartData.deviceUsage.title}</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>준비 중입니다.</Text>
          {/* <Text style={styles.chartDescription}>
            {chartData.deviceUsage.description}
          </Text>
          <View style={styles.dataPreview}>
            <Text style={styles.dataText}>
              데이터:{" "}
              {chartData.deviceUsage.data.map((d) => d.toFixed(1)).join(", ")}
            </Text>
          </View> */}
        </View>
      </View>

      {/* 두 번째 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{chartData.generalChart.title}</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>준비 중입니다.</Text>
          {/* <Text style={styles.chartDescription}>
            {chartData.generalChart.description}
          </Text>
          <View style={styles.dataPreview}>
            <Text style={styles.dataText}>
              데이터:{" "}
              {chartData.generalChart.data.map((d) => d.toFixed(1)).join(", ")}
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  chartContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  chartPlaceholderText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.xs,
  },
  chartDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[300],
    marginBottom: theme.spacing.sm,
  },
  dataPreview: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  dataText: {
    fontSize: 10,
    color: theme.colors.gray[700],
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
});
