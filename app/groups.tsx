import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import GroupList from "@/components/community/GroupList";
import PageHeading from "@/components/shared/PageHeading";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import { theme } from "@/src/styles/theme";

const NAVIGATION_PADDING = 72;

export default function TabTwoScreen() {
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState("groups");
    const insets = useSafeAreaInsets();

    const { initialCategory, initialGroupFilter, initialChallengeFilter } = useMemo(() => {
        const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
        const filterParam = Array.isArray(params.filter) ? params.filter[0] : params.filter;

        const normalizedCategory =
            categoryParam === "challenge" ? "challenge" : "group";

        const normalizedFilter =
            filterParam === "available" || filterParam === "participating"
                ? filterParam
                : "all";

        const groupFilter: "all" | "available" | "participating" =
            normalizedCategory === "group"
                ? (normalizedFilter as "all" | "available" | "participating")
                : "all";

        const challengeFilter: "all" | "available" | "participating" =
            normalizedCategory === "challenge"
                ? (normalizedFilter as "all" | "available" | "participating")
                : "all";

        return {
            initialCategory: normalizedCategory as "group" | "challenge",
            initialGroupFilter: groupFilter,
            initialChallengeFilter: challengeFilter,
        };
    }, [params.category, params.filter]);

    const handleTabPress = (tabId: string) => {
        setActiveTab(tabId);
        console.log("Selected tab:", tabId);
    };

    const handleNotificationPress = () => {
        console.log("Notification pressed");
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <View style={styles.topBarContainer}>
                    <TopBar onNotificationPress={handleNotificationPress} />
                </View>

                <PageHeading title="모임 & 챌린지" subtitle="관심있는 활동을 찾아보세요" />

                <View
                    style={[
                        styles.contentContainer,
                        { paddingBottom: insets.bottom + NAVIGATION_PADDING },
                    ]}
                >
                    <GroupList
                        initialCategory={initialCategory}
                        initialGroupFilter={initialGroupFilter}
                        initialChallengeFilter={initialChallengeFilter}
                    />
                </View>

                <BottomNavigationBar
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topBarContainer: {
        paddingHorizontal: 0,
        marginBottom: theme.spacing.sm,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
    },
});
