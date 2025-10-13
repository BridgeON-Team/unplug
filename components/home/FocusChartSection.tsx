import { IconSymbol } from "@/components/ui/IconSymbol";
import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from 'react-native-svg';

interface FocusChartSectionProps {
    hasSetTime?: boolean;
    percentage?: number;
    timeSpent?: string;
}

export default function FocusChartSection({
    hasSetTime = true,
    percentage = 38,
    timeSpent = "02:20:48"
}: FocusChartSectionProps) {
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    if (!hasSetTime) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>목표 집중 시간</Text>
                        <IconSymbol name="chevron.right" size={16} color={theme.colors.gray[500]} />
                    </View>
                </View>
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>설정된 목표 집중 시간이 없습니다.</Text>
                    <Text style={styles.emptyStateSubText}>목표 집중 시간 추가하기</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>목표 집중 시간</Text>
                    <IconSymbol name="chevron.right" size={16} color={theme.colors.gray[500]} />
                </View>
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.percentageText}>{percentage}% 달성</Text>
                <View style={styles.circularProgressContainer}>
                    <Svg width="200" height="200" viewBox="0 0 200 200">
                        {/* 배경 원 */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke="#F0F0F0"
                            strokeWidth="20"
                            fill="none"
                        />
                        {/* 진행도 원 */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke="#9AE066"
                            strokeWidth="20"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                        />
                    </Svg>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{timeSpent}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        marginBottom: theme.spacing.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    title: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
    },
    chartContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
    },
    percentageText: {
        fontSize: 24,
        fontWeight: "700",
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    circularProgressContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 28,
        fontWeight: "700",
        color: theme.colors.text,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    emptyStateSubText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    addButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.gray[100],
        borderWidth: 2,
        borderColor: theme.colors.gray[300],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: theme.colors.gray[500],
        fontWeight: "300",
    },
});
