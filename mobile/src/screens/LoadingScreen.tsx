import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { theme } from '@/theme';

export const LoadingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 20, color: theme.colors.text }}>Cargando TaskFlow AI...</Text>
    </View>
  );
};