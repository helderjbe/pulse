import { HorizontalDayViewer } from "@/components/HorizontalDayViewer";
import { RichTextEditor, RichTextEditorRef } from "@/components/RichTextEditor";
import { useThemeColor } from "@/hooks/useThemeColor";
import { initDatabase, noteOperations } from "@/lib/database";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [editedDates, setEditedDates] = useState<string[]>([]);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);

  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDatabase();
        setIsDatabaseReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initializeDatabase();
  }, []);

  // Fetch edited dates on mount and when content is saved
  const refreshEditedDates = useCallback(async () => {
    if (!isDatabaseReady) return;

    try {
      const dates = await noteOperations.getEditedDates();
      setEditedDates(dates);
    } catch (error) {
      console.error("Failed to fetch edited dates:", error);
    }
  }, [isDatabaseReady]);

  useEffect(() => {
    if (isDatabaseReady) {
      refreshEditedDates();

      // Test database operations
      const testDatabase = async () => {
        try {
          const testDate = "2025-08-20";
          const testContent =
            "<p>Test content at " + new Date().toISOString() + "</p>";
          console.log("Testing database save...");
          await noteOperations.saveNote(testDate, testContent);
          console.log("Database save successful");

          const retrievedNote = await noteOperations.getNote(testDate);
          console.log("Retrieved note:", retrievedNote);
        } catch (error) {
          console.error("Database test failed:", error);
        }
      };

      testDatabase();
    }
  }, [isDatabaseReady, refreshEditedDates]);

  const handleDateSelect = async (dateString: string) => {
    // Force save before changing dates
    if (editorRef.current && isDatabaseReady) {
      await editorRef.current.forceSave();
    }
    setSelectedDate(dateString);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <HorizontalDayViewer
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          editedDates={editedDates}
        />
        <RichTextEditor
          ref={editorRef}
          selectedDate={selectedDate}
          onContentSaved={refreshEditedDates}
          isDatabaseReady={isDatabaseReady}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
