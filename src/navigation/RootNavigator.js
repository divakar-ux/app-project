import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import OnboardingScreen, { checkOnboardingStatus } from '../screens/OnboardingScreen';

export default function RootNavigator() {
  const { isLoading } = useContext(AuthContext);
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const checkIfFirstLaunch = async () => {
    const hasCompletedOnboarding = await checkOnboardingStatus();
    setShowOnboarding(!hasCompletedOnboarding);
  };

  if (isLoading || showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 120, height: 120, marginBottom: 24 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return <AppNavigator />;
}

