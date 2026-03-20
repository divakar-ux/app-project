import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';

export default function AboutScreen({ navigation }) {
  const socialLinks = [
    {
      icon: 'logo-youtube',
      url: 'https://youtube.com/@dr_rengas_solardelights?si=OKm271Ygcx8V0bxL',
      color: '#FF0000'
    },
    {
      icon: 'logo-instagram',
      url: 'https://www.instagram.com/rengas_dr?igsh=MXVhbXF1Y2s1NHd2aA==',
      color: '#E4405F'
    },
    {
      icon: 'logo-facebook',
      url: 'https://www.facebook.com/share/1DgQtJVybs/',
      color: '#1877F2'
    }
  ];

  const values = [
    { icon: '🌱', title: 'Organic', desc: '100% chemical-free farming' },
    { icon: '☀️', title: 'Solar Dried', desc: 'Smart drying technology' },
    { icon: '🧪', title: 'Ozone Washed', desc: 'Advanced purification' },
    { icon: '🚜', title: 'Farm Fresh', desc: 'Direct from our farms' }
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="About Us" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Pure. Natural. Healthy.</Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.sectionTitle}>Our Story</Text>
            <Text style={styles.paragraph}>
              Dr. Renga's was born from a simple belief: that everyone deserves access to pure, 
              healthy, and chemical-free food. What started as a small initiative on our 
              100-acre sustainable farm has grown into a mission to bring nature's goodness 
              to homes across India.
            </Text>
            <Text style={styles.paragraph}>
              Our founder, Dr. Renga, a passionate advocate for organic farming and healthy 
              living, envisioned a world where food is not just nourishment but a source of 
              wellness. Every product we create is a testament to that vision.
            </Text>
          </View>

          <View style={styles.valuesSection}>
            <Text style={styles.sectionTitle}>Our Values</Text>
            <View style={styles.valuesGrid}>
              {values.map((value, index) => (
                <View key={index} style={styles.valueCard}>
                  <Text style={styles.valueIcon}>{value.icon}</Text>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDesc}>{value.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.missionSection}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <View style={styles.missionCard}>
              <Ionicons name="leaf" size={40} color="#16A34A" />
              <Text style={styles.missionText}>
                To revolutionize the way India eats by providing wholesome, organic, 
                and sustainably produced food that nourishes both body and soul.
              </Text>
            </View>
          </View>

          <View style={styles.processSection}>
            <Text style={styles.sectionTitle}>Our Process</Text>
            
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Careful Harvesting</Text>
                <Text style={styles.stepDesc}>
                  Hand-picked at peak ripeness from our organic farms
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ozone Washing</Text>
                <Text style={styles.stepDesc}>
                  Advanced cleaning removes impurities without chemicals
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Solar Drying</Text>
                <Text style={styles.stepDesc}>
                  Hybrid technology preserves nutrients and natural flavor
                </Text>
              </View>
            </View>

            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Quality Packaging</Text>
                <Text style={styles.stepDesc}>
                  Sealed fresh to maintain quality and extend shelf life
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialRow}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.socialBtn, { backgroundColor: link.color + '15' }]}
                  onPress={() => Linking.openURL(link.url)}
                >
                  <Ionicons name={link.icon} size={28} color={link.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.copyright}>© 2024 Dr. Renga's. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 16
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20
  },
  logo: {
    width: 150,
    height: 60
  },
  tagline: {
    fontSize: 16,
    color: '#16A34A',
    fontStyle: 'italic',
    marginTop: 8
  },
  storySection: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12
  },
  valuesSection: {
    marginTop: 20
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  valueCard: {
    width: '48%',
    backgroundColor: '#faf7f3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  valueIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  valueDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4
  },
  missionSection: {
    marginTop: 20
  },
  missionCard: {
    backgroundColor: '#faf7f3',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center'
  },
  missionText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12
  },
  processSection: {
    marginTop: 24
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: 16
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  stepDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  socialSection: {
    marginTop: 24,
    alignItems: 'center'
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 40
  },
  version: {
    fontSize: 13,
    color: '#999'
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  }
});
