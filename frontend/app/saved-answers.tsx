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
import { colors, spacing, typography, borderRadius } from './theme';
import Card from '../components/ui/Card';
import { EmptyState } from '../components/ui';

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
    <Card style={styles.answerCard}>
      <TouchableOpacity onPress={() => router.push(`/saved-answer/${item.id}`)}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.answerPreview} numberOfLines={2}>
          {item.answer}
        </Text>
        <View style={styles.meta}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          )}
          {item.method && (
            <Text style={styles.method}>{item.method.name}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
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
        <EmptyState
          icon="💬"
          title="No Saved Answers"
          description="When you get helpful advice from the trainer, tap 'Save' to keep it here for reference."
          actionLabel="Ask the Trainer"
          onAction={() => router.push('/(tabs)/chat')}
        />
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
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: spacing.md,
  },
  categoryContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryButtonText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
  },
  categoryButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
  },
  answerCard: {
    marginBottom: spacing.md,
  },
  question: {
    ...typography.h4,
    color: colors.primary[500],
    marginBottom: spacing.sm,
  },
  answerPreview: {
    ...typography.body,
    color: colors.neutral[700],
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  category: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  method: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: '500',
  },
});
