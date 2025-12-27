import { Tabs } from 'expo-router';
import { colors } from '../theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary[500],
        },
        headerTintColor: colors.neutral[50],
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.neutral[50],
          borderTopColor: colors.neutral[200],
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          headerShown: false, // Hide header since dashboard has its own hero section
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Training Plan',
          tabBarLabel: 'Plan',
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarLabel: 'Sessions',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Ask Trainer',
          tabBarLabel: 'Ask Trainer',
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          tabBarLabel: 'Skills',
        }}
      />
    </Tabs>
  );
}
