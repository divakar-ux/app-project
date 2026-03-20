import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import ScreenHeader from '../components/ScreenHeader';

export default function WishlistScreen({ navigation }) {
  const { wishlistItems, removeFromWishlist, moveToCartFromWishlist } = useContext(CartContext);

  const handleMoveToCart = (item) => {
    moveToCartFromWishlist(item);
    Alert.alert('Added to Cart', `${item.node.title} has been moved to your cart.`);
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove ${item.node.title} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWishlist(item.node.id)
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const product = item.node;
    const imageUrl = product.images?.edges?.[0]?.node?.url;
    const price = product.variants?.edges?.[0]?.node?.price?.amount;

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={30} color="#ccc" />
            </View>
          )}

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {product.title}
            </Text>
            {price && (
              <Text style={styles.itemPrice}>₹ {parseFloat(price).toFixed(2)}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleMoveToCart(item)}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#d9534f" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScreenHeader title="My Wishlist" navigation={navigation} />

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.node.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, wishlistItems.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={70} color="#E0BFA5" />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Save items you love by tapping the heart icon
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Browse Products</Text>
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
    backgroundColor: '#FFF8F2'
  },
  list: {
    padding: 16
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2E4D5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  placeholderImage: {
    backgroundColor: '#FFF2E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B4690E'
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    gap: 6
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  removeButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24
  },
  shopButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  }
});
