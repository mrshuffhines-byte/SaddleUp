import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';

interface TimestampReference {
  timestamp: string;
  text: string;
  type?: 'positive' | 'concern' | 'instruction';
}

interface VideoAnalysisViewProps {
  videoUrl: string;
  timestampReferences?: TimestampReference[];
  onTimestampPress?: (seconds: number) => void;
}

export default function VideoAnalysisView({
  videoUrl,
  timestampReferences = [],
  onTimestampPress,
}: VideoAnalysisViewProps) {
  const videoRef = React.useRef<Video>(null);

  const handleTimestampPress = (timestamp: string) => {
    const seconds = parseTimestampToSeconds(timestamp);
    if (videoRef.current && onTimestampPress) {
      onTimestampPress(seconds);
    }
  };

  const getTimestampColor = (type?: string) => {
    switch (type) {
      case 'positive':
        return '#4CAF50'; // Green
      case 'concern':
        return '#FF9800'; // Orange
      case 'instruction':
        return '#2196F3'; // Blue
      default:
        return '#8B7355'; // Brown
    }
  };

  const getTimestampIcon = (type?: string) => {
    switch (type) {
      case 'positive':
        return '✓';
      case 'concern':
        return '⚠';
      case 'instruction':
        return '→';
      default:
        return '•';
    }
  };

  if (timestampReferences.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timestamp Feedback</Text>
      <ScrollView style={styles.timestampsList}>
        {timestampReferences.map((ref, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timestampItem,
              { borderLeftColor: getTimestampColor(ref.type) },
            ]}
            onPress={() => handleTimestampPress(ref.timestamp)}
          >
            <View style={styles.timestampHeader}>
              <Text style={[styles.timestamp, { color: getTimestampColor(ref.type) }]}>
                {getTimestampIcon(ref.type)} {ref.timestamp}
              </Text>
            </View>
            <Text style={styles.timestampText}>{ref.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function parseTimestampToSeconds(timestamp: string): number {
  const match = timestamp.match(/(\d+):(\d+)/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }
  return 0;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  timestampsList: {
    maxHeight: 300,
  },
  timestampItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  timestampHeader: {
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 14,
    color: '#5A4A3A',
    lineHeight: 20,
  },
});

