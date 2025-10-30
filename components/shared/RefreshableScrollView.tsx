import React from "react";
import {
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
} from "react-native";

import { useRefreshControl } from "@/src/hooks/useRefreshControl";

type RefreshableScrollViewProps = ScrollViewProps & {
  onRefreshRequest?: () => Promise<void> | void;
  refreshEnabled?: boolean;
};

export default function RefreshableScrollView({
  onRefreshRequest,
  refreshEnabled = true,
  children,
  refreshControl,
  ...rest
}: RefreshableScrollViewProps) {
  const { refreshControlProps } = useRefreshControl(
    onRefreshRequest,
    { enabled: refreshEnabled }
  );

  return (
    <ScrollView
      {...rest}
      refreshControl={
        onRefreshRequest
          ? <RefreshControl {...refreshControlProps} />
          : refreshControl
      }
    >
      {children}
    </ScrollView>
  );
}
