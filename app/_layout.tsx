import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
          <Stack screenOptions={{ headerShown: false }} />
      </UserProvider>
    </AuthProvider>
  );
}
