import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';

export default function PaymentScreen({ route, navigation }) {
  const { checkoutUrl } = route.params || {};
  const { clearCart } = useContext(CartContext);
  const webViewRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    if (!checkoutUrl || hasError) return;
    const slowHintTimer = setTimeout(() => setShowSlowHint(true), 10000);
    const maxLoadingTimer = setTimeout(() => setLoading(false), 20000);
    return () => {
      clearTimeout(slowHintTimer);
      clearTimeout(maxLoadingTimer);
    };
  }, [checkoutUrl, hasError]);

  const handleNavigationChange = (navState) => {
    const url = navState.url;
    if (url.includes('/thank_you') || url.includes('thank-you') || url.includes('/orders/')) {
      clearCart();
      Alert.alert(
        'Order Placed!',
        'Thank you for your purchase. Your order has been confirmed.',
        [
          {
            text: 'Continue Shopping',
            onPress: () => {
              navigation.reset({ index: 0, routes: [{ name: 'CartMain' }] });
              navigation.getParent()?.getParent()?.navigate('Home');
            }
          }
        ]
      );
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setHasError(true);
    setLoading(false);
    if (nativeEvent.description?.includes('TIMED_OUT')) {
      setErrorMessage('Connection timed out. Please check your internet connection.');
    } else if (nativeEvent.description?.includes('NO_CONNECTION') || nativeEvent.description?.includes('INTERNET_DISCONNECTED')) {
      setErrorMessage('No internet connection. Please check your network.');
    } else {
      setErrorMessage('Unable to load checkout page. Please try again.');
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setShowSlowHint(false);
    setLoading(true);
    setErrorMessage('');
    webViewRef.current?.reload();
  };

  const handleOpenInBrowser = async () => {
    if (!checkoutUrl) return;
    try {
      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (canOpen) await Linking.openURL(checkoutUrl);
      else Alert.alert('Error', 'Cannot open browser');
    } catch (error) {
      Alert.alert('Error', 'Failed to open browser');
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel the payment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (!checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={60} color="#d9534f" />
          <Text style={styles.errorText}>Invalid checkout URL</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <TouchableOpacity onPress={handleOpenInBrowser} style={styles.browserBtn}>
          <Ionicons name="open-outline" size={20} color="#16A34A" />
        </TouchableOpacity>
      </View>

      {loading && !hasError && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loaderText}>Loading secure checkout...</Text>
          {showSlowHint && (
            <TouchableOpacity style={styles.slowHint} onPress={handleOpenInBrowser}>
              <Text style={styles.slowHintText}>Taking too long? Open in browser</Text>
              <Ionicons name="open-outline" size={16} color="#16A34A" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {hasError ? (
        <View style={styles.content}>
          <Ionicons name="cloud-offline-outline" size={70} color="#999" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.browserButton} onPress={handleOpenInBrowser}>
            <Ionicons name="open-outline" size={20} color="#16A34A" />
            <Text style={styles.browserButtonText}>Open in Browser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          cacheEnabled={true}
        />
      )}
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff'
  },
  closeBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  browserBtn: {
    padding: 4
  },
  webview: {
    flex: 1
  },
  loaderOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  loaderText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14
  },
  slowHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 8
  },
  slowHintText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '500'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    maxWidth: 280,
    justifyContent: 'center'
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  browserButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
    marginBottom: 12,
    width: '100%',
    maxWidth: 280,
    justifyContent: 'center'
  },
  browserButtonText: {
    color: '#16A34A',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  cancelButton: {
    paddingVertical: 14
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
