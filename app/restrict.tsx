import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNavigationBar from "@/components/shared/navigationBar/NavigationBar";
import TopBar from "@/components/shared/navigationBar/TopBar";
import PageHeading from "@/components/shared/PageHeading";
import RefreshableScrollView from "@/components/shared/RefreshableScrollView";
import { theme } from "@/src/styles/theme";

const NAVIGATION_PADDING = 72;

export default function DigitalDetoxScreen() {
  const [activeTab, setActiveTab] = useState("tools");
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Selected tab:", tabId);
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const scrollInset = useMemo(
    () => insets.bottom + NAVIGATION_PADDING,
    [insets.bottom]
  );

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.topBarContainer}>
          <TopBar onNotificationPress={handleNotificationPress} />
        </View>

        <PageHeading title="제한 도구" subtitle="디지털 디톡스" />

        <RefreshableScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onRefreshRequest={handleRefresh}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollInset }]}
        >
          <Text>준비중입니다</Text>
          {/* {renderContent()} */}
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
