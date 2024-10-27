import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/sign-in");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-[#3B1E54]">
      <Image source={require("../assets/images/Loreact-logogoSplash.png")} className="w-24 h-24" />
      <Text className="mt-5 text-xl text-white">Welcome to Kongkon Driver</Text>
    </View>
  );
}
