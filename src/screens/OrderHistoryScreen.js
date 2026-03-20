import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getCustomerOrders } from '../api/shopify';
import ScreenHeader from '../components/ScreenHeader';

export default function OrderHistoryScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!userToken) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerOrders(userToken);
      setOrders(data);
    } catch (e) {
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'refunded':
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const getFulfillmentIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'checkmark-circle';
      case 'partial':
        return 'ellipse-outline';
      default:
        return 'time-outline';
    }
  };

  const renderOrder = ({ item }) => {
    const order = item.node;
    const lineItems = order.lineItems?.edges || [];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.processedAt)}</Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>
              ₹ {parseFloat(order.totalPrice?.amount || 0).toFixed(2)}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.financialStatus) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.financialStatus) }]}>
                  {order.financialStatus || 'Pending'}
                </Text>
              </View>
              <Ionicons 
                name={getFulfillmentIcon(order.fulfillmentStatus)} 
                size={16} 
                color={order.fulfillmentStatus === 'FULFILLED' ? '#28a745' : '#666'} 
              />
            </View>
          </View>
        </View>

        <View style={styles.itemsList}>
          {lineItems.map((lineItem, index) => {
            const product = lineItem.node;
            const imageUrl = product.variant?.image?.url;

            return (
              <View key={index} style={styles.itemRow}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage]}>
                    <Ionicons name="cube-outline" size={20} color="#ccc" />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {product.quantity}</Text>
                </View>
                {product.variant?.price?.amount && (
                  <Text style={styles.itemPrice}>
                    ₹ {parseFloat(product.variant.price.amount).toFixed(2)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <ScreenHeader title="My Orders" navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={{ marginTop: 10 }}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <ScreenHeader title="My Orders" navigation={navigation} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadOrders}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenHeader title="My Orders" navigation={navigation} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.node?.id || Math.random().toString()}
        renderItem={renderOrder}
        contentContainerStyle={[styles.list, orders.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your completed orders will appear here</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff'
  },
  list: {
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  orderDate: {
    color: '#888',
    fontSize: 12
  },
  orderRight: {
    alignItems: 'flex-end'
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#16A34A',
    fontSize: 16,
    marginBottom: 4
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  itemsList: {
    marginTop: 4
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  itemQty: {
    color: '#888',
    fontSize: 12
  },
  itemPrice: {
    fontWeight: '600',
    color: '#16A34A',
    fontSize: 14
  },
  errorText: {
    color: '#d9534f',
    marginBottom: 10,
    textAlign: 'center'
  },
  retryBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 4
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center'
  },
  shopBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
