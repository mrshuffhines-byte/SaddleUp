import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Card, Button, Toast } from '../../components/ui';

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
  const [isTyping, setIsTyping] = useState(false);
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
      } else if (data.length === 0) {
        setCurrentConversation(null);
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

  const createNewConversation = async (initialMessage?: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

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
      await loadConversations();
      
      // If there's an initial message, send it
      if (initialMessage && initialMessage.trim()) {
        // Use the main sendMessage function which handles everything properly
        setMessage(initialMessage.trim());
        // The user can now click send, or we can trigger it after a brief delay
        setTimeout(() => {
          sendMessage();
        }, 100);
      }
      
      return data;
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert('Error', 'Failed to create conversation');
      throw error;
    }
  };


  const uploadMedia = async (uri: string, type: 'photo' | 'video'): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create FormData
      const formData = new FormData();
      
      // Get file name and type from URI
      const filename = uri.split('/').pop() || `media.${type === 'photo' ? 'jpg' : 'mp4'}`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match && match[1] ? match[1] : (type === 'photo' ? 'jpg' : 'mp4');
      const typeFormValue = type === 'photo' ? 'image/jpeg' : 'video/mp4';
      
      // For web, we need to fetch the file as a blob first
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('media', blob, filename);
      } else {
        // For native, use the URI directly
        formData.append('media', {
          uri,
          type: typeFormValue,
          name: filename,
        } as any);
      }

      setUploadingMedia(true);

      const uploadResponse = await fetch(`${API_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it with boundary
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload media');
      }

      const uploadData = await uploadResponse.json();
      return uploadData.url;
    } catch (error: any) {
      console.error('Media upload error:', error);
      throw error;
    } finally {
      setUploadingMedia(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !selectedMedia) return;

    const messageText = message.trim();
    const mediaToUpload = selectedMedia;
    
    setMessage('');
    setSelectedMedia(null);
    setLoading(true);
    setIsTyping(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Upload media first if present
      let mediaUrls: string[] = [];
      if (mediaToUpload) {
        try {
          const uploadedUrl = await uploadMedia(mediaToUpload.url, mediaToUpload.type);
          mediaUrls = [uploadedUrl];
        } catch (uploadError: any) {
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload media. Please try again.');
          setMessage(messageText); // Restore message on error
          setSelectedMedia(mediaToUpload); // Restore media on error
          return;
        }
      }

      // Create conversation if it doesn't exist
      let conversation = currentConversation;
      if (!conversation) {
        const createResponse = await fetch(`${API_URL}/api/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create conversation');
        }

        conversation = await createResponse.json();
        setCurrentConversation(conversation);
      }

      // Send the message with media URLs
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: messageText || (mediaUrls.length > 0 ? '📷' : ''), // Send at least a placeholder if only media
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Reload conversation to get updated messages
      await loadConversation(conversation.id);
      await loadConversations();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
      setMessage(messageText); // Restore message on error
      if (mediaToUpload) {
        setSelectedMedia(mediaToUpload); // Restore media on error
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const saveAnswer = async (question: string, answer: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/saved-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }

      showToast('Answer saved to your library!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save answer', 'error');
    }
  };

  const showMediaOptions = async () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Photo Library', onPress: pickImageFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia({
        url: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
        type: result.assets[0].type === 'video' ? 'video' : 'photo',
      });
    }
  };

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia({
        url: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
        type: result.assets[0].type === 'video' ? 'video' : 'photo',
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const hasVideoTimestamps = !isUser && 
      item.mediaAnalysis?.hasVideoTimestamps && 
      item.mediaAnalysis?.timestampReferences &&
      item.mediaAnalysis.timestampReferences.length > 0;

    // Find the user message that preceded this assistant message for saving
    const messages = currentConversation?.messages || [];
    const messageIndex = messages.findIndex(m => m.id === item.id);
    const precedingUserMessage = messageIndex > 0 && messages[messageIndex - 1]?.role === 'user'
      ? messages[messageIndex - 1].content
      : '';

    return (
      <View
        style={[
          styles.messageWrapper,
          isUser && styles.userMessageWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
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
          {!isUser && (
            <Pressable
              style={styles.saveButton}
              onPress={() => saveAnswer(precedingUserMessage, item.content)}
            >
              <Text style={styles.saveButtonText}>💾 Save Answer</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const SuggestionChip = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <Pressable style={styles.suggestionChip} onPress={onPress}>
      <Text style={styles.suggestionChipText}>{text}</Text>
    </Pressable>
  );

  if (loadingConversations) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const messages = currentConversation?.messages || [];

  if (!currentConversation || messages.length === 0) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.welcomeContainer}
        >
          <View style={styles.welcomeChat}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeEmoji}>🤠</Text>
              <Text style={styles.welcomeTitle}>Ask the Trainer</Text>
              <Text style={styles.welcomeSubtitle}>
                Get answers to any horse training question. I know your experience level 
                and goals, so I'll give you advice that fits your situation.
              </Text>
            </View>
            
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              <View style={styles.suggestions}>
                {[
                  "How do I know if my horse is relaxed?",
                  "What should I do if my horse won't stand still?",
                  "How tight should my girth be?",
                  "My horse keeps walking off when I try to mount",
                  "Is it safe to ride alone on trails?",
                ].map((question, index) => (
                  <SuggestionChip
                    key={index}
                    text={question}
                    onPress={() => {
                      createNewConversation(question).catch(err => {
                        console.error('Failed to create conversation:', err);
                      });
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={styles.safetyNote}>
              <Text style={styles.safetyNoteIcon}>💡</Text>
              <Text style={styles.safetyNoteText}>
                For emergencies or serious behavioral issues, always consult a 
                professional trainer or veterinarian in person.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Input bar at bottom even when no conversation */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={showMediaOptions}
            disabled={loading || uploadingMedia}
          >
            {uploadingMedia ? (
              <ActivityIndicator color={colors.primary[500]} size="small" />
            ) : (
              <Text style={styles.mediaButtonText}>📷</Text>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            placeholderTextColor={colors.neutral[400]}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!loading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() && !selectedMedia) || loading ? styles.sendButtonDisabled : null,
            ]}
            onPress={sendMessage}
            disabled={(!message.trim() && !selectedMedia) || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
              <Text style={styles.typingText}>Trainer is thinking...</Text>
            </View>
          ) : null
        }
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
            <ActivityIndicator color={colors.primary[500]} size="small" />
          ) : (
            <Text style={styles.mediaButtonText}>📷</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor={colors.neutral[400]}
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
            <ActivityIndicator color={colors.surface} size="small" />
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
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  welcomeContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  welcomeChat: {
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  suggestionsSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  suggestionsTitle: {
    ...typography.h4,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  suggestions: {
    width: '100%',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  suggestionChipText: {
    ...typography.body,
    color: colors.neutral[700],
  },
  safetyNote: {
    flexDirection: 'row',
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
    width: '100%',
  },
  safetyNoteIcon: {
    fontSize: typography.body.fontSize,
    marginRight: spacing.sm,
  },
  safetyNoteText: {
    ...typography.bodySmall,
    color: colors.secondary[800],
    flex: 1,
    lineHeight: typography.bodySmall.lineHeight,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  typingText: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  messageWrapper: {
    width: '100%',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userMessageBubble: {
    backgroundColor: colors.primary[500],
  },
  assistantMessageBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  messageText: {
    ...typography.body,
    lineHeight: typography.body.lineHeight,
  },
  userMessageText: {
    color: colors.surface,
  },
  assistantMessageText: {
    color: colors.neutral[900],
  },
  timestampsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  timestampsTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary[500],
    marginBottom: spacing.sm,
  },
  timestampBadge: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  timestampText: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '600',
  },
  moreTimestamps: {
    ...typography.caption,
    color: colors.neutral[400],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  saveButtonText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  typingText: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.full,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    maxHeight: 100,
    marginRight: spacing.sm,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  mediaPreview: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  mediaPreviewImage: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaButton: {
    padding: spacing.md,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonText: {
    fontSize: 24,
  },
});
