import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from './constants';

interface SavedAnswer {
  id: string;
  visibleIdDisplay: string;
  question: string;
  answer: string;
  category?: string;
  method?: {
    name: string;
    category: string;
  };
  createdAt: string;
}

export default function SavedAnswersScreen() {
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadAnswers();
  }, [selectedCategory]);

  const loadAnswers = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const url = selectedCategory
        ? `${API_URL}/api/saved-answers?category=${selectedCategory}`
        : `${API_URL}/api/saved-answers`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load saved answers');
      }

      const data = await response.json();
      setAnswers(data);
    } catch (error) {
      console.error('Load answers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Riding mechanics',
    'Horse body language',
    'Training troubleshooting',
    'Tack and equipment',
    'Horse care basics',
    'Driving-specific',
    'Safety concerns',
  ];

  const renderAnswer = ({ item }: { item: SavedAnswer }) => (
    <TouchableOpacity
      style={styles.answerCard}
      onPress={() => router.push(`/saved-answer/${item.id}`)}
    >
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.answerPreview} numberOfLines={2}>
        {item.answer}
      </Text>
      <View style={styles.meta}>
        {item.category && (
          <Text style={styles.category}>{item.category}</Text>
        )}
        {item.method && (
          <Text style={styles.method}>{item.method.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Answers</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              !selectedCategory && styles.categoryButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {answers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved answers yet</Text>
          <Text style={styles.emptySubtext}>
            Save helpful answers from your conversations with the trainer
          </Text>
        </View>
      ) : (
        <FlatList
          data={answers}
          renderItem={renderAnswer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4A3A',
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  categoryButtonActive: {
    backgroundColor: '#8B7355',
    borderColor: '#8B7355',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#5A4A3A',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  answerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 8,
  },
  answerPreview: {
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 22,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  category: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#F5F1EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  method: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
