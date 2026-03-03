import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { registerCustomer } from '../api/shopify';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 5) {
      Alert.alert('Weak Password', 'Password must be at least 5 characters.');
      return;
    }

    try {
      setLoading(true);

      const result = await registerCustomer(email.trim(), password, name.trim());

      if (result.customerUserErrors?.length > 0) {
        const errorMsg = result.customerUserErrors[0].message;
        Alert.alert('Registration Failed', errorMsg);
        return;
      }

      if (result.customer) {
        Alert.alert(
          'Success',
          'Your account has been created! Please sign in.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      } else {
        Alert.alert('Error', 'Could not create account. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#fffaf3']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start shopping healthy</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#7A5C2E" style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#999"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#7A5C2E" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#7A5C2E" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#7A5C2E" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 10
  },
  headerContainer: {
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 6
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  button: {
    backgroundColor: '#7A5C2E',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  footerText: {
    color: '#666'
  },
  link: {
    color: '#7A5C2E',
    fontWeight: 'bold'
  }
});