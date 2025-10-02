import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { AntDesign, FontAwesome } from '@expo/vector-icons';

interface AppUsageItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    timeSpent: string;
    percentage: number;
    color: string;
    displayType?: 'bar' | 'circle';
}

const mockAppUsageData: AppUsageItem[] = [
    { id: "1", name: "네이버 웹툰", icon: <AntDesign name="mobile1" size={24} color="#333" />, timeSpent: "01:21:13", percentage: 71, color: "#9AE066", displayType: 'bar' },
    { id: "2", name: "instagram", icon: <AntDesign name="instagram" size={24} color="#E4405F" />, timeSpent: "01:00:13", percentage: 50, color: "#FF9500", displayType: 'bar' },
    { id: "3", name: "YouTube", icon: <AntDesign name="youtube" size={24} color="#FF0000" />, timeSpent: "00:21:13", percentage: 16, color: "#FF3B30", displayType: 'bar' }
];

interface AppUsageSectionProps {
    apps?: AppUsageItem[];
    onSettingsPress?: () => void;
}

export default function AppUsageSection({
    apps = mockAppUsageData,
    onSettingsPress
}: AppUsageSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>앱 사용시간</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
                    <Text style={styles.settingsText}>설정</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.appsContainer}>
                {apps.map((app) => (
                    <View key={app.id} style={styles.appItem}>
                        <View style={styles.appInfo}>
                            <View style={styles.appIcon}>{app.icon}</View>
                            <View style={styles.appDetails}>
                                <Text style={styles.appName}>{app.name}</Text>
                                {app.displayType === 'circle' ? (
                                    <View style={styles.circleContainer}>
                                        <View style={[styles.circleDisplay, { backgroundColor: app.color }]}>
                                            <Text style={styles.circleText}>{app.percentage}% : {app.timeSpent}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.progressBarContainer}>
                                        <View style={styles.progressBarBackground}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    { width: `${app.percentage}%`, backgroundColor: app.color }
                                                ]}
                                            />
                                            <Text style={styles.progressBarTextFixed}>
                                                {app.percentage}% 남은 시간 : {app.timeSpent}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
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
    appsContainer: {
        gap: theme.spacing.md,
    },
    appItem: {
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    appInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appIcon: {
        marginRight: theme.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appDetails: {
        flex: 1,
    },
    appName: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    progressBarContainer: {
        width: '100%',
        marginTop: theme.spacing.xs,
    },
    progressBarBackground: {
        height: 40,
        backgroundColor: theme.colors.gray[100],
        borderRadius: 20,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        borderRadius: 20,
    },
    progressBarTextFixed: {
        color: theme.colors.text,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: "600",
        zIndex: 1,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    percentageText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.text,
        fontWeight: "600",
        zIndex: 1,
    },
    circleContainer: {
        marginTop: theme.spacing.xs,
        alignItems: 'flex-start',
    },
    circleDisplay: {
        width: 120,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
    },
    circleText: {
        color: theme.colors.white,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: "600",
        textAlign: 'center',
    },
    addButton: {
        height: 60,
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.sm,
        borderWidth: 2,
        borderColor: theme.colors.gray[300],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
    },
    addButtonText: {
        fontSize: 24,
        color: theme.colors.gray[500],
        fontWeight: "300",
    },
});