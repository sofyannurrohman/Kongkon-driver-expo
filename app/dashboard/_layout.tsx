import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// Import your screens
import HomeScreen from './dashboard';
import WalletScreen from './wallet';
import SettingsScreen from './setting';

// Your custom drawer content component
const CustomDrawerContent = ({ navigation }) => {
  // Example user data
  const user = {
    name: "John Doe",
    profilePicture: "https://example.com/path-to-your-image.jpg", // Example URL
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.drawerHeader}>
        {/* Profile Picture */}
        <Image
          source={{ uri: user.profilePicture }}
          style={styles.profileImage}
        />
        {/* Username */}
        <Text style={styles.userName}>{user.name}</Text>
      </View>

      {/* Drawer Menu Options */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.drawerItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Wallet")}>
        <Text style={styles.drawerItem}>Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.drawerItem}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const Drawer = createDrawerNavigator();

const DashboardLayout = () => {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Home" options={{ drawerLabel: ()=> null }}  component={HomeScreen} />
        <Drawer.Screen name="Wallet" component={WalletScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default DashboardLayout;

// Styles for the drawer content
const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B1E54',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerItem: {
    padding: 15,
    fontSize: 16,
  },
});
