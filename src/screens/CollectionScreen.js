import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProductsByCollection } from '../api/shopify';
import { CartContext } from '../context/CartContext';
import ScreenHeader from '../components/ScreenHeader';

const SORT_OPTIONS = [
  { id: 'default', label: 'Default', icon: 'grid-outline' },
  { id: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up-outline' },
  { id: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down-outline' },
  { id: 'name_asc', label: 'Name: A to Z', icon: 'text-outline' },
  { id: 'name_desc', label: 'Name: Z to A', icon: 'text-outline' }
];

export default function CollectionScreen({ route, navigation }) {
  const { addToCart } = useContext(CartContext);

  const {
    handle = 'dried-vegetables',
    title = 'Dehydrated Vegetables'
  } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [handle]);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProductsByCollection(handle);
    setProducts(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getProductsByCollection(handle);
    setProducts(data);
    setRefreshing(false);
  };

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    const sorted = [...products];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.node?.variants?.edges?.[0]?.node?.price?.amount || 0);
          const priceB = parseFloat(b.node?.variants?.edges?.[0]?.node?.price?.amount || 0);
          return priceA - priceB;
        });
      case 'price_desc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.node?.variants?.edges?.[0]?.node?.price?.amount || 0);
          const priceB = parseFloat(b.node?.variants?.edges?.[0]?.node?.price?.amount || 0);
          return priceB - priceA;
        });
      case 'name_asc':
        return sorted.sort((a, b) => 
          (a.node?.title || '').localeCompare(b.node?.title || '')
        );
      case 'name_desc':
        return sorted.sort((a, b) => 
          (b.node?.title || '').localeCompare(a.node?.title || '')
        );
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const renderItem = ({ item }) => {
    if (!item || !item.node) return null;

    const product = item.node;
    const image =
      product.images?.edges?.[0]?.node?.url ||
      product.featuredImage?.url ||
      null;
    const price = product.variants?.edges?.[0]?.node?.price?.amount;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
          {price && <Text style={styles.price}>₹ {price}</Text>}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.id === sortBy)?.label || 'Sort';

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} navigation={navigation} />

      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>
          {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity 
          style={styles.sortBtn}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="funnel-outline" size={16} color="#16A34A" />
          <Text style={styles.sortBtnText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#16A34A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <FlatList
          data={sortedProducts}
          numColumns={2}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            colors={['#16A34A']}
            tintColor="#16A34A"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={sortBy === option.id ? '#16A34A' : '#666'} 
                />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.sortOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color="#16A34A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  resultCount: {
    fontSize: 13,
    color: '#666'
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ddd0'
  },
  sortBtnText: {
    fontSize: 13,
    color: '#16A34A',
    marginHorizontal: 6
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 10
  },
  row: {
    justifyContent: 'space-between'
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 140
  },
  imagePlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardContent: {
    padding: 10
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 8
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addBtnText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
    fontSize: 15
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
    paddingBottom: 30
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
    fontWeight: '600',
    color: '#333'
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  sortOptionActive: {
    backgroundColor: '#faf7f3'
  },
  sortOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12
  },
  sortOptionTextActive: {
    color: '#16A34A',
    fontWeight: '600'
  }
});