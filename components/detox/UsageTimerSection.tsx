import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Slider } from "react-native";
import { AntDesign } from '@expo/vector-icons';

interface UsageTimerSectionProps {
    initialTime?: number; // in minutes
    onTimeChange?: (time: number) => void;
}

export default function UsageTimerSection({
    initialTime = 60,
    onTimeChange
}: UsageTimerSectionProps) {
    const [selectedTime, setSelectedTime] = useState(initialTime);

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    };

    const handleTimeChange = (value: number) => {
        setSelectedTime(value);
        onTimeChange?.(value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>앱 차단</Text>
                <View style={styles.filterButtons}>
                    <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
                        <Text style={[styles.filterText, styles.activeFilterText]}>전체</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>차단중</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.timerContainer}>
                <View style={styles.appItem}>
                    <View style={styles.appInfo}>
                        <AntDesign name="mobile1" size={24} color="#333" style={styles.appIcon} />
                        <Text style={styles.appName}>네이버 웹툰</Text>
                        <View style={styles.timeIndicator}>
                            <Text style={styles.timeText}>보낸 시간 : 01:21:13</Text>
                            <Text style={styles.percentage}>71%</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>사용 시간 설정</Text>

                <View style={styles.timeDisplay}>
                    <Text style={styles.timeDisplayText}>{formatTime(selectedTime)}</Text>
                </View>

                <View style={styles.sliderContainer}>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={180}
                        value={selectedTime}
                        onValueChange={handleTimeChange}
                        step={1}
                        minimumTrackTintColor={theme.colors.primary}
                        maximumTrackTintColor={theme.colors.gray[300]}
                        thumbStyle={styles.sliderThumb}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>추가</Text>
                    </TouchableOpacity>
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
    title: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    filterButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.gray[300],
    },
    activeFilter: {
        backgroundColor: theme.colors.gray[100],
        borderColor: theme.colors.gray[500],
    },
    filterText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
    },
    activeFilterText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    timerContainer: {
        marginTop: theme.spacing.md,
    },
    appItem: {
        marginBottom: theme.spacing.lg,
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        marginRight: theme.spacing.sm,
    },
    appName: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        marginRight: theme.spacing.sm,
    },
    timeIndicator: {
        marginLeft: 'auto',
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
    },
    percentage: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    timeDisplay: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    timeDisplayText: {
        fontSize: 32,
        fontWeight: "700",
        color: theme.colors.text,
    },
    sliderContainer: {
        marginBottom: theme.spacing.xl,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderThumb: {
        backgroundColor: theme.colors.primary,
        width: 20,
        height: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: theme.colors.gray[100],
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.gray[700],
        fontWeight: "500",
    },
    addButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.white,
        fontWeight: "600",
    },
});