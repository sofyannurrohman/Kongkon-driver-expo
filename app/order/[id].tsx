import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/api/axiosInstance';

export default function OrderDetailScreen() {
    if (Platform.OS === 'web') {
        return <Text className="text-lg text-center">This feature is not available on the web.</Text>;
    }

    const route = useRoute();
    const { id } = route.params as { id: string };
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [merchantDetails, setMerchantDetails] = useState(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderResponse = await axiosInstance.get(`/orders/${id}`);
                const orderData = orderResponse.data.data;
                setOrderDetails(orderData);

                const merchantId = orderData.merchant_id;
                if (merchantId) {
                    // Fetch merchant details
                    const merchantResponse = await axiosInstance.get(`/merchants/${merchantId}`);
                    const merchantData = merchantResponse.data.data;
                    setMerchantDetails(merchantData);

                    const { coordinates } = merchantData.location;
                    const latitude = coordinates[1];
                    const longitude = coordinates[0];

                    // Reverse geocode to get address
                    const googleApiKey = '';
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
                    
                    const geocodeResponse = await axios.get(geocodeUrl);
                    if (geocodeResponse.data.status === 'OK') {
                        setAddress(geocodeResponse.data.results[0].formatted_address);
                    } else {
                        throw new Error("Failed to fetch address from coordinates");
                    }
                }
            } catch (error) {
                console.error('Error fetching order or merchant details:', error);
                setError('Failed to fetch order or merchant details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    const updateOrderStatus = async () => {
        try {
            await axiosInstance.post(`/partner/update-status`, {
                orderId: parseInt(id),
                status,
            });
            Alert.alert("Success", "Order status updated successfully");
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert("Error", "Failed to update order status. Please try again.");
        }
    };

    const completeOrder = async () => {
        try {
            await axiosInstance.post(`/api/v1/orders/${id}/completed`);
            Alert.alert("Success", "Order has been completed successfully");
        } catch (error) {
            console.error('Error completing order:', error);
            Alert.alert("Error", "Failed to complete order. Please try again.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 text-base">{error}</Text>
            </View>
        );
    }

    if (!orderDetails) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg">Order not found</Text>
            </View>
        );
    }

    const fromCoordinates = {
        latitude: orderDetails.from_location.coordinates[1],
        longitude: orderDetails.from_location.coordinates[0],
    };

    const toCoordinates = {
        latitude: orderDetails.to_location.coordinates[1],
        longitude: orderDetails.to_location.coordinates[0],
    };

    return (
        <View className="flex-1 p-4 bg-white">
            <View className="flex-row justify-center items-center p-4 border-b border-gray-300 w-full">
                <Text className='text-lg font-semibold'>Order Detail ID: {orderDetails.id}</Text>
            </View>
            
            {/* Map */}
            <MapView
                style={{ width: '100%', height: 300 }}
                initialRegion={{
                    ...fromCoordinates,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={fromCoordinates} title="From Location" />
                <Marker coordinate={toCoordinates} title="To Location" />
            </MapView>

            {/* Order Details */}
            <View className='p-5 rounded-2xl border-2 mt-10 border-gray-400'>
                <Text className="mb-2">Customer ID: {orderDetails.customer_id}</Text>
                <Text className="mb-2">Status: {orderDetails.status}</Text>
                <Text className="mb-2">Total Amount: ${orderDetails.total_amount.toFixed(2)}</Text>

                {/* Merchant Details */}
                {merchantDetails && (
                    <View className="mt-4">
                        <Text className="text-lg font-semibold">Merchant Information</Text>
                        <Text className="mb-2">Merchant Name: {merchantDetails.name}</Text>
                        <Text className="mb-2">Address: {address || 'Address not available'}</Text>
                    </View>
                )}

                {/* Update Order Status */}
                <View className='mt-4'>
                    <Text className="text-lg font-semibold">Update Order Status</Text>
                    <Picker
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                        style={{ height: 50, width: '100%' }}
                    >
                        <Picker.Item label="Select a status" value="" />
                        <Picker.Item label="Pending" value="Pending" />
                        <Picker.Item label="In Progress" value="In Progress" />
                        <Picker.Item label="Order has been sent to customer" value="Order has been sent to customer" />
                        <Picker.Item label="Cancelled" value="Cancelled" />
                    </Picker>

                    {/* Show "Complete Order" Button only when "Order has been sent to customer" is selected */}
                    {status === "Order has been sent to customer" && (
                        <TouchableOpacity onPress={completeOrder} className="bg-green-500 p-4 rounded-full mt-4">
                            <Text className='text-white text-center'>Complete Order</Text>
                        </TouchableOpacity>
                    )}

                    {/* Update Status Button */}
                    <TouchableOpacity onPress={updateOrderStatus} className="bg-blue-500 p-4 rounded-full mt-4">
                        <Text className='text-white text-center'>Update Status</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
