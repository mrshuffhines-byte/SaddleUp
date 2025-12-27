import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../app/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

export default function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  label,
  color = colors.primary[500],
  backgroundColor = colors.neutral[200],
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label || 'Progress'}</Text>
          <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${clampedProgress}%`, 
              backgroundColor: color,
              height,
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  percentage: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary[500],
  },
  track: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: borderRadius.sm,
  },
});

