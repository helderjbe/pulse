// UI Constants
export const UI_CONSTANTS = {
  DAY_ITEM_WIDTH: 60,
  INITIAL_DAYS_COUNT: 365,
  TOOLBAR_MIN_HEIGHT: 44,
  EDITOR_HORIZONTAL_PADDING: 8,
  HEADER_PADDING: 20,
  HEADER_BOTTOM_PADDING: 12,
  TODAY_BUTTON_PADDING: 6,
  TODAY_BUTTON_BORDER_RADIUS: 16,
  DAY_ITEM_HEIGHT: 70,
  DAY_ITEM_MARGIN: 2,
  DAY_ITEM_BORDER_RADIUS: 12,
  CONTAINER_PADDING: 16,
} as const;

// Editor Constants
export const EDITOR_CONSTANTS = {
  AUTO_SAVE_DEBOUNCE_MS: 250,
  CONTENT_CHECK_INTERVAL_MS: 500,
  EMPTY_CONTENT: "<p></p>",
  FONT_SIZE: 16,
  LINE_HEIGHT: 24,
} as const;

// Calendar Constants
export const CALENDAR_CONSTANTS = {
  INITIAL_DAYS_COUNT: 365, // Generate 365 days initially
  TODAY_INDEX_OFFSET: 365, // Today is in the middle of the generated days
  BATCH_SIZE: 30, // Number of days to add when extending the list
  END_THRESHOLD: 0.5,
  INITIAL_RENDER_COUNT: 15,
  MAX_RENDER_BATCH: 10,
  WINDOW_SIZE: 21,
  VIEWABILITY_THRESHOLD: 50,
} as const;

// Colors
export const THEME_COLORS = {
  EDITED_INDICATOR: "#ff6b35", // Orange for edited dates
  WHITE: "#ffffff",
  TRANSPARENT: "transparent",
} as const;

// Database Constants
export const DATABASE_CONSTANTS = {
  NAME: "notes.db",
  TABLE_NAME: "notes",
} as const;