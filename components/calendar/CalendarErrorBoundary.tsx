import React, { Component, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalendarErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CalendarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component for the calendar to handle rendering errors gracefully
 */
export class CalendarErrorBoundary extends Component<
  CalendarErrorBoundaryProps,
  CalendarErrorBoundaryState
> {
  constructor(props: CalendarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CalendarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CalendarErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Calendar Error</Text>
          <Text style={styles.errorMessage}>
            Something went wrong loading the calendar.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});