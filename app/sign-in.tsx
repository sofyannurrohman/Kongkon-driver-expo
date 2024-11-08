import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/user/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      console.log("Sign-in function triggered");
      console.log("Email:", email, "Password:", password); // Log email and password

      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      console.log(response.data.data);
      const { access_token, user_id } = response.data.data;

      // Save to Redux
      dispatch(setUser({ token: access_token, userInfo: { id: user_id } }));

      // Optional: Save to AsyncStorage for persistence
      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userID", user_id);

      // Verify storage by retrieving
      const savedToken = await AsyncStorage.getItem("userToken");
      const savedUserID = await AsyncStorage.getItem("userID");

      console.log("Verified Token:", savedToken);
      console.log("Verified User ID:", savedUserID);

      // Navigate to the home screen
      router.replace("/dashboard");
    } catch (error) {
      Alert.alert("Login Failed", "Please check your credentials");
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-5">

      <View className="bg-white rounded-lg shadow-lg p-10 w-96">
        <View className="flex-row mb-10 justify-center">
          <Image
            source={require("../assets/images/logoSign.png")}
            className="w-full mr-5"
            style={{ width: 66, height: 72 }}// Set the width and height explicitly
            resizeMode="contain"
          />
          <View className="flex-col text-center justify-center">
            <Text className="text-2xl mb-2 font-comfortaa">Kongkon</Text>
            <Text className="text-2xl font-comfortaa">Partner</Text>
          </View>
        </View>

        <Text className="text-lg mb-5 font-poppins">Sign In to access</Text>
        <Text className="block text-md font-medium text-gray-700 mb-3">Email</Text>
        <TextInput
          placeholder="Please input your email"
          value={email}
          onChangeText={setEmail}
          className="w-full px-3 py-3 border border-gray-300 text-gray-400 rounded mb-6"
        />

        <Text className="block text-md font-medium text-gray-700 mb-3">Password</Text>
        <TextInput
          placeholder="Please input your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full px-3 py-3 border border-gray-300 text-gray-400 rounded mb-6"
        />
        <TouchableOpacity onPress={handleSignIn} className="bg-blue-500 p-4 rounded-full">
          <Text className="text-white text-center">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
