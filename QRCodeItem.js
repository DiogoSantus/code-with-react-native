import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QRCodeItem = ({ qrcode }) => {
    return (
        <View style={styles.container}>
            <Text>{qrcode}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default QRCodeItem;