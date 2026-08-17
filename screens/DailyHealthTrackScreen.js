import { StyleSheet, View, FlatList  } from 'react-native'
import {Text, Button, Card, LeftContent, Divider, Icon }from 'react-native-paper'
import React from 'react'

const DailyHealthTrackScreen = () => {
    const vitals = [{name: 'Weight: ', vitals: '157 lbs', icon: 'scale-bathroom', color: 'navy'},
                    {name: 'Blood Pressure: ', vitals:'120/80 mmHg', icon: 'gauge', color: 'orange'},
                    {name: 'Blood Sugar: ', vitals:'98 mg/dL', icon: 'water', color: 'red'},
                    {name: 'Heart Rate: ', vitals:'72 bpm', icon: 'heart', color: 'red'}
    ]
    const renderVitalsItem = ({item}) => (
        <View style={{marginVertical: '3'}}>
        <View style={{flexDirection:'row', justifyContent: 'space-between', marginVertical: 3
        }}>
            <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
                <Icon source={item.icon} color = {item.color} size = {25} />
                <Text>{item.name}</Text>
            </View>
            <Text>{item.vitals}</Text>
            </View>
            <Divider
            style={{
                marginLeft: 40,
                marginRight: 10,
                opacity: 0.2
            }}
            />
        </View>
     )
  return (
    <View style={{margin:15}}>
    <Card>
    <Card.Title
      title="Vitals"
      left={LeftContent}
    />
      <Card.Content>
      <FlatList 
        data = {vitals}  
        renderItem={renderVitalsItem} 
      />
    </Card.Content>
  </Card>
  
    </View>
  )
}

export default DailyHealthTrackScreen

const styles = StyleSheet.create({})

