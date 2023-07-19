import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import RatingView from '../views/RatingView';
import ProductCard from '../views/ProductCard';

function RatingScreen( { route } ) {
  const [rating, setRating] = useState(0);
  const { path } = route.params;

  const productList1 = [
    {name: 'Redragon Mouse Wired Gx631', image: 'https://m.media-amazon.com/images/I/61vF4LdktpL.__AC_SX300_SY300_QL70_FMwebp_.jpg'},
    {name: 'Redragon Mouse Wired J9', image: 'https://m.media-amazon.com/images/I/51UCF1KOnKL._AC_SS450_.jpg'},
    {name: 'Redragon Keyboard Wireless F2', image: 'https://images-na.ssl-images-amazon.com/images/I/715XLKbQnFL._AC_UL232_SR232,232_.jpg'},
  ]
  const productList2 = [
    {name: 'Razor Mouse DeathAdder', image: 'https://m.media-amazon.com/images/I/8189uwDnMkL._AC_SS450_.jpg'},
    {name: 'Logitech Mouse Wired G6', image: 'https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SS450_.jpg'},
  ]

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.cardHeader}>Redragon Mouse Wireless F23G7</Text>
        <View style={styles.imageContainer}>
            <Image source={{ uri: `file://${path}` }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </View>
        <RatingView rating={rating} setRating={setRating}/>
        {rating > 3 && 
            productList1.map((product, index) => (
                <ProductCard key={index} product={product} />
            ))}
        {rating > 0 && rating < 4 && 
            productList2.map((product, index) => (
                <ProductCard key={index} product={product} />
            ))   
        }
        
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2b2d42',
        width: '100%',
        height: '100%',
        alignItems: 'center'
    },
    imageContainer: {
        width: '90%',
        height: '40%',
        borderRadius: 5,
        overflow: 'hidden'
    },
    cardHeader: {
        fontSize: 20,
        color: 'white',
        marginVertical: '5%',
    },
});

export default RatingScreen;
