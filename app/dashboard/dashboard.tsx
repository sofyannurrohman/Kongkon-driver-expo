import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { View, Text, Alert, StyleSheet, Switch, Image } from "react-native";
import { useSelector } from "react-redux";
import io, { Socket } from 'socket.io-client';
import Navbar from '../../components/Navbar';
import { RootState } from "@/store";
import axiosInstance from "@/api/axiosInstance";
import { useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";
import { useWebSocket } from "@/socket/webSocketProvider";

const SOCKET_SERVER_URL = process.env.EXPO_PUBLIC_API_URL_SOCKET;

export default function Home() {
    const user = useSelector((state: RootState) => state.user.userInfo);
    const userId = user?.id;
    const [userDetail, setUserDetail] = useState(null)
    const socketRef = useRef<Socket | null>(null); // Use ref to store the socket instance
    const orderIdRef = useRef<number | null>(null); // Holds the latest order ID
    const [orderId, setOrderId] = useState<number | null>(null);
    const [isDriverActive, setIsDriverActive] = useState(false);
console.log(SOCKET_SERVER_URL);
    useEffect( () => {
        if (!userId) {return};
        const fetchUserDetails = async () => {
            try {
              const userResponse = await axiosInstance.get(`/users/${userId}`);
              const userData = userResponse.data.data;
              setUserDetail(userData);
            } catch (error) {
              console.error("Error fetching user details:", error);
              Alert.alert("Error", "Failed to fetch user details. Please try again.");
            }
          };
          fetchUserDetails();
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

    const handleOrderAssignment = useCallback((data: { orderId: number }) => {
        console.log('Received order assignment:', data);
        orderIdRef.current = data.orderId;
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
        const currentOrderId = orderIdRef.current;
        if (!currentOrderId) {
            console.error('Order ID is missing');
            return;
        }

        socket.emit('driverResponse', { driverId: userId, orderId:currentOrderId, accepted: response === 'accepted' }, (acknowledgment) => {
            if (acknowledgment?.error) {
                console.error('Error emitting driverResponse:', acknowledgment.error);
            } else {
                console.log('Acknowledgment received:', acknowledgment);
            }
        });

        console.log(`Sent response: ${response} for order ${currentOrderId}`);
        orderIdRef.current = null; // Clear ref after responding
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
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Navbar
                    profilePicture="https://via.placeholder.com/100"
                    name={userDetail?.name}
                    rating={4.8}
                    completedOrders={120}
                />
            ),
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIconContainer}>
                    <FontAwesome5 name="bars" size={24} color="#fff" />
                </TouchableOpacity>
            ),
            headerLeftContainerStyle: {
                paddingLeft: 10,
            },
        });
    }, [navigation]);

    return (
        <View className="flex-1 items-center p-5 bg-white">

            {/* Main dashboard content */}
            <Image
                source={require("../../assets/images/dashboard.png")}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
    menuIconContainer: {
        marginLeft: 10,
    },
    headerTitle: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
});