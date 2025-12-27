import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, AVPlaybackStatus } from 'expo-av';
import { API_URL } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimestampReference {
  timestamp: string;
  text: string;
  type?: 'positive' | 'concern' | 'instruction';
}

interface Message {
  id: string;
  content: string;
  mediaUrls?: string[];
  mediaAnalysis?: {
    timestampReferences?: TimestampReference[];
  };
}

export default function MessageDetailScreen() {
  const { messageId, conversationId } = useLocalSearchParams<{
    messageId: string;
    conversationId: string;
  }>();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const router = useRouter();

  useEffect(() => {
    if (messageId && conversationId) {
      loadMessage();
    }
  }, [messageId, conversationId]);

  const loadMessage = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load message');
      }

      const conversation = await response.json();
      const foundMessage = conversation.messages?.find(
        (m: Message) => m.id === messageId
      );

      if (foundMessage) {
        setMessage(foundMessage);
      }
    } catch (error) {
      console.error('Load message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const handleTimestampPress = async (timestamp: string) => {
    const seconds = parseTimestampToSeconds(timestamp);
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seconds * 1000);
      await videoRef.current.playAsync();
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleSeek = async (position: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(position * 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimestampColor = (type?: string) => {
    switch (type) {
      case 'positive':
        return '#4CAF50';
      case 'concern':
        return '#FF9800';
      case 'instruction':
        return '#2196F3';
      default:
        return '#8B7355';
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  if (!message) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Message not found</Text>
      </View>
    );
  }

  const hasVideo = message.mediaUrls && message.mediaUrls.length > 0;
  const timestamps = message.mediaAnalysis?.timestampReferences || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.messageContent}>{message.content}</Text>

        {hasVideo && (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: message.mediaUrls![0] }}
              style={styles.video}
              resizeMode="contain"
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              shouldPlay={false}
            />
            
            {/* Custom Video Controls */}
            <View style={styles.videoControls}>
              <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.timelineProgress,
                      { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` },
                    ]}
                  />
                  {timestamps.map((ref, idx) => {
                    const timestampSeconds = parseTimestampToSeconds(ref.timestamp);
                    const position = duration > 0 ? (timestampSeconds / duration) * 100 : 0;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.timelineMarker,
                          {
                            left: `${position}%`,
                            backgroundColor: getTimestampColor(ref.type),
                          },
                        ]}
                        onPress={() => handleTimestampPress(ref.timestamp)}
                      />
                    );
                  })}
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {timestamps.length > 0 && (
          <View style={styles.timestampsSection}>
            <Text style={styles.sectionTitle}>Timestamp Feedback</Text>
            {timestamps.map((ref, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timestampItem,
                  { borderLeftColor: getTimestampColor(ref.type) },
                ]}
                onPress={() => handleTimestampPress(ref.timestamp)}
              >
                <View style={styles.timestampHeader}>
                  <Text
                    style={[
                      styles.timestamp,
                      { color: getTimestampColor(ref.type) },
                    ]}
                  >
                    {getTimestampIcon(ref.type)} {ref.timestamp}
                  </Text>
                </View>
                <Text style={styles.timestampText}>{ref.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  content: {
    padding: 24,
  },
  messageContent: {
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 24,
    marginBottom: 24,
  },
  videoContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 250,
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  timelineContainer: {
    flex: 1,
  },
  timeline: {
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 4,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#8B7355',
    borderRadius: 2,
  },
  timelineMarker: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  timestampsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 16,
  },
  timestampItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  timestampHeader: {
    marginBottom: 8,
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
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 48,
  },
});
