// navigationbar.type.ts (정리본)
import type React from "react";
import type { SvgProps } from "react-native-svg";

export interface NavigationTab {
  id: string;
  label: string;
  icon: React.FC<SvgProps>;
  width: number;
  height: number;
}

export interface BottomNavigationBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export type TabId = "community" | "chatbot" | "home" | "tools" | "my";
export type TabLabel = "모임" | "챗봇" | "" | "도구" | "MY";

export interface IconSize {
  width: number;
  height: number;
}
