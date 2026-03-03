import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { customer, userToken, logout } = useContext(AuthContext);

  const isLoggedIn = !!userToken;

  const displayName = customer?.firstName
    ? `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`
    : 'Guest User';

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatar}>
            <Ionicons name="person-outline" size={50} color="#999" />
          </View>
          <Text style={styles.guestTitle}>Welcome to Dr. Renga's</Text>
          <Text style={styles.guestSubtitle}>
            Login or create an account to access your orders, wishlist, and more
          </Text>
          
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Contact')}
          >
            <Ionicons name="help-circle-outline" size={22} color="#7A5C2E" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#7A5C2E" />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#7A5C2E" />
        </View>
        <Text style={styles.title}>{displayName}</Text>
        {customer?.email && (
          <Text style={styles.email}>{customer.email}</Text>
        )}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons name="receipt-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Ionicons name="heart-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>My Wishlist</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Addresses')}
        >
          <Ionicons name="location-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>My Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Contact')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#7A5C2E" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#d9534f" />
          <Text style={[styles.menuText, { color: '#d9534f' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: 30
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20
  },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  registerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30
  },
  registerBtnText: {
    color: '#7A5C2E',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  menuSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 50
  }
});
