/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    calendarBackground: '#f8f9fa',
    calendarBorder: '#e9ecef',
    calendarToday: '#0a7ea4',
    calendarSelected: '#007bff',
    calendarText: '#11181C',
    calendarTextSecondary: '#6c757d',
    calendarFilledBackground: '#f1f3f4',
    chatBorder: '#e5e7eb',
    chatInputBackground: '#f9fafb',
    chatInputBorder: '#d1d5db',
    chatErrorBackground: '#fef2f2',
    chatErrorText: '#dc2626',
    chatLoadingText: '#6b7280',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    calendarBackground: '#2c2e30',
    calendarBorder: '#404244',
    calendarToday: '#fff',
    calendarSelected: '#0d6efd',
    calendarText: '#ECEDEE',
    calendarTextSecondary: '#9BA1A6',
    calendarFilledBackground: '#3a3c3e',
    chatBorder: '#374151',
    chatInputBackground: '#1f2937',
    chatInputBorder: '#4b5563',
    chatErrorBackground: '#1f1517',
    chatErrorText: '#f87171',
    chatLoadingText: '#9ca3af',
  },
};