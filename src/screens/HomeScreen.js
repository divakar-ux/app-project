import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getProductsByCollection, getAllCollections } from '../api/shopify';

const HOME_COLLECTIONS = [
  { title: "Dried Vegetables", handle: "dried-vegetables", icon: "leaf-outline", color: "#4CAF50" },
  { title: "Dried Fruits", handle: "dried-fruits", icon: "rose-outline", color: "#9C27B0" },
  {
    title: "Peanut Butter & Mixes",
    handle: "milk-mix-powder-rose-milk-badam-milk-peanut-butter",
    icon: "nutrition-outline",
    color: "#FF9800"
  },
  {
    title: "Bulk Fruits",
    handle: "bulk-dried-fruits",
    icon: "basket-outline",
    color: "#FF6B6B"
  },
];
import { CartContext } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {

  const { cartItems, addToCart } = useContext(CartContext);

  const scrollY = useSharedValue(0);
  const testimonialRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [collectionImages, setCollectionImages] = useState({});

  const collections = HOME_COLLECTIONS;

  const reviews = [
    {
      id: "1",
      text: "I’ve tried many brands, but this jaggery is on another level. The sweetness feels so natural and clean — you can genuinely tell there are no chemicals added. The Badam Milk Mix has now become a must-have in our kitchen. It’s part of our everyday routine!",
      name: "Ananya R.",
      location: "Chennai"
    },
    {
      id: "2",
      text: "The grapes and whole bananas taste just like fresh fruit — naturally sweet, with no added sugar at all. It feels good to give my children something that’s pure and safe. The quality and care really show in the taste.",
      name: "Karthik S.",
      location: "Bengaluru"
    },
    {
      id: "3",
      text: "You can see the quality right from the packaging. The dried ladies finger and bitter gourd are so fresh and clean. I made crunchy low-oil chips for my children, and they couldn’t believe it was healthy! Finally, a snack option I can feel good about.",
      name: "Priya M.",
      location: "Mumbai"
    }
  ];

  useEffect(() => {
    loadFeatured();
    loadCollectionImages();
  }, []);

  const loadCollectionImages = async () => {
    try {
      const data = await getAllCollections();
      const map = {};
      data.forEach(({ node }) => {
        if (node.handle && node.imageUrl) map[node.handle] = node.imageUrl;
      });
      setCollectionImages((prev) => ({ ...prev, ...map }));

      // Fallback: fetch first product image for categories still missing images
      const missing = HOME_COLLECTIONS.filter((c) => !map[c.handle]);
      const results = await Promise.all(
        missing.map(async (cat) => {
          try {
            const products = await getProductsByCollection(cat.handle);
            const img = products?.[0]?.node?.images?.edges?.[0]?.node?.url;
            return img ? { handle: cat.handle, url: img } : null;
          } catch {
            return null;
          }
        })
      );
      const fallbackMap = {};
      results.forEach((r) => {
        if (r) fallbackMap[r.handle] = r.url;
      });
      setCollectionImages((prev) => ({ ...prev, ...fallbackMap }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % reviews.length;
      testimonialRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const loadFeatured = async () => {
    try {
      setLoadingFeatured(true);
      setFeaturedError(null);
      const data = await getProductsByCollection("best-selling-products");
      setFeaturedProducts(data.slice(0, 8));
    } catch (e) {
      setFeaturedError('Unable to load featured products. Please try again.');
    } finally {
      setLoadingFeatured(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [productsData, collectionsData] = await Promise.all([
        getProductsByCollection("best-selling-products"),
        getAllCollections()
      ]);
      setFeaturedProducts(productsData.slice(0, 8));
      const map = {};
      (collectionsData || []).forEach(({ node }) => {
        if (node?.handle && node?.imageUrl) map[node.handle] = node.imageUrl;
      });
      setCollectionImages((prev) => ({ ...prev, ...map }));
      // Fallback for missing images on refresh
      const missing = HOME_COLLECTIONS.filter((c) => !map[c.handle]);
      if (missing.length > 0) {
        const fallbacks = await Promise.all(
          missing.map(async (cat) => {
            try {
              const products = await getProductsByCollection(cat.handle);
              const img = products?.[0]?.node?.images?.edges?.[0]?.node?.url;
              return img ? { handle: cat.handle, url: img } : null;
            } catch { return null; }
          })
        );
        const fallbackMap = {};
        fallbacks.forEach((r) => { if (r) fallbackMap[r.handle] = r.url; });
        setCollectionImages((prev) => ({ ...prev, ...fallbackMap }));
      }
      setFeaturedError(null);
    } catch (e) {
      setFeaturedError('Unable to load products.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 120], [95, 70], Extrapolate.CLAMP);
    return { height };
  });

  return (
    <LinearGradient colors={['#ffffff', '#fffaf3']} style={{ flex: 1 }}>

      {/* HEADER */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <TouchableOpacity
          style={styles.searchBox}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={18} color="#777" />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View>
            <Ionicons name="cart-outline" size={24} color="#16A34A" />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16A34A']}
            tintColor="#16A34A"
          />
        }
      >

        {/* BANNER — tap opens Dried Vegetables collection */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() =>
            navigation.navigate('Collection', {
              handle: 'dried-vegetables',
              title: 'Dried Vegetables'
            })
          }
        >
          <Image
            source={require('../assets/banner1.jpg')}
            style={styles.banner}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* SHOP CATEGORIES */}
        <Text style={styles.sectionTitle}>Shop Categories</Text>

        <View style={styles.categoryGrid}>
          {collections.map((item, index) => {
            const imageUrl = collectionImages[item.handle];
            return (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('Collection', {
                    handle: item.handle,
                    title: item.title
                  })
                }
              >
                <View style={[styles.categoryImageWrap, { backgroundColor: item.color + '15' }]}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.categoryImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                  )}
                </View>
                <Text style={styles.categoryText}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.viewAllText}>View All Categories</Text>
          <Ionicons name="arrow-forward" size={16} color="#16A34A" />
        </TouchableOpacity>

        {/* FEATURED PRODUCTS - BEST SELLERS */}
        <Text style={styles.sectionTitle}>Best Sellers</Text>

        {loadingFeatured && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="small" color="#16A34A" />
            <Text style={styles.loaderText}>Loading products...</Text>
          </View>
        )}

        {featuredError && !loadingFeatured && (
          <Text style={styles.errorText}>{featuredError}</Text>
        )}

        {!loadingFeatured && !featuredError && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredProducts}
            keyExtractor={(item) => item.node.id}
            contentContainerStyle={{ paddingLeft: 15 }}
            renderItem={({ item }) => {
              if (!item || !item.node) return null;

              const product = item.node;
              const image = product.images?.edges?.[0]?.node?.url;
              const price = product.variants?.edges?.[0]?.node?.price?.amount;

              if (!image) return null;

              return (
                <View style={styles.productCard}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ProductDetails', { product: item })
                    }
                  >
                    <Image source={{ uri: image }} style={styles.productImage} />
                  </TouchableOpacity>

                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>

                  {price && (
                    <Text style={styles.productPrice}>₹ {price}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.addButtonText}>Add To Cart</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

        {/* DR RENGA'S PROMISE */}
        <Text style={styles.centerTitle}>Dr. Renga’s Promise</Text>
        <View style={styles.divider} />

        <View style={styles.promiseGrid}>
          <View style={styles.promiseCard}>
            <Text style={styles.promiseIcon}>☀️</Text>
            <Text style={styles.promiseHeading}>Solar Dried</Text>
            <Text style={styles.promiseSub}>Hybrid Solar-Drying Process</Text>
            <Text style={styles.promiseDesc}>
              Smart solar technology that seals in nutrients and enhances natural flavor.
            </Text>
          </View>

          <View style={styles.promiseCard}>
            <Text style={styles.promiseIcon}>🌿</Text>
            <Text style={styles.promiseHeading}>Ozone Washed</Text>
            <Text style={styles.promiseSub}>Advanced Cleaning Technology</Text>
            <Text style={styles.promiseDesc}>
              Powerful ozone purification for cleaner, safer, and truly chemical-free food.
            </Text>
          </View>

          <View style={styles.promiseCard}>
            <Text style={styles.promiseIcon}>🚜</Text>
            <Text style={styles.promiseHeading}>Farm Fresh</Text>
            <Text style={styles.promiseSub}>100-Acre Sustainable Farm</Text>
            <Text style={styles.promiseDesc}>
              Responsibly grown and carefully harvested from our eco-friendly farmland.
            </Text>
          </View>

          <View style={styles.promiseCard}>
            <Text style={styles.promiseIcon}>🥗</Text>
            <Text style={styles.promiseHeading}>Healthy</Text>
            <Text style={styles.promiseSub}>Nutrient-Rich & Pure</Text>
            <Text style={styles.promiseDesc}>
              Crafted to preserve real food value with purity you can trust.
            </Text>
          </View>
        </View>

        {/* TESTIMONIALS */}
        <Text style={styles.centerTitle}>
          Loved by Customers, Trusted for Quality
        </Text>
        <View style={styles.divider} />
        <Text style={styles.ratingText}>
          4.9 / 5 ⭐⭐⭐⭐⭐ (Based on 500+ Reviews)
        </Text>

        <FlatList
          ref={testimonialRef}
          data={reviews}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={{ marginBottom: 10 }}>⭐⭐⭐⭐⭐</Text>
              <Text>"{item.text}"</Text>
              <Text style={styles.reviewAuthor}>
                {item.name} • 📍 {item.location} • ✓ Verified
              </Text>
            </View>
          )}
        />

        <View style={styles.pagination}>
          {reviews.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              currentIndex === i && styles.activeDot
            ]}/>
          ))}
        </View>

      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 35,
    zIndex: 18,
    elevation: 18
  },

  logo: { height: 39, width: 90 },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    marginHorizontal: 10,
    paddingHorizontal: 9,
    borderRadius: 10,
    height: 34
  },

  searchPlaceholder: { flex: 1, marginLeft: 8, color: '#999', fontSize: 14 },

  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6
  },

  badgeText: { color: '#fff', fontSize: 10 },

  banner: { width: width, height: width * 0.32, marginTop: 95 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    marginLeft: 15,
    color: '#16A34A'
  },

  centerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#16A34A'
  },

  divider: {
    height: 2,
    width: 60,
    backgroundColor: '#16A34A',
    alignSelf: 'center',
    marginVertical: 10
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  categoryImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryImage: {
    width: '100%',
    height: '100%'
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },

  categoryText: { 
    fontWeight: '600',
    fontSize: 13,
    color: '#333'
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 8
  },

  viewAllText: {
    color: '#16A34A',
    fontWeight: '600',
    marginRight: 4
  },

  productCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 15,
    elevation: 4
  },

  productImage: { width: '100%', height: 150, borderRadius: 12 },

  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    height: 36
  },

  productPrice: { fontWeight: 'bold', marginTop: 4, color: '#16A34A', fontSize: 15 },

  addButton: {
    marginTop: 10,
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },

  addButtonText: { color: '#fff' },

  loaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10
  },

  loaderText: {
    marginLeft: 8,
    color: '#16A34A'
  },

  errorText: {
    color: 'red',
    marginLeft: 15,
    marginBottom: 10
  },

  promiseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  },

  promiseCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3
  },

  promiseIcon: { fontSize: 24 },

  promiseHeading: { fontWeight: 'bold', color: '#16A34A' },

  promiseSub: { fontSize: 13, fontWeight: '600', marginVertical: 4 },

  promiseDesc: { fontSize: 13, color: '#555' },

  ratingText: { textAlign: 'center', marginBottom: 15 },

  reviewCard: {
    width: width * 0.85,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    marginRight: 15,
    elevation: 4
  },

  reviewAuthor: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#16A34A'
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4
  },

  activeDot: {
    backgroundColor: '#16A34A',
    width: 16
  }

});