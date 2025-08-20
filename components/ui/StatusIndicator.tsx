import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface StatusIndicatorProps {
  isActive: boolean;
  size?: 'small' | 'large';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  isActive, 
  size = 'small' 
}) => {
  if (!isActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});