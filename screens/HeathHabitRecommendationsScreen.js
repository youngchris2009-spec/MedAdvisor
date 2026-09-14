import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Card, SegmentedButtons, Icon } from 'react-native-paper'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const HealthHabitRecommendationsScreen = ( ) => {

  const [category, setCategory] = useState('forYou')
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)

  // Get medications from Firebase
  useEffect(() => {
    const getMedications = async () => {
      try {
        const medicationRef = collection(
          db,
  
          'medications'
        )

        const snapshot = await getDocs(medicationRef)

        const medicationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))

        setMedications(medicationData)
      } catch (error) {
        console.error('Error getting medications:', error)
      } finally {
        setLoading(false)
      }
    }


      getMedications()
  }, [])


  // Create recommendations based on medications
  const recommendations = medications.map((medication) => ({
    id: medication.id,
    icon: 'pill',
    color: '#611F84',
    title: `Take ${medication.name}`,
    description: `${medication.dosage} • ${medication.frequency}`,
    category: 'medication',
  }))


  const displayedHabits =
    category === 'forYou'
      ? recommendations
      : recommendations


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
          Based on your health profile
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

      {loading && (
        <Text style={styles.message}>
          Loading recommendations...
        </Text>
      )}


      {/* No medications */}

      {!loading && medications.length === 0 && (
        <Text style={styles.message}>
          No medications found.
        </Text>
      )}


      {/* Recommendations */}

      {!loading && (
        <View style={styles.habitList}>

          {displayedHabits.map((habit) => (

            <TouchableOpacity
              key={habit.id}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Selected:', habit.title)
              }}
            >

              <Card style={styles.card}>

                <Card.Content style={styles.cardContent}>

                  <View style={styles.iconContainer}>

                    <Icon
                      source={habit.icon}
                      size={34}
                      color={habit.color}
                    />

                  </View>


                  <View style={styles.textContainer}>

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

                  </View>

                </Card.Content>

              </Card>

            </TouchableOpacity>

          ))}

        </View>
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

  message: {
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.6,
  },

})
