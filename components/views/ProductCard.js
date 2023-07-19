import {React, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Dimensions, Image, ImageBackground} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  var image = {uri: product.image};

  return (
    <View style={styles.container}> 
        <View style={styles.cardContent}>
            <View style={styles.cardImage}><Image style={{width:"90%", height: "100%", borderRadius: 5}} source={image} resizeMode='contain'/></View>
            <View style={styles.cardText}>
            <Text style={styles.cardHeader}>{product.name}</Text>
            <TouchableOpacity onPress={() => {}}>
                <View style={styles.cardMoretext}>
                  <Text style={{fontSize: 14, marginRight: '2%', color: 'black' }}>Show More</Text>
                  <Icon name="arrow-forward" size={18} color="#D4AF37" />
                </View>
            </TouchableOpacity>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "97%",
    height: 100,
    marginBottom: 10,
  },
  cardContent:{
    flex: 1,
    flexDirection: 'row',
    height: "100%",
    backgroundColor: "white",
    borderRadius: 5,
  },
  cardImage: {
    height: "85%",
    width: "40%",
    alignSelf: 'center',
    marginLeft: 5,
  },
  cardText: {
    paddingVertical: '3%',
    width: '50%',
  },
  cardHeader: {
    fontSize: 18,
    color: 'black',
    textTransform: 'capitalize'
  },
  cardMoretext: {
    marginTop: 10,
    flexDirection: 'row',
  },
});

export default ProductCard;
