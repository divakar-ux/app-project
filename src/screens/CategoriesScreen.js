import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllCollections, getProductsByCollection } from '../api/shopify';

const categories = [
  {
    title: "Best Sellers",
    handle: "best-selling-products",
    icon: "star-outline",
    color: "#FFD700"
  },
  {
    title: "Dried Vegetables",
    handle: "dried-vegetables",
    icon: "leaf-outline",
    color: "#4CAF50"
  },
  {
    title: "Dried Fruits",
    handle: "dried-fruits",
    icon: "rose-outline",
    color: "#9C27B0"
  },
  {
    title: "Dried Herbs",
    handle: "dried-leaves-herbs",
    icon: "flower-outline",
    color: "#8BC34A"
  },
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
  {
    title: "Bulk Vegetables",
    handle: "bulk-dried-vegetables",
    icon: "cart-outline",
    color: "#2ECC71"
  }
];

export default function CategoriesScreen({ navigation }) {
  const [collectionImages, setCollectionImages] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllCollections();
        const map = {};
        data.forEach(({ node }) => {
          if (node.handle && node.imageUrl) map[node.handle] = node.imageUrl;
        });
        setCollectionImages((prev) => ({ ...prev, ...map }));

        // Fallback: fetch first product image for categories still missing images
        const missing = categories.filter((c) => !map[c.handle]);
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
    load();
  }, []);

  const renderItem = ({ item: cat, index }) => {
    const imageUrl = collectionImages[cat.handle];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('CollectionProducts', {
            handle: cat.handle,
            title: cat.title
          })
        }
      >
        <View style={[styles.imageWrap, { backgroundColor: cat.color + '15' }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.categoryImage} resizeMode="cover" />
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon} size={28} color={cat.color} />
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>{cat.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shop by Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.handle}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 12
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
    marginHorizontal: 16,
    marginBottom: 20
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center'
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryImage: {
    width: '100%',
    height: '100%'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333'
  }
});
