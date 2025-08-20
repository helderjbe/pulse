import { HorizontalDayViewer } from "@/components/HorizontalDayViewer";
import { RichTextEditor, type RichTextEditorRef } from "@/components/RichTextEditor";
import { ChatFAB } from "@/components/ui/ChatFAB";
import { ChatModal } from "@/components/ChatModal";
import { useDatabaseInit, useEditedDates } from "@/hooks/useDatabase";
import { useCurrentNote } from "@/hooks/useCurrentNote";
import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState, useRef } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const { isDatabaseReady } = useDatabaseInit();
  const { editedDates, refreshEditedDates } = useEditedDates(isDatabaseReady);
  const { currentContent } = useCurrentNote({ selectedDate, isDatabaseReady });
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleDateSelect = async (dateString: string) => {
    // Save current content before changing dates
    if (editorRef.current && isDatabaseReady) {
      try {
        await editorRef.current.forceSave();
      } catch (error) {
        console.error('Failed to save content before date change:', error);
      }
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
      
      <ChatFAB onPress={() => setIsChatModalVisible(true)} />
      
      <ChatModal
        visible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
        currentNoteContent={currentContent}
      />
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
