import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Calendar } from '@/components/Calendar';
import { DateDisplay } from '@/components/DateDisplay';
import { useThemeColor } from '@/hooks/useThemeColor';
import { initDatabase } from '@/lib/database';

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Calendar 
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
        <DateDisplay selectedDate={selectedDate} />
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
    paddingTop: 20,
  },
});
