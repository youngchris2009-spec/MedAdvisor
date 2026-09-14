import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Text, Card, SegmentedButtons, Icon, ActivityIndicator } from 'react-native-paper'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const HealthHabitRecommendationsScreen = ({ navigation }) => {

  const [category, setCategory] = useState('forYou')
  const [medications, setMedications] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loadingMedications, setLoadingMedications] = useState(true)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)


  // ---------------------------------------------
  // Get recommendations from OpenAI
  // ---------------------------------------------

  const getAIRecommendations = async (medicationData) => {

    try {

      setLoadingRecommendations(true)

      const medicationList = medicationData.map((medication) => ({
        name: medication.name || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        thingsToAvoid: medication.thingsToAvoid || [],
        bestWayToTake: medication.bestWayToTake || [],
        sideEffect: medication.sideEffect || [],
      }))

      console.log(
        'Sending medications:',
        JSON.stringify(medicationList, null, 2)
      )


      const response = await fetch(
        'https://api.openai.com/v1/responses',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },

          body: JSON.stringify({

            model: 'gpt-5.6-luna',

            input: `
You are a health habit recommendation assistant.

The user currently takes these medications:

${JSON.stringify(medicationList, null, 2)}

Create 4 to 6 personalized daily health habit recommendations.

VERY IMPORTANT:

Every recommendation must be measurable and something
the user can track every day.

Examples:

- Walk 30 minutes
- Exercise 30 minutes
- Drink 8 glasses of water
- Sleep 8 hours
- Eat 5 servings of fruits and vegetables
- Record blood pressure once daily
- Check blood sugar when appropriate
- Track medication adherence
- Track caffeine intake

Choose recommendations that make sense based on the
user's medications.

Rules:

- Do not tell the user to stop medication.
- Do not change medication dosage.
- Do not diagnose medical conditions.
- Do not replace instructions from a doctor or pharmacist.
- Do not invent medication instructions.
- Only recommend habits reasonably related to the medications.
- Every recommendation must have a numeric target.
- Every recommendation must have a unit.
- Keep recommendations simple.
- Keep descriptions short.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not use code blocks.

Use exactly this format:

[
  {
    "id": "1",
    "icon": "walk",
    "title": "Walk 30 Minutes Daily",
    "description": "Regular walking supports overall cardiovascular health.",
    "category": "exercise",
    "trackType": "minutes",
    "target": 30,
    "unit": "minutes"
  },
  {
    "id": "2",
    "icon": "cup-water",
    "title": "Drink 8 Glasses of Water",
    "description": "Stay hydrated throughout the day.",
    "category": "hydration",
    "trackType": "count",
    "target": 8,
    "unit": "glasses"
  }
]
            `,
          }),
        }
      )


      const data = await response.json()

      console.log(
        'OpenAI Response:',
        JSON.stringify(data, null, 2)
      )


      if (!response.ok) {

        throw new Error(
          data?.error?.message ||
          'Unable to generate recommendations.'
        )
      }


      const text = data.output
        ?.flatMap((item) => item.content || [])
        ?.find((item) => item.type === 'output_text')
        ?.text


      console.log('AI Text:', text)


      if (!text) {

        throw new Error(
          'OpenAI did not return recommendations.'
        )
      }


      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()


      const result = JSON.parse(cleanedText)


      if (!Array.isArray(result)) {

        throw new Error(
          'Invalid recommendation format.'
        )
      }


      setRecommendations(result)

    } catch (error) {

      console.error(
        'Recommendation Error:',
        error
      )

      Alert.alert(
        'Recommendation Error',
        error.message ||
        'Unable to generate recommendations.'
      )

    } finally {

      setLoadingRecommendations(false)
    }
  }



  // ---------------------------------------------
  // Get medications from Firebase
  // ---------------------------------------------

  useEffect(() => {

    const getMedications = async () => {

      try {

        setLoadingMedications(true)


        const medicationRef = collection(
          db,
          'medication'
        )


        const snapshot =
          await getDocs(medicationRef)


        const medicationData =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))


        console.log(
          'Medications:',
          medicationData
        )


        setMedications(medicationData)


        if (medicationData.length > 0) {

          await getAIRecommendations(
            medicationData
          )

        } else {

          setRecommendations([])
        }

      } catch (error) {

        console.error(
          'Firebase Error:',
          error
        )


        Alert.alert(
          'Error',
          'Unable to load medications.'
        )

      } finally {

        setLoadingMedications(false)
      }
    }


    getMedications()

  }, [])



  // ---------------------------------------------
  // Filter recommendations
  // ---------------------------------------------

  const displayedHabits =

    category === 'forYou'

      ? recommendations

      : recommendations



  const isLoading =
    loadingMedications ||
    loadingRecommendations



  // ---------------------------------------------
  // Open Daily Health Tracking
  // ---------------------------------------------

  const openHabit = (habit) => {

    console.log(
      'Selected Habit:',
      habit
    )


    navigation.navigate(
      'DailyHealthTrackScreen',
      {
        habit: habit,
      }
    )
  }



  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >


      {/* Header */}

      <View style={styles.header}>

        <Text
          variant="headlineMedium"
          style={styles.title}
        >
          Health Habits
        </Text>


        <Text
          variant="headlineMedium"
          style={styles.title}
        >
          Recommended for You
        </Text>


        <Text
          variant="bodyLarge"
          style={styles.subtitle}
        >
          Based on your medications
        </Text>

      </View>



      {/* Tabs */}

      <SegmentedButtons
        value={category}
        onValueChange={setCategory}

        buttons={[
          {
            value: 'forYou',
            label: 'For You',
          },
          {
            value: 'all',
            label: 'All Habits',
          },
        ]}

        style={styles.segmentedButtons}
      />



      {/* Loading */}

      {isLoading && (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
          />


          <Text style={styles.message}>

            {loadingMedications
              ? 'Creating recommendations...'
              : 'Creating recommendations...'}

          </Text>

        </View>

      )}



      {/* No Medications */}

      {!isLoading &&
        medications.length === 0 && (

          <Text style={styles.message}>
            No medications found.
          </Text>

        )}



      {/* Recommendations */}

      {!isLoading &&
        displayedHabits.length > 0 && (

          <View style={styles.habitList}>

            {displayedHabits.map((habit) => (

              <TouchableOpacity

                key={habit.id}

                activeOpacity={0.7}

                onPress={() =>
                  openHabit(habit)
                }

              >

                <Card style={styles.card}>

                  <Card.Content
                    style={styles.cardContent}
                  >


                    {/* Icon */}

                    <View
                      style={styles.iconContainer}
                    >

                      <Icon
                        source={
                          habit.icon ||
                          'heart-outline'
                        }
                        size={34}
                        color="#611F84"
                      />

                    </View>



                    {/* Recommendation */}

                    <View
                      style={styles.textContainer}
                    >

                      <Text
                        variant="titleMedium"
                        style={styles.habitTitle}
                      >
                        {habit.title}
                      </Text>


                      <Text
                        variant="bodyMedium"
                        style={styles.description}
                      >
                        {habit.description}
                      </Text>



                      {/* Goal */}

                      <View style={styles.goalRow}>

                        <Icon
                          source="target"
                          size={16}
                          color="#666"
                        />

                        <Text style={styles.goalText}>
                          Goal: {habit.target} {habit.unit}
                        </Text>

                      </View>

                    </View>



                    {/* Arrow */}

                    <Icon
                      source="chevron-right"
                      size={26}
                      color="#999"
                    />


                  </Card.Content>

                </Card>

              </TouchableOpacity>

            ))}

          </View>

        )}



      {/* No Recommendations */}

      {!isLoading &&
        medications.length > 0 &&
        recommendations.length === 0 && (

          <Text style={styles.message}>
            No recommendations found.
          </Text>

        )}

    </ScrollView>
  )
}


export default HealthHabitRecommendationsScreen



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 8,
    opacity: 0.65,
  },

  segmentedButtons: {
    marginBottom: 18,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },

  habitList: {
    gap: 12,
  },

  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F5FF',
    marginRight: 15,
  },

  textContainer: {
    flex: 1,
  },

  habitTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },

  description: {
    opacity: 0.65,
    lineHeight: 20,
  },

  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },

  goalText: {
    fontSize: 12,
    opacity: 0.65,
  },

  message: {
    textAlign: 'center',
    marginTop: 15,
    opacity: 0.6,
  },

})
