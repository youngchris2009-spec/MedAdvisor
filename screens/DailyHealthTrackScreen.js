import { StyleSheet, View, FlatList, ScrollView,TextInput,Pressable  } from 'react-native'
import {Text, Button, Card, LeftContent, Divider, Icon }from 'react-native-paper'
import React, { useState } from 'react'

const DailyHealthTrackScreen = () => {

    const [weight, setWeight] = useState('157');
    const [bloodPressure, setBloodPressure] = useState('120/80');
    const [bloodSugar, setBloodSugar] = useState('98');
    const [heartRate, setHeartRate] = useState('72');

    const [exercise, setExercise] = useState('32');
    const [sleep, setSleep] = useState('7');
    const [waterIntake, setWaterIntake] = useState([true, true, true, true, true, true, false, false]);
    const [selectedMood, setSelectedMood] = useState(4);

    const vitals = [{name: 'Weight: ', vitals: weight, unit: 'lbs', icon: 'scale-bathroom', color: 'navy', setValue: setWeight},
                    {name: 'Blood Pressure: ', vitals:bloodPressure, unit: 'mmHg', icon: 'gauge', color: 'orange', setValue: setBloodPressure},
                    {name: 'Blood Sugar: ', vitals:bloodSugar, unit:' mg/dL', icon: 'water', color: 'red', setValue: setBloodSugar},
                    {name: 'Heart Rate: ', vitals:heartRate, unit:'bpm', icon: 'heart', color: 'red', setValue: setHeartRate}
    ]
    const mood = [{icon: 'emoticon-frown', color: 'red', label: 'Very Bad'},
                  {icon: 'emoticon-sad', color: 'orange', lable: 'Bad'},
                  {icon: 'emoticon-neutral', color: 'gold', label: 'Okay'},
                  {icon: 'emoticon-happy', color: 'yellowgreen', label:'Good'},
                  {icon: 'emoticon', color: 'limegreen', label:'Great'}               
    ]
    const waterCups = Array.from({ length: 8 });
                          
    
    const styles = StyleSheet.create({
      notesHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',},
      notesTitle: {
          fontWeight: '700',
          color: 'black',},
      notesInput: {
          backgroundColor: 'white',
          borderRadius: 12,
          minHeight: 60,},
  });
    const renderVitalsItem = ({item}) => (
        <View style={{marginVertical: '3'}}>
        <View style={{flexDirection:'row', justifyContent: 'space-between', marginVertical: 3
        }}>
            <View style={{flexDirection:'row', gap:16, alignItems:'center'}}>
                <Icon source={item.icon} color = {item.color} size = {25} />
                <Text>{item.name}</Text>
            </View>
            <TextInput
              value={item.vitals}
              onChangeText={item.setValue}
              keyboardType={
                  item.name === 'Blood Pressure: '
                      ? 'numbers-and-punctuation'
                      : 'numeric'
              }
              style={{
                  width: 100,
                  textAlign: 'right'
              }}
          />
              <View>
              <Text> {item.unit}</Text> 
              </View>
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
   const renderWaterIntakeItem = ({index}) => (
    <Pressable
        onPress={() => {
            setWaterIntake(prev => {
                const newWater = [...prev];
                newWater[index] = !newWater[index];
                return newWater;
            });
        }}
        style={{ marginHorizontal: 5 }}
    >
        <Icon
            source="cup-water"
            color={waterIntake[index] ? 'deepskyblue' : 'silver'}
            size={40}
        />
    </Pressable>
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

  <Card style={{marginBottom: 13}}>
    <Card.Title
        title="Water Intake"
        left={LeftContent}
    />

    <Card.Content>
        <FlatList
            horizontal
            contentContainerStyle={{
                justifyContent: 'space-evenly',
                flexGrow: 1
            }}
            data={waterCups}
            renderItem={renderWaterIntakeItem}
            
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

  <Card  style = {{marginBottom: 13}}>
    <Card.Content>
        <View style={styles.notesHeader}>
            <Text variant="titleMedium" style={styles.notesTitle}>
                Notes
            </Text>

        </View>

        <TextInput
            mode="flat"
            placeholder="Add any symptoms or notes"
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
        />
    </Card.Content>
</Card>

<Button  mode="contained" buttonColor='purple'> Save </Button>
 
    </ScrollView>
  )
}

export default DailyHealthTrackScreen

const styles = StyleSheet.create({})

