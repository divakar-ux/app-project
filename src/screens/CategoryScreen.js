import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function CategoryScreen({ navigation }) {

  const categories = [
    { title: "Dried Vegetables", handle: "dried-vegetables" },
    { title: "Dried Leaves & Herbs", handle: "dried-leaves-herbs" },
    { title: "Peanut Butter & Instant Mixes", handle: "milk-mix-powder-rose-milk-badam-milk-peanut-butter" },
  ];

  return (
    <ScrollView style={styles.container}>
      {categories.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate('Collection', {
              handle: item.handle,
              title: item.title
            })
          }
        >
          <Text style={styles.text}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10
  },
  text: { fontSize: 16, fontWeight: 'bold' }
});