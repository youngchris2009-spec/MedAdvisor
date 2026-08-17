import { StyleSheet, View,  } from 'react-native'
import {Text, Button, TextInput, Card, LeftContent, }from 'react-native-paper'
import React from 'react'

const DailyHealthTrackScreen = () => {
  return (
    <View style={{margin:10}}>
    <Card>
    <Card.Title
      title="Vitals"
      left={LeftContent}
    />
      <Card.Content>
      <Text variant="bodyMedium">Weight</Text>
    </Card.Content>
      <Button icon="scale-bathroom" mode="contained" onPress={() => console.log('Pressed')}>
  </Button>
  </Card>
    </View>
  )
}

export default DailyHealthTrackScreen

const styles = StyleSheet.create({})
