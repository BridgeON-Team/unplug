import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

interface TabsSectionProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function TabsSection({
    activeTab = "today",
    onTabChange
}: TabsSectionProps) {
    const [selectedTab, setSelectedTab] = useState(activeTab);

    const handleTabPress = (tab: string) => {
        setSelectedTab(tab);
        onTabChange?.(tab);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.tab, selectedTab === "today" && styles.activeTab]}
                onPress={() => handleTabPress("today")}
            >
                <Text style={[styles.tabText, selectedTab === "today" && styles.activeTabText]}>
                    오늘
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, selectedTab === "usage" && styles.activeTab]}
                onPress={() => handleTabPress("usage")}
            >
                <Text style={[styles.tabText, selectedTab === "usage" && styles.activeTabText]}>
                    사용 시간
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.xs,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.gray[500],
        fontWeight: "500",
    },
    activeTabText: {
        color: theme.colors.white,
        fontWeight: "600",
    },
});