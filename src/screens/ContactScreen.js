import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';

export default function ContactScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const contactMethods = [
    {
      icon: 'call-outline',
      title: 'Phone',
      value: '+91 98765 43210',
      color: '#4CAF50',
      onPress: () => Linking.openURL('tel:+919876543210')
    },
    {
      icon: 'mail-outline',
      title: 'Email',
      value: 'support@rengas.com',
      color: '#2196F3',
      onPress: () => Linking.openURL('mailto:support@rengas.com')
    },
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      value: '+91 98765 43210',
      color: '#25D366',
      onPress: () => Linking.openURL('https://wa.me/919876543210')
    },
    {
      icon: 'location-outline',
      title: 'Address',
      value: 'Chennai, Tamil Nadu, India',
      color: '#FF5722',
      onPress: () => {}
    }
  ];

  const faqs = [
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days within India. For remote areas, it may take up to 7 days.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for unopened products. Please contact support to initiate a return.'
    },
    {
      question: 'Are your products organic?',
      answer: 'Yes! All our products are 100% organic, solar-dried, and chemical-free. We source directly from our own farm.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking link via SMS and email to track your delivery.'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSending(true);

    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setName('');
          setEmail('');
          setMessage('');
        }}]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Help & Support" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={method.onPress}
              >
                <View style={[styles.iconCircle, { backgroundColor: method.color + '20' }]}>
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactValue}>{method.value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqSection}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#7A5C2E"
                  />
                </View>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your Message"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Business Hours</Text>
            <Text style={styles.footerValue}>Mon - Sat: 9:00 AM - 6:00 PM</Text>
            <Text style={styles.footerValue}>Sunday: Closed</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  contactCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  contactValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  faqSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden'
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
    lineHeight: 20
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#333'
  },
  textArea: {
    height: 100,
    paddingTop: 12
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  submitBtnDisabled: {
    opacity: 0.7
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  footerValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  }
});
