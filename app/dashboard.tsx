import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export default function Home() {
    // Access the userInfo object from Redux
    const user = useSelector((state: RootState) => state.user.userInfo);

    return (
        <View style={styles.container}>
            {/* Display the user ID or "Guest" if user is not logged in */}
            <Text style={styles.welcomeText}>
                Welcome, {user && user.id ? user.id : "Guest"}!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
