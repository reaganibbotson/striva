import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AuthContext } from '@/components/logic/auth/AuthContext';

const AuthScreen = () => {

    const { signOut } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.stravaButton} onPress={signOut}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stravaButton: {
        backgroundColor: '#fc4c02',
        padding: 10,
        borderRadius: 5,
        width: 200,
        justifyContent: 'center',
        textAlign: 'center',
    },
    buttonText: {
        textAlign: 'center',
        width: '100%',
        color: '#fff',
        fontSize: 16,
    },
});

export default AuthScreen;