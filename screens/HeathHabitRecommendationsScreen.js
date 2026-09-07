import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Card, SegmentedButtons } from 'react-native-paper'

const HealthHabitRecommendationsScreen = () => {

  const [category, setCategory] = useState('forYou')

  const habits = [
    {
      id: '1',
      icon: '🏃',
      title: 'Walk 30 Minutes Daily',
      description: 'Improve heart health and boost energy.',
      category: 'exercise',
    },
    {
      id: '2',
      icon: '💧',
      title: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated and support metabolism.',
      category: 'hydration',
    },
    {
      id: '3',
      icon: '🍎',
      title: 'Eat More Fruits & Veggies',
      description: 'Improve immunity and digestion.',
      category: 'diet',
    },
    {
      id: '4',
      icon: '🌙',
      title: '7–8 Hours of Sleep',
      description: 'Good sleep improves focus and mood.',
      category: 'sleep',
    },
    {
      id: '5',
      icon: '🍭',
      title: 'Reduce Sugar Intake',
      description: 'Helps in maintaining healthy weight.',
      category: 'diet',
    },
  ]

  const displayedHabits =
    category === 'forYou'
      ? habits
      : habits

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


      {/* Habit List */}

      <View style={styles.habitList}>

        {displayedHabits.map((habit) => (

          <TouchableOpacity
            key={habit.id}
            activeOpacity={0.7}
            onPress={() => {
              console.log(
                'Selected habit:',
                habit.title
              )
            }}
          >

            <Card style={styles.card}>

              <Card.Content style={styles.cardContent}>

                {/* Icon */}

                <View style={styles.iconContainer}>

                  <Text style={styles.icon}>
                    {habit.icon}
                  </Text>

                </View>


                {/* Text */}

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


  /* HEADER */

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


  /* TABS */

  segmentedButtons: {
    marginBottom: 18,
  },


  /* HABITS */

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


  /* ICON */

  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F5FF',
    marginRight: 15,
  },

  icon: {
    fontSize: 34,
  },


  /* TEXT */

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

})
