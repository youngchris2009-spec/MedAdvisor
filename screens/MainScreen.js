import React, { useEffect, useState } from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  Text,
  Card,
  ProgressBar,
  IconButton,
  Button,
  Divider,
} from 'react-native-paper';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';


// ======================================================
// HEALTH DASHBOARD
// ======================================================

const HealthDashboardScreen = () => {

  // ====================================================
  // USER DATA
  // ====================================================

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // ====================================================
  // GET USER FROM FIRESTORE
  // ====================================================

  useEffect(() => {

    const getUserData = async () => {

      try {

        const user = auth.currentUser;

        // No one is logged in
        if (!user) {
          setError('No user is currently logged in.');
          setLoading(false);
          return;
        }

        // Reference to:
        // users/{user.uid}

        const userRef = doc(
          db,
          'users',
          user.uid
        );

        // Get document
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {

          const data = userSnapshot.data();

          console.log('User data:', data);

          setUserData(data);

        } else {

          setError('User information was not found.');

        }

      } catch (error) {

        console.log(
          'Error getting user:',
          error
        );

        setError(
          'There was a problem loading your information.'
        );

      } finally {

        setLoading(false);

      }
    };


    getUserData();

  }, []);


  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#5B50E9"
        />

        <Text style={styles.loadingText}>
          Loading your health information...
        </Text>

      </View>
    );

  }


  // ====================================================
  // ERROR SCREEN
  // ====================================================

  if (error) {

    return (
      <View style={styles.errorContainer}>

        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

      </View>
    );

  }


  // ====================================================
  // USER INFORMATION
  // ====================================================

  const userName =
    userData?.name || 'User';

  const userWeight =
    userData?.weight
      ? `${userData.weight} lbs`
      : 'Not available';

  const userHeight =
    userData?.height
      ? `${userData.height} cm`
      : 'Not available';


  // ====================================================
  // TODAY'S OVERVIEW
  //
  // These are temporary values.
  // We can connect them to Firebase later.
  // ====================================================

  const overview = [

    {
      title: 'Medications',
      value: '1/3',
      subtitle: 'Taken',
      icon: 'pill',
      iconColor: '#25A9D6',
      background: '#EEF8FC',
    },

    {
      title: 'Steps',
      value: '6,245',
      subtitle: '',
      icon: 'walk',
      iconColor: '#477BE8',
      background: '#EEF3FF',
    },

    {
      title: 'Vitals',
      value: 'Good',
      subtitle:'',
      icon: 'heart',
      iconColor: '#8035A1',
      background: '#EDD7F7',
    },

  ];


  // ====================================================
  // SAMPLE MEDICATIONS
  //
  // We'll connect this to a medications collection later.
  // ====================================================

  const medications = [

    {
      time: '12:00 PM',
      name: 'Metformin 500mg',
      dosage: '1 Tablet',
    },

    {
      time: '08:00 PM',
      name: 'Vitamin D3 1000 IU',
      dosage: '1 Tablet',
    },

  ];


  // ====================================================
  // AI INSIGHTS
  //
  // These are temporary examples.
  // Later these can come from OpenAI.
  // ====================================================

  const insights = [

    {
      icon: 'auto-fix',
      title:
        'Great job hitting your step goal today!',
      text:
        'A 10 min walk after meals is a great habit.',
      background: '#EFFAF5',
      iconColor: '#35B87A',
    },

    {
      icon: 'lightbulb-outline',
      title:
        'Try drinking more water today.',
      text:
        "You're a bit below your daily goal.",
      background: '#FFF9EC',
      iconColor: '#F2A51A',
    },

    {
      icon: 'heart',
      title:
        'Consider adding more vegetables to your meals',
      text:
        'for better nutrition.',
      background: '#FFF2F0',
      iconColor: '#E95445',
    },

  ];


  // ====================================================
  // OVERVIEW CARD
  // ====================================================

  const OverviewCard = ({ item }) => (

    <View
      style={[
        styles.overviewCard,
        {
          backgroundColor:
            item.background,
        },
      ]}
    >

      <View
        style={[
          styles.smallIcon,
          {
            backgroundColor:
              `${item.iconColor}22`,
          },
        ]}
      >

        <IconButton
          icon={item.icon}
          iconColor={item.iconColor}
          size={17}
          style={styles.iconButton}
        />

      </View>


      <Text style={styles.overviewTitle}>
        {item.title}
      </Text>


      <Text
        style={[
          styles.overviewValue,
          {
            color: item.iconColor,
          },
        ]}
      >
        {item.value}
      </Text>


      {item.subtitle !== '' && (

        <Text style={styles.overviewSubtitle}>
          {item.subtitle}
        </Text>

      )}

    </View>

  );


  // ====================================================
  // SCREEN
  // ====================================================

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >


      {/* ==============================================
          HEADER
      ============================================== */}

      <View style={styles.header}>

        <View>

          <Text style={styles.greeting}>
            Hello, {userName} 👋
          </Text>

          <Text style={styles.subGreeting}>
            Here's your health summary
          </Text>

        </View>


        <IconButton
          icon="bell-outline"
          size={25}
          iconColor="#24324B"
        />

      </View>



      {/* ==============================================
          USER INFORMATION
      ============================================== */}

      <Card style={styles.userInfoCard}>

        <Card.Content>

          <Text style={styles.userInfoTitle}>
            Your Information
          </Text>

          <View style={styles.userInfoRow}>

            <View>
              <Text style={styles.userInfoLabel}>
                Weight
              </Text>

              <Text style={styles.userInfoValue}>
                {userWeight}
              </Text>
            </View>


            <View>
              <Text style={styles.userInfoLabel}>
                Height
              </Text>

              <Text style={styles.userInfoValue}>
                {userHeight}
              </Text>
            </View>


            <View>
              <Text style={styles.userInfoLabel}>
                Gender
              </Text>

              <Text style={styles.userInfoValue}>
                {userData?.gender || 'N/A'}
              </Text>
            </View>

          </View>

        </Card.Content>

      </Card>



      {/* ==============================================
          OVERALL STATUS
      ============================================== */}

      <Card style={styles.statusCard}>

        <Card.Content>

          <View style={styles.statusHeader}>

            <View style={styles.statusCircle}>

              <IconButton
                icon="check"
                iconColor="white"
                size={24}
                style={styles.iconButton}
              />

            </View>


            <View style={styles.statusTextContainer}>

              <Text style={styles.statusTitle}>
                You're on the right track! 🎯
              </Text>

              <Text style={styles.statusDescription}>
                Great job! You're making healthy
                choices and staying consistent.
              </Text>

            </View>


            <IconButton
              icon="chevron-right"
              size={22}
              iconColor="#69758A"
            />

          </View>



          {/* PROGRESS */}

          <View style={styles.progressHeader}>

            <Text style={styles.progressTitle}>
              Overall Progress Today
            </Text>

            <Text style={styles.progressPercentage}>
              78%
            </Text>

          </View>


          <ProgressBar
            progress={0.78}
            style={styles.progressBar}
          />


          <Text style={styles.progressMessage}>
            Keep going! You're almost there.
          </Text>

        </Card.Content>

      </Card>



      {/* ==============================================
          NEXT MEDICATION
      ============================================== */}

      <Text style={styles.sectionTitle}>
        Next Medication
      </Text>


      <Card style={styles.medicationCard}>

        <Card.Content>

          <View style={styles.medicationTop}>

            <View
              style={styles.medicationIconContainer}
            >

              <IconButton
                icon="pill"
                iconColor="#5C4FEF"
                size={25}
                style={styles.iconButton}
              />

            </View>


            <View style={styles.medicationInfo}>

              <Text style={styles.medicationName}>
                Aspirin 75mg
              </Text>

              <Text style={styles.medicationDosage}>
                1 Tablet
              </Text>

            </View>


            <View style={styles.timeBadge}>

              <Text style={styles.timeText}>
                09:00 AM
              </Text>

            </View>

          </View>


          <Button
            mode="contained"
            buttonColor="#5B50E9"
            textColor="white"
            style={styles.takeButton}
            contentStyle={
              styles.takeButtonContent
            }
          >
            Take Now
          </Button>

        </Card.Content>

      </Card>



      {/* ==============================================
          TODAY'S OVERVIEW
      ============================================== */}

      <Text style={styles.sectionTitle}>
        Today's Overview
      </Text>


      <View style={styles.overviewGrid}>

        {overview.map((item, index) => (

          <OverviewCard
            key={index}
            item={item}
          />

        ))}

      </View>



      {/* ==============================================
          UPCOMING REMINDERS
      ============================================== */}

      <Text style={styles.sectionTitle}>
        Upcoming Reminders
      </Text>


      <Card style={styles.reminderCard}>

        {medications.map(
          (medication, index) => (

            <View key={index}>

              <TouchableOpacity
                style={styles.reminderRow}
              >

                <Text style={styles.reminderTime}>
                  {medication.time}
                </Text>


                <View style={styles.reminderInfo}>

                  <Text style={styles.reminderName}>
                    {medication.name}
                  </Text>

                  <Text style={styles.reminderDosage}>
                    {medication.dosage}
                  </Text>

                </View>


                <IconButton
                  icon="chevron-right"
                  size={21}
                  iconColor="#657087"
                />

              </TouchableOpacity>


              {index <
                medications.length - 1 && (

                <Divider />

              )}

            </View>

          )
        )}

      </Card>



      {/* ==============================================
          HEALTH STATUS
      ============================================== */}

      <Card style={styles.healthStatusCard}>

        <Card.Content>

          <View style={styles.healthStatusHeader}>

            <View style={styles.healthCheck}>

              <IconButton
                icon="check"
                iconColor="white"
                size={22}
                style={styles.iconButton}
              />

            </View>


            <View style={{ flex: 1 }}>

              <Text
                style={styles.healthStatusTitle}
              >
                Health Status
              </Text>

              <Text
                style={styles.healthStatusGood}
              >
                Good
              </Text>

              <Text
                style={styles.healthStatusText}
              >
                You're doing great! Keep it up.
              </Text>

            </View>


            <IconButton
              icon="chevron-right"
              size={21}
              iconColor="#657087"
            />

          </View>


          <View style={styles.statsRow}>

            <Text style={styles.statText}>
              🔥 7 Day Streak
            </Text>

            <Text style={styles.dot}>
              •
            </Text>

            <Text style={styles.statText}>
              ⭐ 2 Goals Met Today
            </Text>

          </View>

        </Card.Content>

      </Card>



      {/* ==============================================
          AI INSIGHTS
      ============================================== */}

      <Text style={styles.sectionTitle}>
        AI Insights
      </Text>


      {insights.map(
        (insight, index) => (

          <View
            key={index}
            style={[
              styles.insightCard,
              {
                backgroundColor:
                  insight.background,
              },
            ]}
          >

            <View
              style={[
                styles.insightIcon,
                {
                  backgroundColor:
                    `${insight.iconColor}20`,
                },
              ]}
            >

              <IconButton
                icon={insight.icon}
                iconColor={
                  insight.iconColor
                }
                size={21}
                style={styles.iconButton}
              />

            </View>


            <View style={styles.insightText}>

              <Text
                style={styles.insightTitle}
              >
                {insight.title}
              </Text>

              <Text
                style={
                  styles.insightDescription
                }
              >
                {insight.text}
              </Text>

            </View>

          </View>

        )
      )}



      {/* ==============================================
          BOTTOM MESSAGE
      ============================================== */}

      <View style={styles.bottomMessage}>

        <Text
          style={styles.bottomMessageText}
        >
          🎯 Small daily actions lead to
          big long-term results!
        </Text>

      </View>


    </ScrollView>

  );

};


export default HealthDashboardScreen;



// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  // ====================================================
  // LOADING
  // ====================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#69758A',
  },


  // ====================================================
  // ERROR
  // ====================================================

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24324B',
    marginBottom: 10,
  },

  errorText: {
    fontSize: 14,
    color: '#69758A',
    textAlign: 'center',
  },


  // ====================================================
  // MAIN
  // ====================================================

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },


  // ====================================================
  // HEADER
  // ====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#24324B',
  },

  subGreeting: {
    fontSize: 13,
    color: '#8791A3',
    marginTop: 3,
  },


  // ====================================================
  // USER INFORMATION
  // ====================================================

  userInfoCard: {
    borderRadius: 15,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: '#E8EBF2',
    elevation: 0,
    marginBottom: 15,
  },

  userInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#24324B',
    marginBottom: 12,
  },

  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  userInfoLabel: {
    fontSize: 10,
    color: '#8791A3',
    marginBottom: 3,
  },

  userInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34415A',
  },


  // ====================================================
  // SECTION
  // ====================================================

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24324B',
    marginTop: 20,
    marginBottom: 10,
  },


  // ====================================================
  // OVERALL STATUS
  // ====================================================

  statusCard: {
    borderRadius: 15,
    backgroundColor: '#F1FBF7',
    borderWidth: 1,
    borderColor: '#D4EEE3',
    elevation: 0,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#45BD89',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  statusTitle: {
    color: '#31A975',
    fontSize: 14,
    fontWeight: '700',
  },

  statusDescription: {
    color: '#667286',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 7,
  },

  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#69758A',
  },

  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#32B77D',
  },

  progressBar: {
    height: 11,
    borderRadius: 10,
    backgroundColor: '#DDE5E4',
  },

  progressMessage: {
    textAlign: 'center',
    color: '#69758A',
    fontSize: 11,
    marginTop: 8,
  },


  // ====================================================
  // MEDICATION
  // ====================================================

  medicationCard: {
    borderRadius: 15,
    backgroundColor: '#F7F6FF',
    elevation: 0,
  },

  medicationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  medicationIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#ECEAFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  medicationInfo: {
    flex: 1,
    marginLeft: 10,
  },

  medicationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26334D',
  },

  medicationDosage: {
    fontSize: 12,
    color: '#7D8798',
    marginTop: 2,
  },

  timeBadge: {
    backgroundColor: '#ECEAFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  timeText: {
    fontSize: 11,
    color: '#5B50E9',
    fontWeight: '700',
  },

  takeButton: {
    marginTop: 13,
    borderRadius: 12,
  },

  takeButtonContent: {
    height: 35,
  },


  // ====================================================
  // OVERVIEW
  // ====================================================

  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  overviewCard: {
    width: '48.5%',
    minHeight: 100,
    borderRadius: 14,
    padding: 12,
    marginBottom: 9,
  },

  smallIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },

  iconButton: {
    margin: 0,
  },

  overviewTitle: {
    fontSize: 11,
    color: '#566176',
    fontWeight: '600',
  },

  overviewValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },

  overviewSubtitle: {
    fontSize: 10,
    color: '#69758A',
  },


  // ====================================================
  // REMINDERS
  // ====================================================

  reminderCard: {
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    elevation: 0,
  },

  reminderRow: {
    minHeight: 61,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  reminderTime: {
    width: 65,
    fontSize: 11,
    fontWeight: '700',
    color: '#34415A',
  },

  reminderInfo: {
    flex: 1,
  },

  reminderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#354159',
  },

  reminderDosage: {
    fontSize: 11,
    color: '#7A8496',
    marginTop: 2,
  },


  // ====================================================
  // HEALTH STATUS
  // ====================================================

  healthStatusCard: {
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: '#F1FBF7',
    elevation: 0,
  },

  healthStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  healthCheck: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#45BD89',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  healthStatusTitle: {
    fontSize: 11,
    color: '#687489',
  },

  healthStatusGood: {
    fontSize: 15,
    fontWeight: '800',
    color: '#31A975',
    marginTop: 1,
  },

  healthStatusText: {
    fontSize: 11,
    color: '#69758A',
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#556176',
  },

  dot: {
    marginHorizontal: 10,
    color: '#9CA5B4',
  },


  // ====================================================
  // AI INSIGHTS
  // ====================================================

  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    padding: 11,
    marginBottom: 8,
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  insightText: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#364157',
    lineHeight: 16,
  },

  insightDescription: {
    fontSize: 11,
    color: '#69758A',
    lineHeight: 15,
    marginTop: 2,
  },


  // ====================================================
  // BOTTOM
  // ====================================================

  bottomMessage: {
    marginTop: 15,
    backgroundColor: '#F3F0FF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },

  bottomMessageText: {
    color: '#5A50D6',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

});
