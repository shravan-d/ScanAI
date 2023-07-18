import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

function LandingScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={() =>navigation.navigate('CameraScreen')} >
            <View style={styles.buttonContainer}>
                <Icon name="scan" size={30} color="#c7f9cc" />
            </View>
            <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#c7f9cc'}}>Scan</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2b2d42',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#8d99ae',
        borderRadius: 10,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default LandingScreen;
