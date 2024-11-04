import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import store from "@/store";
import * as Font from "expo-font"; // Import expo-font
import '../global.css'; // Keep your global CSS import

// Function to load the custom font
const loadFonts = async () => {
  await Font.loadAsync({
    Poppins: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    Comfortaa: require('../assets/fonts/Comfortaa/static/Comfortaa-Bold.ttf'), 
  });
};

export default function Layout() {
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    const loadFontsAsync = async () => {
      await loadFonts();
      setIsFontLoaded(true);
    };

    loadFontsAsync();
  }, []);

  // Show a loading indicator until fonts are loaded
  if (!isFontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}

// Styles for loading indicator
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
