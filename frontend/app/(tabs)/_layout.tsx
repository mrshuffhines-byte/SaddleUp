import { Tabs } from 'expo-router';
import { COLORS } from '../constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
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
