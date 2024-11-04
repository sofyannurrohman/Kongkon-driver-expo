// // screens/order/[id].tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// import { useRoute } from '@react-navigation/native'; // or from Expo Router if you're using it
// import axios from 'axios';
// import MapView, { Marker } from 'react-native-maps';

// type OrderDetailProps = {
//     id: number;
//     customer_id: string;
//     partner_id: string;
//     status: string;
//     total_amount: number;
//     order_type: string;
//     work_date: string;
//     createdAt: Date;
//     updatedAt: Date;
//     from_location: {
//         coordinates: [number, number]; // Assuming from_location has coordinates
//     };
//     to_location: {
//         coordinates: [number, number]; // Assuming to_location has coordinates
//     };
//     merchant_id: string;
//     merchant_profit: number;
//     partner_profit: number;
//     cart_id: number;
// }

// export default function OrderDetailScreen() {
//     const route = useRoute();
//     const { id } = route.params as { id: string }; // Get the dynamic `id` from the route params
//     const [orderDetails, setOrderDetails] = useState<OrderDetailProps | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Fetch order details based on the order ID
//         const fetchOrderDetails = async () => {
//             try {
//                 const response = await axios.get(`http://192.168.100.246:3333/api/v1/orders/${id}`);
//                 console.log(response.data.data);
//                 setOrderDetails(response.data.data);
//             } catch (error) {
//                 console.error('Error fetching order details:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchOrderDetails();
//     }, [id]);

//     if (loading) {
//         return <ActivityIndicator size="large" color="#0000ff" />;
//     }

//     if (!orderDetails) {
//         return <Text>Order not found</Text>;
//     }

//     const fromCoordinates = {
//         latitude: orderDetails.from_location.coordinates[1], // Assuming coordinates are in [longitude, latitude] format
//         longitude: orderDetails.from_location.coordinates[0],
//     };

//     const toCoordinates = {
//         latitude: orderDetails.to_location.coordinates[1], // Assuming coordinates are in [longitude, latitude] format
//         longitude: orderDetails.to_location.coordinates[0],
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Order ID: {orderDetails.id}</Text>
//             <Text>Customer ID: {orderDetails.customer_id}</Text>
//             <Text>Status: {orderDetails.status}</Text>
//             <Text>Total Amount: {orderDetails.total_amount}</Text>
//             <Text>Order Type: {orderDetails.order_type}</Text>
//             <Text>Work Date: {orderDetails.work_date}</Text>

//             <MapView
//                 style={styles.map}
//                 initialRegion={{
//                     ...fromCoordinates,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                 }}
//             >
//                 <Marker coordinate={fromCoordinates} title="From Location" />
//                 <Marker coordinate={toCoordinates} title="To Location" />
//             </MapView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 10,
//     },
//     map: {
//         width: '100%',
//         height: '50%', // Adjust the height as needed
//     },
// });
