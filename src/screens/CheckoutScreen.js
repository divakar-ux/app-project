import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createCheckout, associateCustomerWithCheckout } from '../api/shopify';
import ScreenHeader from '../components/ScreenHeader';

export default function CheckoutScreen({ route, navigation }) {
  const { cartItems, clearCart } = useContext(CartContext);
  const { userToken, customer } = useContext(AuthContext);

  const [submitting, setSubmitting] = useState(false);

  const totalFromRoute = route.params?.total ?? 0;

  const calculatedTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(
        item.node?.variants?.edges?.[0]?.node?.price?.amount || 0
      );
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const total = totalFromRoute || calculatedTotal;

  const placeOrder = async () => {
    if (!cartItems.length) {
      Alert.alert('Cart is empty', 'Add some items before checkout.');
      return;
    }

    if (!userToken) {
      Alert.alert(
        'Login Required',
        'Please login or create an account to proceed with checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => navigation.navigate('Login', { returnTo: 'checkout' })
          },
          { 
            text: 'Register', 
            onPress: () => navigation.navigate('Register')
          }
        ]
      );
      return;
    }

    try {
      setSubmitting(true);

      const result = await createCheckout(cartItems, customer?.email);

      if (result.checkoutUserErrors?.length > 0) {
        Alert.alert('Checkout Error', result.checkoutUserErrors[0].message);
        return;
      }

      if (!result.checkout?.webUrl) {
        Alert.alert('Error', 'Could not create checkout. Please try again.');
        return;
      }

      if (userToken && result.checkout?.id) {
        await associateCustomerWithCheckout(result.checkout.id, userToken);
      }

      const checkoutUrl = result.checkout.webUrl;

      navigation.navigate('Payment', { checkoutUrl });
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to create checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => {
    if (!item || !item.node) return null;

    const product = item.node;
    const price = product.variants?.edges?.[0]?.node?.price?.amount;
    const image = product.images?.edges?.[0]?.node?.url;

    return (
      <View style={styles.itemRow}>
        {image && (
          <Image source={{ uri: image }} style={styles.itemImage} />
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
        </View>
        {price && (
          <Text style={styles.itemPrice}>
            ₹ {(parseFloat(price) * item.quantity).toFixed(2)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScreenHeader title="Checkout" navigation={navigation} />

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No items in cart.
            </Text>
          }
          style={styles.itemsList}
        />

        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹ {total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.freeShipping}>FREE</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.placeOrderBtn, submitting && { opacity: 0.7 }]}
            onPress={placeOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="#fff" />
                <Text style={styles.placeOrderText}>Proceed to Payment</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secureNote}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.secureText}>Secure checkout powered by Shopify</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  itemsList: {
    maxHeight: 200
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  itemInfo: {
    flex: 1
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#16A34A',
    fontSize: 14
  },
  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666'
  },
  summaryValue: {
    fontSize: 14,
    color: '#333'
  },
  freeShipping: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A'
  },
  placeOrderBtn: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  secureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6
  }
});