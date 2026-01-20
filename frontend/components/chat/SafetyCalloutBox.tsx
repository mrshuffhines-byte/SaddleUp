import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../app/theme';

export function SafetyCalloutBox() {
  return (
    <View style={styles.container}>
      <View style={styles.border} />
      <View style={styles.content}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.text}>
          This topic involves safety considerations. When in doubt, consult a professional.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bone,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  border: {
    width: 3,
    backgroundColor: colors.warning,
  },
  content: {
    flex: 1,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.deepInk,
    flex: 1,
    lineHeight: 20,
  },
});
