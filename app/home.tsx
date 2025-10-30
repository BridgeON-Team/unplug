import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AvailableGroupsSection, {
  AvailableGroupsSectionHandle,
} from "@/components/home/AvailableGroupsSection";
import ChallengeSection, {
  ChallengeSectionHandle,
} from "@/components/home/ChallengeSection";
import FocusChartSection from "@/components/home/FocusChartSection";
import PageHeading from "@/components/shared/PageHeading";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import RefreshableScrollView from "@/components/shared/RefreshableScrollView";
import { theme } from "@/src/styles/theme";

const NAVIGATION_PADDING = 72;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("home");
  const challengeSectionRef = useRef<ChallengeSectionHandle>(null);
  const groupsSectionRef = useRef<AvailableGroupsSectionHandle>(null);

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const scrollContentInset = useMemo(
    () => insets.bottom + NAVIGATION_PADDING,
    [insets.bottom]
  );

  const handleRefresh = useCallback(async () => {
    const tasks: Promise<void>[] = [];

    if (challengeSectionRef.current) {
      tasks.push(challengeSectionRef.current.refresh());
    }

    if (groupsSectionRef.current) {
      tasks.push(groupsSectionRef.current.refresh());
    }

    if (tasks.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }

    await Promise.all(tasks);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar onNotificationPress={handleNotificationPress} />
        </View>

        <PageHeading title="홈" subtitle="대시보드" />

        <RefreshableScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onRefreshRequest={handleRefresh}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollContentInset }]}
        >
          <FocusChartSection
            hasSetTime={true}
            percentage={38}
            timeSpent="02:20:48"
          />

          <ChallengeSection ref={challengeSectionRef} />

          <AvailableGroupsSection ref={groupsSectionRef} />
        </RefreshableScrollView>

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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  scrollContent: {
    paddingTop: theme.spacing.sm,
  },
});
