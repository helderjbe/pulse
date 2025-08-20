import { HorizontalDayViewer } from "@/components/HorizontalDayViewer";
import { RichTextEditor, RichTextEditorRef } from "@/components/RichTextEditor";
import { useDatabaseInit, useEditedDates } from "@/hooks/useDatabase";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const editorRef = useRef<RichTextEditorRef>(null);

  const backgroundColor = useThemeColor({}, "background");
  const { isDatabaseReady } = useDatabaseInit();
  const { editedDates, refreshEditedDates } = useEditedDates(isDatabaseReady);

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
