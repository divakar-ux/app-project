import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createCheckout, associateCustomerWithCheckout } from '../api/shopify';
import ScreenHeader from '../components/ScreenHeader';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const { addToCart, cartItems, isInWishlist, toggleWishlist } = useContext(CartContext);
  const { userToken, customer } = useContext(AuthContext);

  const product = route.params?.product;
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [buyingNow, setBuyingNow] = useState(false);
  const imageListRef = useRef(null);

  if (!product) {
    return (
      <View style={styles.wrapper}>
        <ScreenHeader title="Product" navigation={navigation} />
        <View style={styles.center}>
          <Text>Product not found.</Text>
        </View>
      </View>
    );
  }

  const productNode = product.node || product;
  const images = productNode.images?.edges?.map(edge => edge.node.url) || [];
  const mainImage = images[0];
  const price = productNode.variants?.edges?.[0]?.node?.price?.amount;
  const compareAtPrice = productNode.variants?.edges?.[0]?.node?.compareAtPrice?.amount;
  const productId = productNode.id;

  const cartItem = cartItems.find(item => item.node?.id === productId);
  const isInCart = !!cartItem;

  const wishlisted = isInWishlist(productId);

  const handleWishlistToggle = () => {
    const productData = product.node ? product : { node: product };
    toggleWishlist(productData);
  };

  const handleAddToCart = () => {
    const productData = product.node ? product : { node: product };
    for (let i = 0; i < quantity; i++) {
      addToCart(productData);
    }
    Alert.alert('Added to Cart', `${quantity} item(s) added to your cart`);
  };

  const handleBuyNow = async () => {
    if (!userToken) {
      Alert.alert(
        'Login Required',
        'Please login or create an account to buy this product.',
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

    const productData = product.node ? product : { node: product };
    
    const buyNowItem = {
      ...productData,
      quantity: quantity
    };

    setBuyingNow(true);

    try {
      const result = await createCheckout([buyNowItem], customer?.email);

      if (result.checkoutUserErrors?.length > 0) {
        Alert.alert('Error', result.checkoutUserErrors[0].message);
        return;
      }

      if (!result.checkout?.webUrl) {
        Alert.alert('Error', 'Could not create checkout. Please try again.');
        return;
      }

      if (userToken && result.checkout?.id) {
        await associateCustomerWithCheckout(result.checkout.id, userToken);
      }

      navigation.navigate('Cart', {
        screen: 'Payment',
        params: { checkoutUrl: result.checkout.webUrl }
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to process. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `Check out ${productNode.title} on Rengas!\n\n${price ? `Price: ₹${parseFloat(price).toFixed(2)}` : ''}\n\n${productNode.description ? productNode.description.substring(0, 100) + '...' : ''}`;

      await Share.share({
        message: shareMessage,
        title: productNode.title
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share product');
    }
  };

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const onImageScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
    setActiveImageIndex(slideIndex);
  };

  const selectImage = (index) => {
    setActiveImageIndex(index);
    imageListRef.current?.scrollToIndex({ index, animated: true });
  };

  return (
    <View style={styles.wrapper}>
      <ScreenHeader title="Product Details" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <FlatList
                ref={imageListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onImageScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.image} />
                )}
              />
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectImage(index)}
                    >
                      <View
                        style={[
                          styles.dot,
                          activeImageIndex === index && styles.activeDot
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
            </View>
          )}
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={22} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWishlistToggle}
            >
              <Ionicons
                name={wishlisted ? "heart" : "heart-outline"}
                size={24}
                color={wishlisted ? "#e74c3c" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
            {images.map((img, index) => (
              <TouchableOpacity key={index} onPress={() => selectImage(index)}>
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.thumbnail,
                    activeImageIndex === index && styles.thumbnailActive
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.title}>{productNode.title}</Text>

        <View style={styles.priceRow}>
          {price && (
            <Text style={styles.price}>₹ {parseFloat(price).toFixed(2)}</Text>
          )}
          {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
            <Text style={styles.comparePrice}>₹ {parseFloat(compareAtPrice).toFixed(2)}</Text>
          )}
          {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={decrementQty}>
              <Ionicons name="remove" size={20} color="#7A5C2E" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={incrementQty}>
              <Ionicons name="add" size={20} color="#7A5C2E" />
            </TouchableOpacity>
          </View>
        </View>

        {productNode.description && (
          <>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.description}>{productNode.description}</Text>
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              Add to Cart • ₹{(parseFloat(price || 0) * quantity).toFixed(2)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyNowButton, buyingNow && styles.buttonDisabled]}
            onPress={handleBuyNow}
            disabled={buyingNow}
          >
            {buyingNow ? (
              <ActivityIndicator color="#7A5C2E" />
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#7A5C2E" />
                <Text style={styles.buyNowText}>Buy Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isInCart && (
          <View style={styles.inCartBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.inCartText}>
              {cartItem.quantity} already in cart
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12
  },
  image: {
    width: width - 32,
    height: 300,
    borderRadius: 12
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20
  },
  thumbnailRow: {
    marginBottom: 16
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  thumbnailActive: {
    borderColor: '#7A5C2E'
  },
  imageActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A5C2E'
  },
  comparePrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10
  },
  discountBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10
  },
  discountText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold'
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333'
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24
  },
  buttonRow: {
    marginTop: 8,
    gap: 12
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  buyNowButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7A5C2E'
  },
  buyNowText: {
    color: '#7A5C2E',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  inCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8
  },
  inCartText: {
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500'
  }
});