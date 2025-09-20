import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// 샘플 차트 데이터
const sampleChartData = {
  deviceUsage: {
    title: "# 기기 사용 통계",
    description: "라인 차트 (0-100, 0-9)",
    data: [20, 35, 45, 60, 40, 70, 55, 80, 65, 50],
  },
  generalChart: {
    title: "Chart",
    description: "바 차트 (0-100, 0-9)",
    data: [30, 60, 40, 80, 25, 70, 45, 90, 35, 55],
  },
};

export default function ChartSection() {
  return (
    <View style={styles.container}>
      {/* 기기 사용 통계 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {sampleChartData.deviceUsage.title}
        </Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>차트 영역</Text>
          <Text style={styles.chartDescription}>
            {sampleChartData.deviceUsage.description}
          </Text>
          <View style={styles.dataPreview}>
            <Text style={styles.dataText}>
              데이터: {sampleChartData.deviceUsage.data.join(", ")}
            </Text>
          </View>
        </View>
      </View>

      {/* 두 번째 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {sampleChartData.generalChart.title}
        </Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>차트 영역</Text>
          <Text style={styles.chartDescription}>
            {sampleChartData.generalChart.description}
          </Text>
          <View style={styles.dataPreview}>
            <Text style={styles.dataText}>
              데이터: {sampleChartData.generalChart.data.join(", ")}
            </Text>
          </View>
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
});
