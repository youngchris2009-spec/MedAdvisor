import { StyleSheet, View, ScrollView } from 'react-native'
import {Text, TextInput, Button, Divider, Menu, Checkbox} from 'react-native-paper'
import React, {useState} from 'react'

const SignupScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);

  const conditions = [
    'None',
    'Diabetes',
    'High Blood Pressure',
    'High Cholesterol',
    'Heart Disease',
    'Asthma',
    'Kidney Disease',
    'Thyroid Disorder',
    'Arthritis',
    'Other',
  ];

const toggleCondition = (condition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(
        selectedConditions.filter(item => item !== condition)
      );
    } else {
      setSelectedConditions([
        ...selectedConditions,
        condition
      ]);
    }
  };

const displayValue =
  selectedConditions.length === 0
    ? 'None'
    : selectedConditions.length === 1
      ? selectedConditions[0]
      : `${selectedConditions.length} conditions selected`

  return (
    <View style={{marginTop:20, marginHorizontal:10}}>
      <View style={{marginBottom:5}}>
      <Text variant="headlineMedium">Create Your Profile</Text>
      <Text variant="bodyLarge" style={{margin:7}}>This information helps us provide {"\n"} personalized recommendations.</Text>
      </View>
      <Divider></Divider>
      <View style={{marginTop:5}}>
        <Text variant="labelLarge">Personal Information</Text>
        <TextInput mode = "outlined" style={{margin:1}} label="Full Name"/>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <TextInput mode = "outlined" style={{flex:1, margin:1}} label="Date of Birth"/>
          <TextInput mode = "outlined" style={{flex:1, margin:1}} label="Gender"/>
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <TextInput mode = "outlined" style={{flex:1, margin:1}} label="Height"/>
          <TextInput mode = "outlined" style={{flex:1, margin:1}} label="Weight"/>
        </View>
      </View>
      <View style={{marginTop:20}}>
        <Text variant="labelLarge">Health Information</Text>
        <TextInput mode = "outlined" style={{margin:1}} label="Alergies(if any)"/>
        {/* Medical Condition Dropdown */}
      <Menu
  visible={menuVisible}
  onDismiss={() => setMenuVisible(false)}
  contentStyle={{
    width: 320,
  }}
  anchor={
    <TextInput
      mode="outlined"
      label="Medical Conditions (if any)"
      value={displayValue}
      editable={false}
      onPressIn={() => setMenuVisible(true)}
      right={
        <TextInput.Icon
          icon={menuVisible ? 'chevron-up' : 'chevron-down'}
          onPress={() => setMenuVisible(!menuVisible)}
        />
      }
    />
  }
></Menu>

      </View>
    </View>
  )
}

export default SignupScreen

const styles = StyleSheet.create({})