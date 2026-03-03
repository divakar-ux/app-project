import React, { useState, useContext, useRef } from 'react';
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'CartMain' }],
              });
              navigation.navigate('Home');
            }
          }
        ]
      );
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
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
    setLoading(true);
    setErrorMessage('');
    webViewRef.current?.reload();
  };

  const handleOpenInBrowser = async () => {
    try {
      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (canOpen) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'Cannot open browser');
      }
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
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (!checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#d9534f" />
          <Text style={styles.errorText}>Invalid checkout URL</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
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
          <Ionicons name="open-outline" size={20} color="#7A5C2E" />
        </TouchableOpacity>
      </View>

      {loading && !hasError && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#7A5C2E" />
          <Text style={styles.loaderText}>Loading secure checkout...</Text>
        </View>
      )}

      {hasError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={70} color="#999" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.browserButton} onPress={handleOpenInBrowser}>
            <Ionicons name="open-outline" size={20} color="#7A5C2E" />
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
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('HTTP error:', nativeEvent.statusCode);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          cacheEnabled={true}
          incognito={false}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
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
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#7A5C2E',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
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
    borderColor: '#7A5C2E',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center'
  },
  browserButtonText: {
    color: '#7A5C2E',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 30
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16
  },
  backButton: {
    backgroundColor: '#7A5C2E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
