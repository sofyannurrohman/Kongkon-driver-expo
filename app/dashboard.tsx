import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Alert, Switch, Image } from "react-native";
import { useSelector } from "react-redux";
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { RootState } from "@/store";
import axiosInstance from "@/api/axiosInstance";

const SOCKET_SERVER_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Home() {
    const user = useSelector((state: RootState) => state.user.userInfo);
    const userId = user?.id;
    const socketRef = useRef<Socket | null>(null); // Use ref to store the socket instance
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isDriverActive, setIsDriverActive] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const socket = io(SOCKET_SERVER_URL, {
            query: { userId },
            transports: ['websocket'],
            timeout: 30000,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket; // Assign socket to ref

        socket.on('connect', () => {
            console.log('Connected to server:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        socket.on('connect_timeout', (timeout) => {
            console.error('Connection Timeout:', timeout);
        });

        socket.on('reconnect_attempt', (attempt) => {
            console.log('Reconnecting attempt:', attempt);
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
        });

        socket.on('orderAssignment', handleOrderAssignment);

        return () => {
            socket.off('orderAssignment', handleOrderAssignment);
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.disconnect();
            socketRef.current = null;
            console.log('Socket disconnected and listeners removed.');
        };
    }, [userId]);

    const handleOrderAssignment = useCallback((data: { orderId: string }) => {
        console.log('Received order assignment:', data);
        setOrderId(data.orderId);

        Alert.alert(
            'New Order Assignment',
            `You have been assigned to order ${data.orderId}`,
            [
                { text: 'Accept', onPress: () => handleResponse('accepted') },
                { text: 'Decline', onPress: () => handleResponse('declined') },
            ]
        );
    }, []);

    const handleResponse = (response: 'accepted' | 'declined') => {
        const socket = socketRef.current; // Access the socket from ref

        if (!socket || !socket.connected) {
            console.error('Socket is not connected');
            return;
        }
        console.log(orderId)
        if (!orderId) {
            console.error('Order ID is missing');
            return;
        }
    
        socket.emit('driverResponse', { driverId: userId, orderId, accepted: response === 'accepted' }, (acknowledgment) => {
            if (acknowledgment?.error) {
                console.error('Error emitting driverResponse:', acknowledgment.error);
            } else {
                console.log('Acknowledgment received:', acknowledgment);
            }
        });
    
        console.log(`Sent response: ${response} for order ${orderId}`);
        setOrderId(null); // Clear current order ID after responding
    };

    const handleStatusChange = async (value: boolean) => {
        setIsDriverActive(value);
        if (value) {
            try {
                const response = await axiosInstance.post(`/partner/location/${userId}`, {
                    latitude: 37.9421,
                    longitude: -122.3203,
                });
                console.log('Location updated successfully:', response.data);
            } catch (error) {
                console.error('Failed to update location:', error);
                Alert.alert('Error', 'Failed to update location. Please try again.');
            }
        }
    };

    return (
        <View className="flex-1 items-center p-5">
            {/* Navbar with hardcoded profile details */}
            <Navbar
                profilePicture="https://via.placeholder.com/100"
                name="John Doe"
                rating={4.8}
                completedOrders={120}
            />

            {/* Main dashboard content */}
            <Image
                source={require("../assets/images/dashboard.png")}
                className="mt-12"
                style={{ width: 300, height: 200 }}
                resizeMode="contain"
            />
            <Text className="text-gray-500 text-lg my-2">No incoming orders yet</Text>

            <Text className="text-2xl font-bold">
                {isDriverActive ? "Listening for orders..." : "Status: Not Active"}
            </Text>
            <Switch
                value={isDriverActive}
                onValueChange={handleStatusChange}
                className="my-4"
            />
        </View>
    );
}
