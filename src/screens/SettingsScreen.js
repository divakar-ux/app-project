import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { CartContext } from '../context/CartContext';

export default function SettingsScreen({ navigation }) {
  const { clearCart } = useContext(CartContext);
  
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromos] = useState(false);

  const clearSearchHistory = async () => {
    Alert.alert(
      'Clear Search History',
      'Are you sure you want to clear your search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('rengas_search_history');
              Alert.alert('Success', 'Search history cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear search history');
            }
          }
        }
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear your cart, wishlist, and search history. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'rengas_cart',
                'rengas_wishlist',
                'rengas_search_history'
              ]);
              clearCart();
              Alert.alert('Success', 'All app data cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Enable all notifications</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#ddd', true: '#c9b896' }}
                thumbColor={notifications ? '#16A34A' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="cube-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Order Updates</Text>
                  <Text style={styles.settingDesc}>Get notified about order status</Text>
                </View>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
                trackColor={{ false: '#ddd', true: '#c9b896' }}
                thumbColor={orderUpdates ? '#16A34A' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="pricetag-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Promotions</Text>
                  <Text style={styles.settingDesc}>Receive offers and deals</Text>
                </View>
              </View>
              <Switch
                value={promotions}
                onValueChange={setPromos}
                trackColor={{ false: '#ddd', true: '#c9b896' }}
                thumbColor={promotions ? '#16A34A' : '#f4f3f4'}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.actionRow} onPress={clearSearchHistory}>
              <View style={styles.settingInfo}>
                <Ionicons name="search-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Clear Search History</Text>
                  <Text style={styles.settingDesc}>Remove search records</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} onPress={clearAllData}>
              <View style={styles.settingInfo}>
                <Ionicons name="trash-outline" size={22} color="#d9534f" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: '#d9534f' }]}>
                    Clear All App Data
                  </Text>
                  <Text style={styles.settingDesc}>Reset cart, wishlist & history</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>About Dr. Renga's</Text>
                  <Text style={styles.settingDesc}>Learn about our story</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color="#16A34A" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>App Version</Text>
                  <Text style={styles.settingDesc}>1.0.0</Text>
                </View>
              </View>
            </View>
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
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    marginLeft: 12,
    flex: 1
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333'
  },
  settingDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 50
  }
});
