import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B7355',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#8B7355',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#F5F1EA',
          borderTopColor: '#D4C4B0',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
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
