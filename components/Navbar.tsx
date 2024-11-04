// Navbar.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
interface NavbarProps {
    profilePicture: string;
    name: string;
    rating: number;
    completedOrders: number;
}

export default function Navbar({ profilePicture, name, rating, completedOrders }: NavbarProps) {
    return (
        <View className="flex-row justify-center space- items-center p-4 border-b border-gray-300 w-full">
            <View className='bg-red-700'>
            <Image
                source={{ uri: profilePicture }}
                className="w-16 h-16 rounded-full mr-4"
            />
            <View className="flex-row">
                <Text className="text-lg font-bold">{name}</Text>
                <Text className="text-gray-600">⭐ {rating} / 5.0</Text>
                <Text className="text-gray-600 text-sm">Completed Orders: {completedOrders}</Text>
            </View>
            </View>
            
        </View>
    );
}
