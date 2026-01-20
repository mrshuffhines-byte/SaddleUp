import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../../app/theme';

const DISCLAIMER_DISMISSED_KEY = 'safety_disclaimer_dismissed';

export function SafetyDisclaimerBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  React.useEffect(() => {
    checkDismissed();
  }, []);

  const checkDismissed = async () => {
    try {
      const dismissedValue = await AsyncStorage.getItem(DISCLAIMER_DISMISSED_KEY);
      if (dismissedValue === 'true') {
        setDismissed(true);
      }
    } catch (error) {
      console.error('Error checking dismissed state:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(DISCLAIMER_DISMISSED_KEY, 'true');
      setDismissed(true);
    } catch (error) {
      console.error('Error saving dismissed state:', error);
    }
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  if (dismissed) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={handleToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Show safety information"
      >
        <Text style={styles.collapsedText}>ℹ️ Safety info</Text>
      </TouchableOpacity>
    );
  }

  if (collapsed) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={handleToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Expand safety information"
      >
        <Text style={styles.collapsedText}>ℹ️ Safety info</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container} accessible={true} accessibilityRole="alert">
      <Text style={styles.text}>
        Rein provides general training guidance only. For medical, vet, or safety concerns, consult a professional.
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleToggle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Collapse safety information"
        >
          <Text style={styles.actionText}>Collapse</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity
          onPress={handleDismiss}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Dismiss safety information"
        >
          <Text style={styles.actionText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  text: {
    ...typography.micro,
    color: colors.slate,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    ...typography.micro,
    color: colors.slate,
    fontWeight: '600',
  },
  separator: {
    ...typography.micro,
    color: colors.midGray,
    marginHorizontal: spacing.sm,
  },
  collapsedContainer: {
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  collapsedText: {
    ...typography.micro,
    color: colors.slate,
    fontWeight: '600',
  },
});
