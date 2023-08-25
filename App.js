import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.67:8080';

const App = () => {
  const qrCodeScannerRef = useRef(null);
  const [scannedLink, setScannedLink] = useState("");
  const [generatedQRCodes, setGeneratedQRCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função utilitária para mostrar um erro comum com um Alert
  const showErrorAlert = (message) => {
    console.error('Error:', message);
    Alert.alert('Error', message);
  }

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
          showErrorAlert('Failed to send data to server for QR code generation');
        }
      } catch (error) {
        showErrorAlert('Failed to generate QR code. Please try again later.');
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
      const response = await axios.get(`${API_BASE_URL}/qrcodes`);
      setGeneratedQRCodes(response.data);
    } catch(error) {
        showErrorAlert('Failed to load generated QR codes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Text>{item}</Text>
  );

  return (
    <View style={styles.container}>
      <QRCodeScanner
        ref={qrCodeScannerRef}
        onRead={({ data }) => setScannedLink(data)} // Updates the link state when a QR Code is read
        flashMode={RNCamera.Constants.FlashMode.off}
        reactivateTimeout={1000}    
      />
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
          <FlatList 
            data={generatedQRCodes}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.qrCodesList}
          />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    maxHeight: 150, 
  },
});

export default App;
