import { theme } from "@/src/styles/theme";
import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface UsageTimerSectionProps {
    initialTime?: number; // in minutes
    onTimeChange?: (time: number) => void;
}

const MIN_TIME = 0;
const MAX_TIME = 180;
const THUMB_SIZE = 20;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export default function UsageTimerSection({
  initialTime = 60,
  onTimeChange,
}: UsageTimerSectionProps) {
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [trackWidth, setTrackWidth] = useState(0);

  const ratio =
    trackWidth === 0
      ? 0
      : clamp((selectedTime - MIN_TIME) / (MAX_TIME - MIN_TIME), 0, 1);

  const updateTimeFromPosition = useCallback(
    (x: number) => {
      if (trackWidth <= 0) {
        return;
      }

      const clampedX = clamp(x, 0, trackWidth);
      const nextValue = Math.round(
        MIN_TIME + (clampedX / trackWidth) * (MAX_TIME - MIN_TIME)
      );

      setSelectedTime(nextValue);
      onTimeChange?.(nextValue);
    },
    [onTimeChange, trackWidth]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateTimeFromPosition(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateTimeFromPosition(event.nativeEvent.locationX);
        },
      }),
    [updateTimeFromPosition]
  );

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:00`;
  };

  const handleStepChange = useCallback(
    (delta: number) => {
      const nextValue = clamp(selectedTime + delta, MIN_TIME, MAX_TIME);
      setSelectedTime(nextValue);
      onTimeChange?.(nextValue);
    },
    [onTimeChange, selectedTime]
  );

  const activeTrackWidth = ratio * trackWidth;
  const thumbLeft = activeTrackWidth - THUMB_SIZE / 2;

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
            <AntDesign
              name="mobile1"
              size={24}
              color="#333"
              style={styles.appIcon}
            />
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

        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleStepChange(-5)}
          >
            <AntDesign name="minus" size={16} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.sliderContainer}>
            <View
              style={styles.sliderTrackWrapper}
              onLayout={handleTrackLayout}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderTrack} />
              <View
                style={[styles.sliderActiveTrack, { width: activeTrackWidth }]}
              />
              <View
                style={[styles.sliderThumb, { left: thumbLeft }]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0분</Text>
              <Text style={styles.sliderLabel}>180분</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => handleStepChange(5)}
          >
            <AntDesign name="plus" size={16} color={theme.colors.text} />
          </TouchableOpacity>
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
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    adjustButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.gray[300],
        backgroundColor: theme.colors.white,
    },
    sliderContainer: {
        flex: 1,
    },
    sliderTrackWrapper: {
        height: THUMB_SIZE,
        justifyContent: 'center',
    },
    sliderTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.gray[300],
    },
    sliderActiveTrack: {
        position: 'absolute',
        left: 0,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
    },
    sliderThumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: theme.colors.white,
        elevation: 4,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    sliderLabel: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
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
