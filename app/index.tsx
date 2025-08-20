import { HorizontalDayViewer } from "@/components/HorizontalDayViewer";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useThemeColor } from "@/hooks/useThemeColor";
import { initDatabase } from "@/lib/database";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <HorizontalDayViewer
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
        <RichTextEditor />
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
