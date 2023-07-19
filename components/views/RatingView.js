import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

function RatingView( { rating, setRating } ) {
  return (
    <SafeAreaView style={styles.starContainer}>
        <Text style={{fontSize: 20, color: 'white'}}>My Rating: </Text>
        <TouchableOpacity onPress={()=>setRating(1)}><Icon name="star" size={30} color={rating > 0 ? '#c7f9cc' : 'white'} /></TouchableOpacity>
        <TouchableOpacity onPress={()=>setRating(2)}><Icon name="star" size={30} color={rating > 1 ? '#c7f9cc' : 'white'} /></TouchableOpacity>
        <TouchableOpacity onPress={()=>setRating(3)}><Icon name="star" size={30} color={rating > 2 ? '#c7f9cc' : 'white'} /></TouchableOpacity>
        <TouchableOpacity onPress={()=>setRating(4)}><Icon name="star" size={30} color={rating > 3 ? '#c7f9cc' : 'white'} /></TouchableOpacity>
        <TouchableOpacity onPress={()=>setRating(5)}><Icon name="star" size={30} color={rating > 4 ? '#c7f9cc' : 'white'} /></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
});

export default RatingView;
