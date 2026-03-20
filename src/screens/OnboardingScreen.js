import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = 'rengas_onboarding_complete';

const slides = [
  {
    id: '1',
    icon: '🌿',
    title: 'Welcome to Dr. Renga\'s',
    description: 'Discover pure, organic, and chemical-free food products directly from our sustainable farm.',
    color: '#4CAF50'
  },
  {
    id: '2',
    icon: '☀️',
    title: 'Solar Dried Goodness',
    description: 'Our unique hybrid solar-drying technology preserves nutrients and enhances natural flavors.',
    color: '#FF9800'
  },
  {
    id: '3',
    icon: '🧪',
    title: 'Ozone Washed & Pure',
    description: 'Advanced ozone purification ensures your food is clean, safe, and truly chemical-free.',
    color: '#2196F3'
  },
  {
    id: '4',
    icon: '🚜',
    title: 'Farm to Your Table',
    description: 'From our 100-acre organic farm straight to your home. Quality you can taste and trust.',
    color: '#16A34A'
  }
];

export default function OnboardingScreen({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      onComplete();
    }
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#ffffff', '#faf7f3']} style={styles.container}>
      <View style={styles.header}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipBtn} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slides[currentIndex].color }]}
          onPress={goToNext}
        >
          {currentIndex === slides.length - 1 ? (
            <Text style={styles.nextBtnText}>Get Started</Text>
          ) : (
            <>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

export const checkOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-end'
  },
  skipBtn: {
    padding: 10
  },
  skipText: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '500'
  },
  slide: {
    width: width,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  icon: {
    fontSize: 70
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 50
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5
  },
  activeDot: {
    backgroundColor: '#16A34A',
    width: 30
  },
  nextBtn: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8
  }
});
