# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo SDK 53. The app uses:
- **Expo Router** for file-based navigation with TypeScript support
- **React Navigation** for tab navigation with blur effects on iOS
- **Expo Image** for optimized image handling
- **React Native Reanimated** for animations
- Custom themed components with automatic light/dark mode support

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npx expo start` - Start the development server
- `npm run android` - Start for Android
- `npm run ios` - Start for iOS  
- `npm run web` - Start for web

### Code Quality
- `npm run lint` - Run ESLint (uses expo/flat config)

### Project Reset
- `npm run reset-project` - Move current app to app-example and create blank app directory

## Architecture

### File-Based Routing Structure
- `app/_layout.tsx` - Root layout with theme provider and navigation stack
- `app/(tabs)/_layout.tsx` - Tab navigation layout with haptic feedback
- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/explore.tsx` - Explore screen
- `app/+not-found.tsx` - 404 screen

### Component System
- **Themed Components**: `ThemedText` and `ThemedView` automatically adapt to light/dark themes
- **Custom Hooks**: `useColorScheme`, `useThemeColor` for consistent theming
- **UI Components**: Reusable components in `components/ui/` (IconSymbol, TabBarBackground)
- **Interactive Components**: HapticTab, ParallaxScrollView with gesture support

### Styling & Theming
- Colors defined in `constants/Colors.ts` with light/dark variants
- Custom fonts loaded via Expo Font (SpaceMono)
- Platform-specific styling for iOS blur effects
- Automatic theme switching based on system preference

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` maps to project root)
- Expo typed routes experimental feature enabled
- Extends expo/tsconfig.base configuration