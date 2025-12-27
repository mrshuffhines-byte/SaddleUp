import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants';
import SuggestedQuestions from '../../components/SuggestedQuestions';

interface TimestampReference {
  timestamp: string;
  text: string;
  type?: 'positive' | 'concern' | 'instruction';
}

interface MediaAnalysis {
  hasMedia: boolean;
  mediaCount: number;
  timestampReferences?: TimestampReference[];
  hasVideoTimestamps?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mediaUrls?: string[];
  mediaAnalysis?: MediaAnalysis;
}

interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
}

export default function ChatScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; thumbnail?: string; type: 'photo' | 'video' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data);

      // Load first conversation if exists
      if (data.length > 0 && !currentConversation) {
        loadConversation(data[0].id);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }

      const data = await response.json();
      setCurrentConversation(data);
    } catch (error) {
      console.error('Load conversation error:', error);
      Alert.alert('Error', 'Failed to load conversation');
    }
  };

  const loadSuggestedQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/training/suggested-questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Load suggested questions error:', error);
    }
  };

  const handleSuggestedQuestionPress = (question: string) => {
    setMessage(question);
  };

  const loadMethodPreference = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/methods/preference/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserMethodPreference(data);
        setShowComparisons(data?.showComparisons || false);
      }
    } catch (error) {
      console.error('Load method preference error:', error);
    }
  };

  const toggleComparisons = async () => {
    const newValue = !showComparisons;
    setShowComparisons(newValue);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token || !userMethodPreference) return;

      await fetch(`${API_URL}/api/methods/preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          primaryMethodId: userMethodPreference.primaryMethodId,
          showComparisons: newValue,
        }),
      });
    } catch (error) {
      console.error('Update comparison toggle error:', error);
      // Revert on error
      setShowComparisons(!newValue);
    }
  };

  const createNewConversation = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      setCurrentConversation(data);
      loadConversations();
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert('Error', 'Failed to create conversation');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation) return;

    const messageText = message;
    setMessage('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          content: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Reload conversation to get updated messages
      await loadConversation(currentConversation.id);
      await loadConversations();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const hasVideoTimestamps = item.role === 'assistant' && 
      item.mediaAnalysis?.hasVideoTimestamps && 
      item.mediaAnalysis?.timestampReferences &&
      item.mediaAnalysis.timestampReferences.length > 0;

    return (
      <View
        style={[
          styles.messageContainer,
          item.role === 'user' ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.role === 'user' && styles.userMessageText,
          ]}
        >
          {item.content}
        </Text>
        {hasVideoTimestamps && (
          <View style={styles.timestampsContainer}>
            <Text style={styles.timestampsTitle}>Key Moments:</Text>
            {item.mediaAnalysis!.timestampReferences!.slice(0, 5).map((ref, idx) => (
              <View key={idx} style={styles.timestampBadge}>
                <Text style={styles.timestampText}>{ref.timestamp}</Text>
              </View>
            ))}
            {item.mediaAnalysis!.timestampReferences!.length > 5 && (
              <Text style={styles.moreTimestamps}>
                +{item.mediaAnalysis!.timestampReferences!.length - 5} more
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loadingConversations) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  if (!currentConversation) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ask the Trainer</Text>
          <Text style={styles.emptyText}>
            Get personalized advice from an AI trainer who knows your experience level and training plan.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={createNewConversation}>
            <Text style={styles.startButtonText}>Start New Conversation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={currentConversation.messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {selectedMedia && (
        <View style={styles.mediaPreview}>
          {selectedMedia.type === 'photo' ? (
            <Image source={{ uri: selectedMedia.url }} style={styles.mediaPreviewImage} />
          ) : (
            <Image source={{ uri: selectedMedia.thumbnail }} style={styles.mediaPreviewImage} />
          )}
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => setSelectedMedia(null)}
          >
            <Text style={styles.removeMediaText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={showMediaOptions}
          disabled={loading || uploadingMedia}
        >
          {uploadingMedia ? (
            <ActivityIndicator color="#8B7355" size="small" />
          ) : (
            <Text style={styles.mediaButtonText}>📷</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            ((!message.trim() && !selectedMedia) || loading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={(!message.trim() && !selectedMedia) || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B7355',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#5A4A3A',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#8B7355',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  messageText: {
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  timestampsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  timestampsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 8,
  },
  timestampBadge: {
    backgroundColor: '#F5F1EA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  timestampText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  moreTimestamps: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  messageMediaContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageMedia: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#D4C4B0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F1EA',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#8B7355',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaPreview: {
    marginHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  mediaPreviewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#DC3545',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaButton: {
    padding: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonText: {
    fontSize: 24,
  },
  comparisonToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  comparisonLabel: {
    fontSize: 16,
    color: '#5A4A3A',
    flex: 1,
  },
  comparisonToggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4B0',
  },
  comparisonToggleLabel: {
    fontSize: 14,
    color: '#5A4A3A',
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D4C4B0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#8B7355',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
