import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { searchProducts } from '../api/shopify';

const SEARCH_HISTORY_KEY = 'rengas_search_history';
const MAX_HISTORY = 10;

export default function SearchScreen({ navigation }) {
  const { addToCart } = useContext(CartContext);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error loading search history:', error);
    }
  };

  const saveToHistory = async (searchTerm) => {
    try {
      const updated = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, MAX_HISTORY);
      setSearchHistory(updated);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving search history:', error);
    }
  };

  const removeFromHistory = async (term) => {
    try {
      const updated = searchHistory.filter(h => h !== term);
      setSearchHistory(updated);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error removing from history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.log('Error clearing history:', error);
    }
  };

  const handleSearch = async (searchTerm) => {
    const term = (typeof searchTerm === 'string' ? searchTerm : query).trim();
    if (!term) return;

    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setQuery(term);

    try {
      const data = await searchProducts(term);
      setResults(data);
      saveToHistory(term);
    } catch (e) {
      console.log('Search error:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (!item || !item.node) return null;

    const product = item.node;
    const image = product.images?.edges?.[0]?.node?.url;
    const price = product.variants?.edges?.[0]?.node?.price?.amount;

    if (!image) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          {price && <Text style={styles.price}>₹ {price}</Text>}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="cart-outline" size={14} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7A5C2E" />
          <Text style={{ marginTop: 10 }}>Searching...</Text>
        </View>
      ) : !searched && searchHistory.length > 0 ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              onPress={() => handleSearch(term)}
            >
              <Ionicons name="time-outline" size={18} color="#999" />
              <Text style={styles.historyText}>{term}</Text>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromHistory(term)}
              >
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            searched ? (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No products found for "{query}"
                </Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  Search for products
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: {
    padding: 8
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    marginHorizontal: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 40
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15
  },
  searchBtn: {
    backgroundColor: '#7A5C2E',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
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
    height: 120
  },
  cardContent: {
    padding: 10
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7A5C2E',
    marginBottom: 8
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addBtnText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 11
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center'
  },
  historyContainer: {
    flex: 1,
    padding: 16
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  clearText: {
    fontSize: 14,
    color: '#7A5C2E',
    fontWeight: '500'
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12
  },
  removeBtn: {
    padding: 4
  }
});
