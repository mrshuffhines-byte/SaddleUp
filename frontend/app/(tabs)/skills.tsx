import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../constants';

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  unlockedAt: string;
}

interface SkillsData {
  all: Array<{ skill: Skill; unlockedAt: string }>;
  byCategory: Record<string, Array<{ skill: Skill; unlockedAt: string }>>;
  total: number;
}

export default function SkillsScreen() {
  const [skills, setSkills] = useState<SkillsData | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const [skillsResponse, milestonesResponse] = await Promise.all([
        fetch(`${API_URL}/api/training/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/training/milestones`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);
      }

      if (milestonesResponse.ok) {
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Skills & Progress</Text>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{skills?.total || 0}</Text>
            <Text style={styles.statLabel}>Skills Unlocked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{milestones.length}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>

        {/* Milestones */}
        {milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Milestones</Text>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneCard}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills by Category */}
        {skills && Object.keys(skills.byCategory).length > 0 ? (
          Object.entries(skills.byCategory).map(([category, categorySkills]) => (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>
              {categorySkills.map((userSkill) => (
                <View key={userSkill.skill.id} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{userSkill.skill.name}</Text>
                    <Text style={styles.unlockedBadge}>✓ Unlocked</Text>
                  </View>
                  {userSkill.skill.description && (
                    <Text style={styles.skillDescription}>
                      {userSkill.skill.description}
                    </Text>
                  )}
                  <Text style={styles.unlockedDate}>
                    Unlocked: {new Date(userSkill.unlockedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No skills unlocked yet</Text>
            <Text style={styles.emptySubtext}>
              Complete lessons to unlock new skills!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4A3A',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B7355',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#5A4A3A',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 16,
  },
  milestoneCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#8B7355',
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 8,
  },
  milestoneDescription: {
    fontSize: 16,
    color: '#5A4A3A',
  },
  skillCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A4A3A',
    flex: 1,
  },
  unlockedBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillDescription: {
    fontSize: 16,
    color: '#5A4A3A',
    marginBottom: 8,
    lineHeight: 22,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
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
