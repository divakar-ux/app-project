import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomer } from '../api/shopify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('shopify_access_token');
      const storedCustomer = await AsyncStorage.getItem('shopify_customer');

      if (storedToken) {
        const customerData = await getCustomer(storedToken);

        if (customerData) {
          setUserToken(storedToken);
          setCustomer(customerData);
        } else {
          await AsyncStorage.removeItem('shopify_access_token');
          await AsyncStorage.removeItem('shopify_customer');
        }
      }
    } catch (error) {
      console.log('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken, customerData) => {
    try {
      await AsyncStorage.setItem('shopify_access_token', accessToken);
      await AsyncStorage.setItem('shopify_customer', JSON.stringify(customerData));
      setUserToken(accessToken);
      setCustomer(customerData);
    } catch (error) {
      console.log('Error saving auth:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('shopify_access_token');
      await AsyncStorage.removeItem('shopify_customer');
      setUserToken(null);
      setCustomer(null);
    } catch (error) {
      console.log('Error clearing auth:', error);
    }
  };

  const updateCustomerData = async (newCustomerData) => {
    try {
      setCustomer(newCustomerData);
      await AsyncStorage.setItem('shopify_customer', JSON.stringify(newCustomerData));
    } catch (error) {
      console.log('Error updating customer data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, customer, login, logout, isLoading, updateCustomerData }}>
      {children}
    </AuthContext.Provider>
  );
};