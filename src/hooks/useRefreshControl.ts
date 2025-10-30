import { useCallback, useMemo, useState } from "react";

import { theme } from "@/src/styles/theme";

type RefreshHandler = (() => Promise<void>) | (() => void);

export interface RefreshControlResult {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  refreshControlProps: {
    refreshing: boolean;
    onRefresh: () => void;
    tintColor: string;
    colors: string[];
  };
}

export function useRefreshControl(
  handler?: RefreshHandler,
  options?: { enabled?: boolean }
): RefreshControlResult {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!handler || options?.enabled === false) {
      return;
    }

    try {
      setRefreshing(true);
      await Promise.resolve(handler());
    } finally {
      setRefreshing(false);
    }
  }, [handler, options?.enabled]);

  const refreshControlProps = useMemo(
    () => ({
      refreshing,
      onRefresh: () => {
        void onRefresh();
      },
      tintColor: theme.colors.primary,
      colors: [theme.colors.primary],
    }),
    [onRefresh, refreshing]
  );

  return { refreshing, onRefresh, refreshControlProps };
}
