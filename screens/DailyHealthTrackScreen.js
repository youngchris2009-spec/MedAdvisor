import { StyleSheet, View, FlatList, ScrollView  } from 'react-native'
import {Text, Button, Card, LeftContent, Divider, Icon }from 'react-native-paper'
import React from 'react'

const DailyHealthTrackScreen = () => {
    const vitals = [{name: 'Weight: ', vitals: '157 lbs', icon: 'scale-bathroom', color: 'navy'},
                    {name: 'Blood Pressure: ', vitals:'120/80 mmHg', icon: 'gauge', color: 'orange'},
                    {name: 'Blood Sugar: ', vitals:'98 mg/dL', icon: 'water', color: 'red'},
                    {name: 'Heart Rate: ', vitals:'72 bpm', icon: 'heart', color: 'red'}
    ]
    const mood = [{icon: 'emoticon-frown', color: 'red'},
                  {icon: 'emoticon-sad', color: 'orange'},
                  {icon: 'emoticon-neutral', color: 'gold'},
                  {icon: 'emoticon-happy', color: 'yellowgreen'},
                  {icon: 'emoticon', color: 'limegreen'}               
    ]
    const waterIntake =  [{icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'deepskyblue'},
                          {icon: 'cup-water', color: 'silver'},
                          {icon: 'cup-water', color: 'silver'}
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
     const renderMoodItem = ({item}) => (
      <View style={{marginVertical: '3'}}>
      <View style={{flexDirection:'row',  alignItems:'center', justifyContent: 'center', marginVertical: 3
      }}>
          <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
              <Icon source={item.icon} color = {item.color} size = {40} />
              <Text>{item.name}</Text>
          </View>
          <Text>{item.vitals}</Text>
          </View>
      </View>
   )
   const renderWaterIntakeItem = ({item}) => (
    <View style={{marginVertical: '3'}}>
    <View style={{flexDirection:'row', justifyContent: 'center',marginVertical: 3
    }}>
        <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
            <Icon source={item.icon} color = {item.color} size = {40} />
            <Text>{item.name}</Text>
        </View>
        <Text>{item.vitals}</Text>
        </View>
    </View>
 )
  return (
    <ScrollView style = {{margin:15}}>
    
    <Card style = {{marginBottom: 13}}>
    <Card.Title
      title="Vitals"
      left={LeftContent}
    />
      <Card.Content>
      <FlatList 
        data = {vitals}  
        renderItem = {renderVitalsItem} 
      />
    </Card.Content>
  </Card>

  <Card style = {{marginBottom: 13}}>
    
    <Card.Title
      title="Water Intake"
      left={LeftContent}
    />
      <Card.Content>
     
      <FlatList 
        horizontal
        contentContainerStyle = {{justifyContent:'space-evenly', flexGrow: 1}}
        data = {waterIntake}  
        renderItem = {renderWaterIntakeItem} 
      />
    </Card.Content>
  </Card>

<View style={{flexDirection:'row', flex: 1, justifyContent:'space-between' }}>


  <Card style = {{marginBottom: 13, flex:1, marginRight:9}}>
    <Card.Title
      title="Mood"
      left={LeftContent}
    />
      <Card.Content>
      <FlatList 
        horizontal
        contentContainerStyle = {{justifyContent:'space-evenly', flexGrow: 1}}
        data = {mood}  
        renderItem = {renderMoodItem} 
      />
    </Card.Content>
  </Card>
  
  <Card style = {{marginBottom: 13, flex:1}}>
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
    <Card.Title
      title="Excercise"
      left={LeftContent}
    />

    <Text style ={{marginRight: 20}} >
    32 of 45 min
    </Text>

    </View>

      <Card.Content>
      <FlatList 
        horizontal
        contentContainerStyle = {{justifyContent:'space-evenly', flexGrow: 1}}
        />

        <Icon
          source="run"
          color="limegreen"
          size={35}
        />

        <Text style={{
          fontSize: 20, fontWeight: 'bold'}} > 32 min
          </Text> 

  

        <View style={{
          height: 6,
          backgroundColor: 'lightgray',
          borderRadius: 5,
          marginTop: 10,
          marginBottom: 5
        }}>

        <View style={{
          height: 6,
          width: '71%',
          backgroundColor: 'palegreen',
          borderRadius: 5
        }} />
      </View> 
    </Card.Content>
  </Card>

  </View>

  <Card style = {{marginBottom: 13}}>
  <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
    <Card.Title
      title="Sleep"
      left={LeftContent}
    />
    <Text style ={{marginRight: 20}} >
    7 of 8 hours
    </Text>
    </View>
      <Card.Content>
      <Icon
          source="sleep"
          color="purple"
          size={35}
        />
        <Text style={{
          fontSize: 20, fontWeight: 'bold'}} > 7 hours
          </Text> 
      <View style={{
          height: 6,
          backgroundColor: 'lightgray',
          borderRadius: 5,
          marginTop: 10,
          marginBottom: 5
        }}>

        <View style={{
          height: 6,
          width: '71%',
          backgroundColor: 'purple',
          borderRadius: 5
        }} />
        </View>

    </Card.Content>
  </Card>
  
 
    </ScrollView>
  )
}

export default DailyHealthTrackScreen

const styles = StyleSheet.create({})

