import React,{useState} from 'react';
import { TextInput, StyleSheet, Text, View ,Image} from 'react-native';
import StackNavigator from './navigation/StackNavigator';



export default function App() {
 
  return (
    <StackNavigator></StackNavigator>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  
});
