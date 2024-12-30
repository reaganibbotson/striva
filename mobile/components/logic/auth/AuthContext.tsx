import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the AuthContext
type AthleteData = {
  badge_type_id: number;
  bio: string;
  city: string;
  country: string;
  created_at: string;
  firstname: string;
  follower: null;
  friend: null;
  id: number;
  lastname: string;
  premium: boolean;
  profile: string;
  profile_medium: string;
  resource_state: number;
} | null

interface AuthContextType {
  userToken: string | null;
  athleteData: AthleteData
  signIn: (userToken: string, athleteData: AthleteData) => void;
  signOut: () => void;
}

// Create the Auth Context with a default value
export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  athleteData: null,
  signIn: (
    userToken: string, 
    athleteData: AthleteData
  ) => {},
  signOut: () => {},
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const router = useRouter();
  const [userToken, setUserToken] = useState<string | null>(null);
  const [athleteData, setAthleteData] = useState<AthleteData>(null);

  const signIn = (
    userToken: string,
    athleteData: AthleteData
  ) => {
    setUserToken(userToken)
    setAthleteData(athleteData)

    // Store the user token in secure storage
    SecureStore.setItemAsync('userToken', userToken)
    // Store the athlete data in async storage
    AsyncStorage.setItem('athleteData', JSON.stringify(athleteData))

    // Redirect to the main hub of the app
    router.replace("/(tabs)")
  }

  const signOut = () => {
    setUserToken(null);
    setAthleteData(null);

    // Remove the user token from secure storage
    SecureStore.deleteItemAsync('userToken')
    // Remove the athlete data from async storage
    AsyncStorage.removeItem('athleteData')

    // Redirect to the auth screen
    router.replace("/logout")
  }

  useEffect(() => {
    // Load the user token from secure storage
    SecureStore.getItemAsync('userToken').then((userToken) => {
      if (userToken) {
        setUserToken(userToken)
      }
    })

    // Load the athlete data from async storage
    AsyncStorage.getItem('athleteData').then((athleteData) => {
      if (athleteData) {
        setAthleteData(JSON.parse(athleteData))
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ userToken, athleteData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};