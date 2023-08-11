import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import SecureStorage from 'react-native-sensitive-info'; // Example secure storage library
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';
import QRCodeItem from './QRCodeItem'; // My QR code list item component

const API_BASE_URL = 'http://192.168.1.67:8080';

const App = () => {
  const qrCodeScannerRef = useRef(null);
  const [scannedLink, setScannedLink] = useState("");
  const [generatedQRCodes, setGeneratedQRCodes] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    loadGeneratedQRCodes();
  }, []);

  const processScannedLink = async () => {
    if (scannedLink) {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/qrcodes`, { data: scannedLink });
        if (response.status === 201) {
          console.log('Data sent to server for QR code generation');
          loadGeneratedQRCodes();
        } else {
          console.log('Failed to send data to server for QR code generation');
        }
      } catch (error) {
        console.error('Error sending data to server for QR code generation:', error);
        Alert.alert('Error', 'Failed to generate QR code. Please try again later.');
      } finally {
        setLoading(false);
        setScannedLink("");
        qrCodeScannerRef.current.reactivate();
      }
    }
  };

  const loadGeneratedQRCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://192.168.1.67:8080/qrcodes');
      setGeneratedQRCodes(response.data);
    } catch(error) {
        console.error('Error loading generated QR codes from server:', error);
        Alert.alert('Error', 'Failed to load generated QR codes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <QRCodeItem qrcode={item} />
  );

  // Store sensitive data securely
  const storeSensitiveData = async (key, value) => {
    await SecureStorage.setItem(key, value, {
      sharedPreferencesName: 'mySharedPrefs', // Android-specific
      keychainService: 'myKeychain' // iOS-specific
    });
  };

  // Retrive sensitive data securely
  const getSensitiveData = async (key) => {
    const value = await SecureStorage.getItem(key);
    return value;
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        ref={qrCodeScannerRef}
        onRead={({ data }) => setScannedLink(data)} // Updates the link state when a QR Code is read
        flashMode={RNCamera.Constants.FlashMode.off}
        reactivateTimeout={1000}    
      />
      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#0277BD" />}
        <View style={styles.topContent}>
          <Text>{scannedLink}</Text>
        </View>
        <View style={styles.bottomContent}>
          <TouchableOpacity
            onPress={processScannedLink}
            style={styles.processButton}
          >
            <Text style={styles.processButtonText}>Process QR Code</Text>
          </TouchableOpacity>
          <Text style={styles.qrCodesTitle}>QR Codes read:</Text>
          <ScrollView style={styles.qrCodesList}>
            {generatedQRCodes.map((qrcode, index) => (
              <Text key={index}>{qrcode}</Text>
            ))}
          </ScrollView>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    paddingHorizontal: 10, // Add horizontal padding
    paddingTop: 10, // Add top padding
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bottomContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  processButton: {
    padding: 12,
    backgroundColor: "#0277BD",
    marginTop: 20,
    alignSelf: "center",
  },
  processButtonText: {
    color: "#FFFFFF",
  },
  qrCodesTitle: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  qrCodesList: {
    maxHeight: 150, // Limit the height of the QR codes list
  },
});

export default App;
