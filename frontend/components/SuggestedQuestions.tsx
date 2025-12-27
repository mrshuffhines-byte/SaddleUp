import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionPress: (question: string) => void;
}

export default function SuggestedQuestions({
  questions,
  onQuestionPress,
}: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Questions:</Text>
      {questions.map((question, index) => (
        <TouchableOpacity
          key={index}
          style={styles.questionButton}
          onPress={() => onQuestionPress(question)}
        >
          <Text style={styles.questionText}>{question}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  questionButton: {
    backgroundColor: '#F5F1EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    color: '#5A4A3A',
  },
});
