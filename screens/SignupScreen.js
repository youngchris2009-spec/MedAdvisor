import { StyleSheet, View, ScrollView } from 'react-native'
import { Text, TextInput, Button, Divider, Menu, Checkbox } from 'react-native-paper'
import React, { useState } from 'react'

const SignupScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);

  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false)
  const [smokingMenuVisible, setSmokingMenuVisible] = useState(false)
  const [alcoholMenuVisible, setAlcoholMenuVisible] = useState(false)
  const [sleepMenuVisible, setSleepMenuVisible] = useState(false)
  const [dietMenuVisible, setDietMenuVisible] = useState(false)
  const [waterMenuVisible, setWaterMenuVisible] = useState(false)

  const [exercise, setExercise] = useState('')
  const [smoking, setSmoking] = useState('')
  const [alcohol, setAlcohol] = useState('')
  const [sleep, setSleep] = useState('')
  const [diet, setDiet] = useState('')
  const [water, setWater] = useState('')

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

  const exerciseOptions = [
    'Never',
    '1-2 times a week',
    '3-4 times a week',
    '5+ times a week',
    'Daily',
  ]

  const smokingOptions = [
    'Never',
    'Occasionally',
    'Daily',
    'Former smoker',
  ]

  const alcoholOptions = [
    'Never',
    'Occasionally',
    '1-2 times a week',
    '3-4 times a week',
    '5+ times a week',
  ]

  const sleepOptions = [
    "Less than 5 hours",
    "5–6 hours",
    "6–7 hours",
    "7–8 hours",
    "8–9 hours",
    "More than 9 hours",
  ];

  const dietOptions = [
    "Balanced",
    "Vegetarian",
    "Vegan",
    "High Protein",
    "Low Carb",
    "Other",
  ];

  const waterOptions = [
    "Less than 2 glasses",
    "2–4 glasses",
    "4–6 glasses",
    "6–8 glasses",
    "8–10 glasses",
    "More than 10 glasses",
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
    <ScrollView style={{ marginTop: 20, marginHorizontal: 10 }}>
      <View style={{ marginBottom: 5 }}>
        <Text variant="headlineMedium">Create Your Profile</Text>
        <Text variant="bodyLarge" style={{ margin: 7 }}>This information helps us provide {"\n"} personalized recommendations.</Text>
      </View>
      <Divider></Divider>
      <View style={{ marginTop: 5 }}>
        <Text variant="labelLarge">Personal Information</Text>
        <TextInput mode="outlined" style={{ margin: 1 }} label="Full Name" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput mode="outlined" style={{ flex: 1, margin: 1 }} label="Date of Birth" />
          <TextInput mode="outlined" style={{ flex: 1, margin: 1 }} label="Gender" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput mode="outlined" style={{ flex: 1, margin: 1 }} label="Height" />
          <TextInput mode="outlined" style={{ flex: 1, margin: 1 }} label="Weight" />
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        <Text variant="labelLarge">Health Information</Text>
        <TextInput mode="outlined" style={{ margin: 1 }} label="Alergies(if any)" />
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
                  icon={menuVisible ? "chevron-up" : "chevron-down"}
                  onPress={() => setMenuVisible(!menuVisible)}
                />
              }
            />
          }
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {conditions.map((condition) => (
              <Menu.Item
                key={condition}
                title={condition}
                leadingIcon={() => (
                  <Checkbox
                    status={
                      selectedConditions.includes(condition)
                        ? "checked"
                        : "unchecked"
                    }
                  />
                )}
                onPress={() => toggleCondition(condition)}
              />
            ))}
          </ScrollView>
        </Menu>

      </View>
      <View style={{ marginTop: 20 }}>

        <Text
          variant="labelLarge"
          style={{ marginBottom: 5 }}
        >
          Lifestyle Information
        </Text>


        {/* Exercise */}

        <Menu
          visible={exerciseMenuVisible}
          onDismiss={() =>
            setExerciseMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="How often do you exercise?"
              value={exercise}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setExerciseMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setExerciseMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {exerciseOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setExercise(option)
                setExerciseMenuVisible(false)
              }}
            />

          ))}

        </Menu>


        {/* Smoking */}

        <Menu
          visible={smokingMenuVisible}
          onDismiss={() =>
            setSmokingMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="Do you smoke or use tobacco?"
              value={smoking}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setSmokingMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setSmokingMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {smokingOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setSmoking(option)
                setSmokingMenuVisible(false)
              }}
            />

          ))}

        </Menu>


        {/* Alcohol */}

        <Menu
          visible={alcoholMenuVisible}
          onDismiss={() =>
            setAlcoholMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="How often do you drink alcohol?"
              value={alcohol}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setAlcoholMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setAlcoholMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {alcoholOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setAlcohol(option)
                setAlcoholMenuVisible(false)
              }}
            />

          ))}

        </Menu>

{/* Sleep */}

        <Menu
          visible={sleepMenuVisible}
          onDismiss={() =>
            setSleepMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="How much sleep do you get each night?"
              value={sleep}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setSleepMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setSleepMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {sleepOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setSleep(option)
                setSleepMenuVisible(false)
              }}
            />

          ))}

        </Menu>

{/* Diet */}

        <Menu
          visible={dietMenuVisible}
          onDismiss={() =>
            setDietMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="What is your diet?"
              value={sleep}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setDietMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setDietMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {dietOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setDiet(option)
                setDietMenuVisible(false)
              }}
            />

          ))}

        </Menu>

{/* Water */}

        <Menu
          visible={waterMenuVisible}
          onDismiss={() =>
            setWaterMenuVisible(false)
          }
          anchor={

            <TextInput
              mode="outlined"
              style={styles.input}
              label="How many glasses of water do you consume each day?"
              value={water}
              placeholder="Select"
              editable={false}
              onPressIn={() =>
                setWaterMenuVisible(true)
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() =>
                    setWaterMenuVisible(true)
                  }
                />
              }
            />

          }
        >

          {waterOptions.map(option => (

            <Menu.Item
              key={option}
              title={option}
              onPress={() => {
                setWater(option)
                setWaterMenuVisible(false)
              }}
            />

          ))}

        </Menu>

      </View>
    </ScrollView>
  )
}

export default SignupScreen

const styles = StyleSheet.create({})