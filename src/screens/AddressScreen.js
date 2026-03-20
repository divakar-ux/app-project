import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress
} from '../api/shopify';
import ScreenHeader from '../components/ScreenHeader';

export default function AddressScreen({ navigation }) {
  const { userToken, customer } = useContext(AuthContext);

  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [form, setForm] = useState({
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: ''
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!userToken) return;

    try {
      setLoading(true);
      const result = await getCustomerAddresses(userToken);
      setAddresses(result.addresses);
      setDefaultAddressId(result.defaultAddressId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: ''
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow location access to use your current address.'
        );
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const [addr] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      if (!addr) {
        Alert.alert('Error', 'Could not get address for your location. Please enter it manually.');
        return;
      }
      const street = [addr.streetNumber, addr.street].filter(Boolean).join(' ') || addr.name || '';
      setForm((prev) => ({
        ...prev,
        address1: street || prev.address1,
        address2: addr.district || prev.address2,
        city: addr.city || addr.subregion || prev.city,
        province: addr.region || prev.province,
        zip: addr.postalCode || prev.zip
      }));
    } catch (error) {
      Alert.alert(
        'Location error',
        error.message || 'Could not get your location. Please enter the address manually.'
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setForm({
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      zip: address.zip || ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.address1.trim() || !form.city.trim() || !form.zip.trim()) {
      Alert.alert('Missing Fields', 'Please fill in address, city and PIN code.');
      return;
    }

    const firstName = customer?.firstName || 'Customer';
    const lastName = customer?.lastName || '';
    const addressData = {
      ...form,
      firstName,
      lastName,
      country: 'India',
      phone: customer?.phone || ''
    };

    try {
      setSaving(true);

      let result;
      if (editingAddress) {
        result = await updateCustomerAddress(userToken, editingAddress.id, addressData);
      } else {
        result = await createCustomerAddress(userToken, addressData);
      }

      if (result.customerUserErrors?.length > 0) {
        Alert.alert('Error', result.customerUserErrors[0].message);
        return;
      }

      setModalVisible(false);
      resetForm();
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteCustomerAddress(userToken, addressId);
              if (result.customerUserErrors?.length > 0) {
                Alert.alert('Error', result.customerUserErrors[0].message);
                return;
              }
              loadAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      const result = await setDefaultAddress(userToken, addressId);
      if (result.customerUserErrors?.length > 0) {
        Alert.alert('Error', result.customerUserErrors[0].message);
        return;
      }
      setDefaultAddressId(addressId);
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const renderAddress = ({ item }) => {
    const address = item.node;
    const isDefault = address.id === defaultAddressId;

    return (
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <View style={styles.addressHeaderLeft}>
            {isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEditModal(address)}
            >
              <Ionicons name="pencil-outline" size={18} color="#16A34A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(address.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#d9534f" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.addressLine}>{address.address1}</Text>
        {address.address2 ? (
          <Text style={styles.addressLine}>{address.address2}</Text>
        ) : null}
        <Text style={styles.addressLine}>
          {address.city}, {address.province} - {address.zip}
        </Text>

        {!isDefault && (
          <TouchableOpacity
            style={styles.setDefaultBtn}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <ScreenHeader title="My Addresses" navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenHeader title="My Addresses" navigation={navigation} />

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.node.id}
        renderItem={renderAddress}
        contentContainerStyle={[styles.list, addresses.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="location-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No addresses saved</Text>
            <Text style={styles.emptySubtext}>Add an address for faster checkout</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <TouchableOpacity
                style={[styles.locationButton, gettingLocation && { opacity: 0.7 }]}
                onPress={handleUseCurrentLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <ActivityIndicator size="small" color="#16A34A" />
                ) : (
                  <Ionicons name="location" size={20} color="#16A34A" />
                )}
                <Text style={styles.locationButtonText}>
                  {gettingLocation ? 'Getting location...' : 'Use current location'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Address Line 1 *</Text>
              <TextInput
                style={styles.input}
                value={form.address1}
                onChangeText={(text) => setForm({ ...form, address1: text })}
                placeholder="Street address"
              />

              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                value={form.address2}
                onChangeText={(text) => setForm({ ...form, address2: text })}
                placeholder="Apartment, building, etc. (optional)"
              />

              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(text) => setForm({ ...form, city: text })}
                placeholder="City"
              />

              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={form.province}
                onChangeText={(text) => setForm({ ...form, province: text })}
                placeholder="State"
              />

              <Text style={styles.label}>PIN Code *</Text>
              <TextInput
                style={styles.input}
                value={form.zip}
                onChangeText={(text) => setForm({ ...form, zip: text })}
                placeholder="PIN code"
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff'
  },
  list: {
    padding: 16,
    paddingBottom: 100
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  addressHeaderLeft: {
    flex: 1
  },
  defaultBadge: {
    backgroundColor: '#16A34A20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  defaultText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  iconBtn: {
    padding: 4
  },
  addressLine: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2
  },
  setDefaultBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  setDefaultText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '500'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 4
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  formContainer: {
    padding: 16,
    maxHeight: 400
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 10,
    backgroundColor: '#16A34A10'
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15
  },
  saveButton: {
    backgroundColor: '#16A34A',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
