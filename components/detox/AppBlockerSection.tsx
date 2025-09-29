import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Switch } from "react-native";
import { AntDesign } from '@expo/vector-icons';

interface AppBlockerItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    timeSpent: string;
    percentage: number;
    isBlocked: boolean;
}

const mockAppBlockerData: AppBlockerItem[] = [
    { id: "1", name: "네이버 웹툰", icon: <AntDesign name="mobile1" size={24} color="#333" />, timeSpent: "01:21:13", percentage: 71, isBlocked: false }
];

interface AppBlockerSectionProps {
    apps?: AppBlockerItem[];
    onToggleBlock?: (appId: string) => void;
}

export default function AppBlockerSection({
    apps = mockAppBlockerData,
    onToggleBlock
}: AppBlockerSectionProps) {
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

            <View style={styles.appsContainer}>
                {apps.map((app) => (
                    <View key={app.id} style={styles.appItem}>
                        <View style={styles.appInfo}>
                            <View style={styles.appIcon}>{app.icon}</View>
                            <Text style={styles.appName}>{app.name}</Text>
                        </View>
                        <Switch
                            value={app.isBlocked}
                            onValueChange={() => onToggleBlock?.(app.id)}
                            trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
                            thumbColor={app.isBlocked ? theme.colors.white : theme.colors.white}
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.addAppButton}>
                <Text style={styles.addAppText}>앱 선택</Text>
            </TouchableOpacity>
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
    appsContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    appItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
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
    appName: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
    },
    addAppButton: {
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addAppText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        fontWeight: "500",
    },
});