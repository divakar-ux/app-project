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
  const { userToken } = useContext(AuthContext);

  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    phone: ''
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
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      phone: ''
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setForm({
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || '',
      zip: address.zip || '',
      phone: address.phone || ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.address1.trim() || !form.city.trim() || !form.zip.trim()) {
      Alert.alert('Missing Fields', 'Please fill in address, city and PIN code.');
      return;
    }

    try {
      setSaving(true);

      let result;
      if (editingAddress) {
        result = await updateCustomerAddress(userToken, editingAddress.id, form);
      } else {
        result = await createCustomerAddress(userToken, form);
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
          <View style={styles.nameRow}>
            <Text style={styles.addressName}>
              {address.firstName} {address.lastName}
            </Text>
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
              <Ionicons name="pencil-outline" size={18} color="#7A5C2E" />
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
        {address.phone ? (
          <Text style={styles.phoneText}>Phone: {address.phone}</Text>
        ) : null}

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
          <ActivityIndicator size="large" color="#7A5C2E" />
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
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.firstName}
                    onChangeText={(text) => setForm({ ...form, firstName: text })}
                    placeholder="First name"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.lastName}
                    onChangeText={(text) => setForm({ ...form, lastName: text })}
                    placeholder="Last name"
                  />
                </View>
              </View>

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
                placeholder="Apartment, suite, etc. (optional)"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.city}
                    onChangeText={(text) => setForm({ ...form, city: text })}
                    placeholder="City"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    value={form.province}
                    onChangeText={(text) => setForm({ ...form, province: text })}
                    placeholder="State"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>PIN Code *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.zip}
                    onChangeText={(text) => setForm({ ...form, zip: text })}
                    placeholder="PIN code"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  defaultBadge: {
    backgroundColor: '#7A5C2E20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  defaultText: {
    color: '#7A5C2E',
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
  phoneText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4
  },
  setDefaultBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  setDefaultText: {
    color: '#7A5C2E',
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
    backgroundColor: '#7A5C2E',
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
    backgroundColor: '#7A5C2E',
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
