import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8B7355',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Welcome to SaddleUp' }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
    </Stack>
  );
}

