# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pulse is a React Native note-taking application built with Expo SDK 53. The app features:
- **Daily Note System** - One note per day with rich text editing
- **Horizontal Calendar** - Infinite scrollable date picker with visual indicators
- **AI Chat Integration** - OpenAI-powered chat about note content
- **SQLite Database** - Local storage with auto-save functionality
- **Theming System** - Automatic light/dark mode with custom color schemes

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

### Application Structure
- **Single Page App** - Main screen at `app/index.tsx` with no tab navigation
- **Component-Based** - Modular components with custom hooks for logic separation
- **Database Layer** - SQLite with typed operations in `lib/database.ts`
- **Service Layer** - OpenAI integration in `services/openaiService.ts`

### Key Components
- **HorizontalDayViewer** - Calendar component with infinite scroll and date selection
- **RichTextEditor** - TenTap editor with auto-save and database integration  
- **ChatModal** - AI chat interface with context from current note
- **ChatFAB** - Floating action button for chat access

### Database Schema
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT UNIQUE NOT NULL,        -- YYYY-MM-DD format
  text TEXT,                       -- Rich text content
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Custom Hooks Architecture
- **useDatabase** - Database initialization and note operations
- **useCurrentNote** - Manages current note content for selected date
- **useAutoSave** - Handles automatic saving with debouncing
- **useCalendarData** - Calendar data generation and infinite scroll logic
- **useCalendarScroll** - FlatList scroll behavior and month navigation
- **useChat** - OpenAI chat integration with note context

### Theming System
- **Colors.ts** - Comprehensive light/dark color definitions including calendar-specific colors
- **useThemeColor** - Hook for accessing theme colors with fallbacks
- **useColorScheme** - System theme detection with web/native variants

### Environment Configuration
- **EXPO_PUBLIC_OPENAI_API_KEY** - Required environment variable for AI chat functionality
- Place in `.env` file in project root

### TypeScript Configuration
- Strict mode enabled with comprehensive type definitions
- Path aliases: `@/*` maps to project root
- Custom types in `types/index.ts` for component props and data structures
- Expo typed routes experimental feature enabled