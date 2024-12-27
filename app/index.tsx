import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/components/logic/auth/AuthContext';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import LoginPage from '@/components/logic/auth/LoginPage';

export default function HomePage() {
    const router = useRouter();
    const { userToken } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If the user is already signed in, redirect to the (tabs) screen
        if (userToken) {
            // Redirect to the main hub of the app
            router.replace("/(tabs)");
        } 
        setIsLoading(false);
    }, [userToken]);

    if (isLoading) {
        return (
            <View style={styles.view}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <LoginPage />
    );
};

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});