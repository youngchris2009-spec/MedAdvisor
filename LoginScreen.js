import { StyleSheet, Text, View, Image, Dimensions} from 'react-native'
import {Button, TextInput} from 'react-native-paper'
import React from 'react'

const LoginScreen = ({navigation}) => {
    const screenWidth = Dimensions.get('window').width;
        
  return (
    <View style={{flex:1,backgroundColor:'white', marginTop:20}}>
        <Image source={require("../assets/logo.png")} style={{width:screenWidth, height:screenWidth}}/>
        <View style={{margin:15}}>
            <TextInput mode = "outlined" style={{margin:10}} label="Email"/>
            <TextInput mode = "outlined" style={{margin:10}} label="Password" secureTextEntry/>
        </View>
      <View style={{flexDirection:'row', marginTop:80, justifyContent:'space-around'}}>
      <Button mode ="contained" style={{width:150}} onPress={() => navigation.navigate('Register')}>
        Login
      </Button>
      <Button mode ="contained" style={{width:150}} onPress={() => navigation.navigate('Register')}>
        Register
        </Button>
        </View>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})