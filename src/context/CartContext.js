import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'rengas_cart';
const WISHLIST_STORAGE_KEY = 'rengas_wishlist';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveCart(cartItems);
    }
  }, [cartItems, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveWishlist(wishlistItems);
    }
  }, [wishlistItems, isLoading]);

  const loadStoredData = async () => {
    try {
      const [storedCart, storedWishlist] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(WISHLIST_STORAGE_KEY)
      ]);

      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.log('Error loading cart/wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const saveWishlist = async (items) => {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log('Error saving wishlist:', error);
    }
  };

  const addToCart = (product) => {
    const existing = cartItems.find(
      item => item.node.id === product.node.id
    );

    if (existing) {
      setCartItems(prev =>
        prev.map(item =>
          item.node.id === product.node.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [
        ...prev,
        { ...product, quantity: 1 }
      ]);
    }
  };

  const increaseQty = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.node.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.node.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.node.id !== id));
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.log('Error clearing cart:', error);
    }
  };

  const addToWishlist = (product) => {
    const exists = wishlistItems.find(item => item.node.id === product.node.id);
    if (!exists) {
      setWishlistItems(prev => [...prev, product]);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(prev => prev.filter(item => item.node.id !== id));
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.node.id === id);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.node.id)) {
      removeFromWishlist(product.node.id);
    } else {
      addToWishlist(product);
    }
  };

  const moveToCartFromWishlist = (product) => {
    addToCart(product);
    removeFromWishlist(product.node.id);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        isLoading,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        moveToCartFromWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};