import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface FocusTimerSectionProps {
    percentage?: number;
    timeSpent?: string;
    isActive?: boolean;
}

export default function FocusTimerSection({
    percentage = 38,
    timeSpent = "02:20:48",
    isActive = false
}: FocusTimerSectionProps) {
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>목표 집중시간</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Text style={styles.settingsText}>설정</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.percentageText}>{percentage}% 달성</Text>
                <View style={styles.circularProgressContainer}>
                    <Svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <Circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke="#F0F0F0"
                            strokeWidth="20"
                            fill="none"
                        />
                        {/* Progress circle */}
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

                <TouchableOpacity style={[styles.startButton, isActive && styles.activeButton]}>
                    <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>
                        {isActive ? "중지" : "집중 시작"}
                    </Text>
                </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
    },
    settingsButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
    },
    settingsText: {
        color: theme.colors.white,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: "600",
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
        marginBottom: theme.spacing.xl,
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
    startButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl * 2,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        minWidth: 120,
    },
    activeButton: {
        backgroundColor: theme.colors.error,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        textAlign: 'center',
    },
    activeButtonText: {
        color: theme.colors.white,
    },
});
