import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/components/logic/auth/AuthContext';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID as string
const REDIRECT_URI = AuthSession.makeRedirectUri({
    native: 'myapp://myapp.com',
});
const AUTHORIZATION_ENDPOINT = 'https://www.strava.com/oauth/mobile/authorize';

export default function LoginPage() {
    const router = useRouter();
    const { signIn, userToken, athleteData } = useContext(AuthContext);

    // Configure the authentication request
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            scopes: ['activity:read_all'],
            redirectUri: "myapp://myapp.com",
            responseType: 'code',
        },
        { authorizationEndpoint: AUTHORIZATION_ENDPOINT }
    );

    useEffect(() => {
        // If the user is already signed in, redirect to the (tabs) screen
        if (userToken) {
            // Redirect to the main hub of the app
            router.replace("/(tabs)")
        }
    }, [])

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            
            // Exchange the authorization code for an access token
            console.log('Exchanging code for token...');
            const tokenExchangeURL = `${process.env.EXPO_PUBLIC_STRIVA_API_URL}/auth/exchange-token`;
            fetch(
                tokenExchangeURL, 
                {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    signIn(data.access_token, data.athlete)
                })
                .catch((err) => console.error('Error fetching access token:', err));
        }
    }, [response]);

    return (
        <View style={styles.view}>
        <Button
            disabled={!request}
            title="Connect with Strava"
            onPress={() => promptAsync()}
        />
        {userToken && (
            <View>
                <Text>User Token: {userToken}</Text>
                <Text>Athlete: {JSON.stringify(athleteData)}</Text>
            </View>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    view: {
        padding: 20
    }
});