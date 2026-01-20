import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants';
import { colors, spacing } from '../theme';
import { Toast } from '../../components/ui';
import {
  SafetyDisclaimerBar,
  ChatMessage,
  SuggestedPromptsRow,
  TypingIndicator,
  EmptyStateCoach,
  ErrorBanner,
  ChatInput,
  AddToPlanSheet,
  SaveTemplateSheet,
} from '../../components/chat';
import { parseCoachMessage, ParsedCoachMessage } from '../../components/chat/parseCoachMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mediaUrls?: string[];
}

interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
}

interface ExtendedMessage extends Message {
  parsed?: ParsedCoachMessage;
}

const RESPONSE_PROMPTS = [
  'Make it shorter',
  'Explain step 2 more',
  'What equipment do I need?',
];

export default function ChatScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; thumbnail?: string; type: 'photo' | 'video' } | null>(null);
  const [offline, setOffline] = useState(false);
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<ExtendedMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

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
      setOffline(false);

      // Load first conversation if exists
      if (data.length > 0 && !currentConversation) {
        loadConversation(data[0].id);
      } else if (data.length === 0) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      setOffline(true);
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
      setOffline(false);
      
      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Load conversation error:', error);
      setOffline(true);
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
      
      if (initialMessage && initialMessage.trim()) {
        setMessage(initialMessage.trim());
        setTimeout(() => {
          sendMessage(initialMessage.trim());
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

      const formData = new FormData();
      const filename = uri.split('/').pop() || `media.${type === 'photo' ? 'jpg' : 'mp4'}`;
      const typeFormValue = type === 'photo' ? 'image/jpeg' : 'video/mp4';
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('media', blob, filename);
      } else {
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

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || message.trim();
    if (!messageToSend && !selectedMedia) return;

    const mediaToUpload = selectedMedia;
    const originalMessage = message;
    
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

      let mediaUrls: string[] = [];
      if (mediaToUpload) {
        try {
          const uploadedUrl = await uploadMedia(mediaToUpload.url, mediaToUpload.type);
          mediaUrls = [uploadedUrl];
        } catch (uploadError: any) {
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload media. Please try again.');
          setMessage(originalMessage);
          setSelectedMedia(mediaToUpload);
          return;
        }
      }

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

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: messageToSend || (mediaUrls.length > 0 ? '📷' : ''),
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await loadConversation(conversation.id);
      await loadConversations();
      setOffline(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Send message error:', error);
      setOffline(true);
      Alert.alert('Error', error.message || 'Failed to send message. Please check your connection.');
      setMessage(originalMessage);
      if (mediaToUpload) {
        setSelectedMedia(mediaToUpload);
      }
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    if (!currentConversation) {
      createNewConversation(prompt).catch(err => {
        console.error('Failed to create conversation:', err);
      });
    } else {
      sendMessage(prompt);
    }
  };

  const handleAddToPlan = (message: ExtendedMessage) => {
    setSelectedMessageForAction(message);
    setShowAddToPlan(true);
  };

  const handleSaveTemplate = (message: ExtendedMessage) => {
    setSelectedMessageForAction(message);
    setShowSaveTemplate(true);
  };

  const handleConfirmAddToPlan = async (date: Date, time: string) => {
    // TODO: Implement add to plan API call
    showToast(`Added to your plan for ${date.toLocaleDateString('en-US', { weekday: 'long' })}`, 'success');
    setSelectedMessageForAction(null);
  };

  const handleConfirmSaveTemplate = async (name: string) => {
    if (!selectedMessageForAction) return;
    
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
          question: 'Template',
          answer: selectedMessageForAction.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      showToast('Saved to your Library', 'success');
      setSelectedMessageForAction(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to save template', 'error');
    }
  };

  const renderMessage = ({ item }: { item: ExtendedMessage }) => {
    const isUser = item.role === 'user';
    
    if (isUser) {
      return (
        <ChatMessage
          message={{
            id: item.id,
            role: 'user',
            content: item.content,
            createdAt: item.createdAt,
          }}
        />
      );
    }

    // Parse coach message if not already parsed
    const parsed = item.parsed || parseCoachMessage(item.content);

    return (
      <ChatMessage
        message={{
          id: item.id,
          role: 'assistant',
          content: parsed.intro,
          createdAt: item.createdAt,
          steps: parsed.steps,
          whenToStop: parsed.whenToStop,
          hasSafetyConcern: parsed.hasSafetyConcern,
        }}
        onAddToPlan={parsed.steps ? () => handleAddToPlan(item) : undefined}
        onSaveTemplate={() => handleSaveTemplate(item)}
      />
    );
  };

  if (loadingConversations) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.deepInk} />
      </View>
    );
  }

  const messages = currentConversation?.messages.map((msg): ExtendedMessage => ({
    ...msg,
    parsed: msg.role === 'assistant' ? parseCoachMessage(msg.content) : undefined,
  })) || [];

  const showEmptyState = !currentConversation || messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  const showResponsePrompts = !showEmptyState && lastMessage?.role === 'assistant' && !isTyping;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <SafetyDisclaimerBar />
        
        {offline && <ErrorBanner />}

        {showEmptyState ? (
          <EmptyStateCoach onSelectPrompt={handleSelectPrompt} />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              ListFooterComponent={
                isTyping ? <TypingIndicator /> : null
              }
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />

            {showResponsePrompts && (
              <SuggestedPromptsRow
                prompts={RESPONSE_PROMPTS}
                onSelectPrompt={handleSelectPrompt}
              />
            )}
          </>
        )}

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

        <ChatInput
          value={message}
          onChangeText={setMessage}
          onSend={() => sendMessage()}
          disabled={loading || uploadingMedia}
        />
      </View>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <AddToPlanSheet
        visible={showAddToPlan}
        onClose={() => {
          setShowAddToPlan(false);
          setSelectedMessageForAction(null);
        }}
        onConfirm={handleConfirmAddToPlan}
      />

      <SaveTemplateSheet
        visible={showSaveTemplate}
        onClose={() => {
          setShowSaveTemplate(false);
          setSelectedMessageForAction(null);
        }}
        onConfirm={handleConfirmSaveTemplate}
        defaultName={selectedMessageForAction?.content.split('\n')[0] || ''}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  messagesList: {
    paddingVertical: spacing.base,
    paddingBottom: spacing.xl,
  },
  mediaPreview: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  mediaPreviewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.borderWarm,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});