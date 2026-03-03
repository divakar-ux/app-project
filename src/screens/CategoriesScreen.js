import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  {
    title: "Best Sellers",
    handle: "best-selling-products",
    icon: "star-outline",
    color: "#FFD700"
  },
  {
    title: "Dehydrated Vegetables",
    handle: "dehydrated-vegetables",
    icon: "leaf-outline",
    color: "#4CAF50"
  },
  {
    title: "Dried Fruits",
    handle: "dried-fruits-no-sugar",
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
    title: "Sweets",
    handle: "sweets",
    icon: "ice-cream-outline",
    color: "#FF5722"
  },
  {
    title: "Jaggery Granules",
    handle: "jaggery-granules",
    icon: "cube-outline",
    color: "#795548"
  },
  {
    title: "Peanut Butter & Mixes",
    handle: "peanut-butter-healthy-instant-mixes",
    icon: "nutrition-outline",
    color: "#FF9800"
  },
  {
    title: "Combo Packs",
    handle: "healthy-vegetable-herbal-combo-packs",
    icon: "gift-outline",
    color: "#E91E63"
  },
  {
    title: "Bulk Fruits",
    handle: "bulk-fruits",
    icon: "basket-outline",
    color: "#FF6B6B"
  },
  {
    title: "Bulk Vegetables",
    handle: "bulk-vegetables",
    icon: "cart-outline",
    color: "#2ECC71"
  }
];

export default function CategoriesScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Shop by Category</Text>

      <View style={styles.grid}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              navigation.navigate('CollectionProducts', {
                handle: cat.handle,
                title: cat.title
              })
            }
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon} size={28} color={cat.color} />
            </View>
            <Text style={styles.cardTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7A5C2E',
    marginHorizontal: 16,
    marginBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between'
  },
  card: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333'
  }
});
