import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    clearCart,
    isLoading
  } = useContext(CartContext);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#7A5C2E" />
      </View>
    );
  }

  const totalPrice = (cartItems || []).reduce((sum, item) => {
    const price = parseFloat(
      item?.node?.variants?.edges?.[0]?.node?.price?.amount || 0
    );
    return sum + price * (item?.quantity || 0);
  }, 0);

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        {(cartItems || []).length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={22} color="#d9534f" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cartItems || []}
        keyExtractor={(item, index) => item?.node?.id || `cart-item-${index}`}
        contentContainerStyle={(cartItems || []).length === 0 && { flex: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          if (!item || !item.node) return null;

          const product = item.node;
          const image = product.images?.edges?.[0]?.node?.url;
          const price = product.variants?.edges?.[0]?.node?.price?.amount;

          if (!image) return null;

          return (
            <View style={styles.card}>
              <Image source={{ uri: image }} style={styles.image} />

              <View style={styles.cardContent}>
                <Text style={styles.name} numberOfLines={2}>{product.title}</Text>
                {price && <Text style={styles.price}>₹ {price}</Text>}

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => decreaseQty(product.id)}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="remove" size={16} color="#333" />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => increaseQty(product.id)}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="add" size={16} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {(cartItems || []).length > 0 && (
        <View style={styles.bottom}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {totalPrice.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout', { total: totalPrice })}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  shopBtn: {
    marginTop: 20,
    backgroundColor: '#7A5C2E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10
  },
  cardContent: {
    flex: 1,
    marginLeft: 12
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333'
  },
  price: {
    marginTop: 4,
    fontWeight: 'bold',
    color: '#7A5C2E'
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  qtyBtn: {
    backgroundColor: '#e0e0e0',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qtyText: {
    marginHorizontal: 16,
    fontWeight: 'bold',
    fontSize: 15
  },
  bottom: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  totalLabel: {
    fontSize: 16,
    color: '#666'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A5C2E'
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8
  }
});