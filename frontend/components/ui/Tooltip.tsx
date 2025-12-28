import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../app/theme';
import { Button } from './Button';

// Glossary of horse terms
export const horseGlossary: Record<string, string> = {
  'groundwork': 'Working with your horse while you stay on the ground - includes leading, grooming, and basic handling exercises.',
  'yielding': 'When your horse moves away from pressure. For example, moving their hindquarters away when you apply light pressure to their hip.',
  'hindquarters': 'The back half of the horse - their hips, back legs, and tail area.',
  'forehand': 'The front half of the horse - their head, neck, shoulders, and front legs.',
  'desensitization': 'Gradually getting your horse used to scary things (tarps, sounds, objects) so they stay calm.',
  'pressure and release': 'A training method where you apply gentle pressure (with rope, hand, or leg) and release it the moment your horse responds correctly.',
  'collection': 'When a horse carries more weight on their hindquarters, resulting in a lighter front end and elevated movement.',
  'on the forehand': 'When a horse carries too much weight on their front legs, making them heavy and unbalanced.',
  'pinned ears': 'When a horse flattens their ears back against their head - usually signals anger, fear, or discomfort.',
  'soft eye': 'A relaxed, half-closed eye that indicates a calm, content horse.',
  'green horse': 'A horse with little or no training - inexperienced and still learning.',
  'broke': 'A horse that has been trained to accept a rider and basic commands.',
  'lead rope': 'A rope attached to the halter used to lead and control your horse from the ground.',
  'halter': 'A headpiece made of rope or leather that fits around a horse\'s head for leading and tying.',
  'girth': 'The strap that goes under the horse\'s belly to hold the saddle in place.',
  'mounting': 'The act of getting on a horse.',
  'dismounting': 'The act of getting off a horse.',
  'lunge': 'Exercising a horse in a circle around you while you stay in the center, controlling them with a long line.',
  'cue': 'A signal you give your horse to ask for a specific response (leg pressure, voice command, rein aid).',
};

interface TooltipTextProps {
  children: string;
}

export function TooltipText({ children }: TooltipTextProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  
  // Find glossary terms in the text and make them clickable
  const renderTextWithTooltips = () => {
    let result: React.ReactNode[] = [];
    let remainingText = children;
    let key = 0;
    
    // Sort terms by length (longest first) to match longer phrases first
    const sortedTerms = Object.keys(horseGlossary).sort((a, b) => b.length - a.length);
    
    // Simple approach: find first matching term and replace it
    let foundMatch = false;
    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      if (regex.test(remainingText)) {
        const parts = remainingText.split(regex);
        result = [];
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 1) {
            // This is a matched term
            const matchedTerm = parts[i].toLowerCase();
            result.push(
              <TouchableOpacity 
                key={key++} 
                onPress={() => {
                  setSelectedTerm(matchedTerm);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.tooltipTerm}>
                  {parts[i]}
                  <Text style={styles.tooltipIcon}> (?)</Text>
                </Text>
              </TouchableOpacity>
            );
          } else if (parts[i]) {
            result.push(<Text key={key++}>{parts[i]}</Text>);
          }
        }
        foundMatch = true;
        break;
      }
    }
    
    if (!foundMatch) {
      return <Text>{children}</Text>;
    }
    
    return <Text>{result}</Text>;
  };
  
  return (
    <View>
      {renderTextWithTooltips()}
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.tooltipModal}>
            <Text style={styles.tooltipTitle}>
              {selectedTerm ? selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1) : ''}
            </Text>
            <Text style={styles.tooltipDefinition}>
              {selectedTerm && horseGlossary[selectedTerm]}
            </Text>
            <Button
              title="Got it"
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tooltipModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: 320,
    width: '100%',
    ...shadows.lg,
  },
  tooltipTitle: {
    ...typography.h3,
    color: colors.primary[700],
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
  },
  tooltipDefinition: {
    ...typography.body,
    color: colors.neutral[700],
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  tooltipTerm: {
    color: colors.primary[600],
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  tooltipIcon: {
    fontSize: typography.caption.fontSize,
    color: colors.primary[500],
  },
});

