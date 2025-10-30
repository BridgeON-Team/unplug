export interface RefreshableSectionHandle {
  refresh: () => Promise<void>;
}
