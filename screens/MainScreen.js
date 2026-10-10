import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, ProgressBar, IconButton, Button, Divider } from 'react-native-paper';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const USER_ID = 'YIuwbxGpb1OMWnNzOGiJgJsA1Fr1';

const MainScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [medications, setMedications] = useState([]);
  const [medicationsLoading, setMedicationsLoading] = useState(true);
  const [medicationError, setMedicationError] = useState('');
  const [takingMedication, setTakingMedication] = useState(false);
  const [currentDoseIndex, setCurrentDoseIndex] = useState(0);

  const convertTimeToMinutes = (time) => {
    if (!time) return 9999;

    try {
      const parts = String(time).trim().split(' ');

      if (parts.length >= 2) {
        const clock = parts[0];
        const period = parts[1].toUpperCase();
        let [hours, minutes] = clock.split(':').map(Number);

        if (Number.isNaN(hours)) return 9999;
        if (Number.isNaN(minutes)) minutes = 0;
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
      }

      const [hours, minutes] = String(time).split(':').map(Number);
      if (Number.isNaN(hours)) return 9999;

      return hours * 60 + (Number.isNaN(minutes) ? 0 : minutes);
    } catch {
      return 9999;
    }
  };

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    try {
      const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
      if (Number.isNaN(date.getTime())) return false;

      const today = new Date();

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    } catch {
      return false;
    }
  };

  const getUserData = async () => {
    try {
      setError(null);

      const snapshot = await getDoc(doc(db, 'users', USER_ID));

      if (snapshot.exists()) setUserData(snapshot.data());
      else setError('User information was not found.');
    } catch (err) {
      console.log('Error getting user:', err);
      setError('There was a problem loading your information.');
    } finally {
      setLoading(false);
    }
  };

  const getMedications = async () => {
    try {
      setMedicationsLoading(true);
      setMedicationError('');

      const q = query(collection(db, 'medication'), where('userID', '==', USER_ID));
      const snapshot = await getDocs(q);

      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      console.log('Medications:', list);
      setMedications(list);
      setCurrentDoseIndex(0);
    } catch (err) {
      console.log('Error loading medications:', err);
      setMedicationError('Could not load medications.');
    } finally {
      setMedicationsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
    getMedications();
  }, []);

  const scheduledDoses = useMemo(() => {
    const doses = [];

    medications.forEach(med => {
      let times = Array.isArray(med.time) ? med.time : med.time ? [med.time] : [];

      if (times.length === 0) {
        doses.push({
          medicationId: med.id,
          name: med.name || 'Medication',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          time: null,
          timeMinutes: 9999,
          medication: med,
        });
      }

      times.forEach(time => {
        doses.push({
          medicationId: med.id,
          name: med.name || 'Medication',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          time,
          timeMinutes: convertTimeToMinutes(time),
          medication: med,
        });
      });
    });

    return doses.sort((a, b) => a.timeMinutes - b.timeMinutes);
  }, [medications]);

  const dosesTakenToday = useMemo(() => {
    let count = 0;

    medications.forEach(med => {
      const logs = Array.isArray(med.medicationLog) ? med.medicationLog : [];
      logs.forEach(log => {
        if (isToday(log.dateTime)) count++;
      });
    });

    return count;
  }, [medications]);

  const currentDose = scheduledDoses[currentDoseIndex] || null;
  const totalDosesToday = scheduledDoses.length;
  const medicationProgress = totalDosesToday > 0 ? Math.min(dosesTakenToday / totalDosesToday, 1) : 0;

  const handleTakeMedication = async () => {
    if (!currentDose || takingMedication) return;

    try {
      setTakingMedication(true);
      setMedicationError('');

      const logEntry = {
        dateTime: new Date().toISOString(),
        dosage: currentDose.dosage,
        scheduledTime: currentDose.time,
      };

      await updateDoc(doc(db, 'medication', currentDose.medicationId), {
        medicationLog: arrayUnion(logEntry),
      });

      setMedications(previous =>
        previous.map(med =>
          med.id === currentDose.medicationId
            ? {
                ...med,
                medicationLog: [
                  ...(Array.isArray(med.medicationLog) ? med.medicationLog : []),
                  logEntry,
                ],
              }
            : med
        )
      );

      setCurrentDoseIndex(i => i + 1);
    } catch (err) {
      console.log('Error logging medication:', err);
      setMedicationError('Could not save medication. Please try again.');
    } finally {
      setTakingMedication(false);
    }
  };

  const userName = userData?.name || 'User';
  const userWeight = userData?.weight ? `${userData.weight} lbs` : 'Not available';
  const userHeight = userData?.height ? `${userData.height} cm` : 'Not available';

const overview = [
  {
    title: 'Medications',
    value: `${dosesTakenToday}/${totalDosesToday}`,
    subtitle: 'Taken',
    icon: 'pill',
    iconColor: '#25A9D6',
    background: '#EEF8FC',
    viewAll: true,
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
  subtitle: '',
  icon: 'heart',
  iconColor: '#8035A1',
  background: '#EDD7F7',
  route: 'Daily Health Track',
},
];

  const insights = [
    { icon: 'auto-fix', title: 'Great job hitting your step goal today!', text: 'A 10 min walk after meals is a great habit.', background: '#EFFAF5', iconColor: '#35B87A' },
    { icon: 'lightbulb-outline', title: 'Try drinking more water today.', text: "You're a bit below your daily goal.", background: '#FFF9EC', iconColor: '#F2A51A' },
    { icon: 'heart', title: 'Consider adding more vegetables to your meals', text: 'for better nutrition.', background: '#FFF2F0', iconColor: '#E95445' },
  ];

const OverviewCard = ({ item }) => (
  <View style={[styles.overviewCard, { backgroundColor: item.background }]}>
    <View style={[styles.smallIcon, { backgroundColor: `${item.iconColor}22` }]}>
      <IconButton icon={item.icon} iconColor={item.iconColor} size={17} style={styles.iconButton} />
    </View>

    <Text style={styles.overviewTitle}>{item.title}</Text>
    <Text style={[styles.overviewValue, { color: item.iconColor }]}>{item.value}</Text>

    <View style={styles.overviewBottomRow}>
      <Text style={styles.overviewSubtitle}>{item.subtitle}</Text>

      {item.viewAll && (
  <View style={styles.overviewViewAll}>

    <TouchableOpacity
      onPress={() => navigation.navigate('Add Medication')}
    >
      <Text style={styles.overviewAdd}>+ Add</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => navigation.navigate('Medication List')}
    >
      <Text style={styles.overviewViewAll}>View All</Text>
    </TouchableOpacity>

  </View>
)}
    </View>
  </View>
);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B50E9" />
        <Text style={styles.loadingText}>Loading your health information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <Text style={styles.subGreeting}>Here's your health summary</Text>
        </View>
        <IconButton icon="bell-outline" size={25} iconColor="#24324B" />
      </View>

      {/* USER INFO */}
      <Card style={styles.userInfoCard}>
        <Card.Content>
          <Text style={styles.userInfoTitle}>Your Information</Text>

          <View style={styles.userInfoRow}>
            <View>
              <Text style={styles.userInfoLabel}>Weight</Text>
              <Text style={styles.userInfoValue}>{userWeight}</Text>
            </View>

            <View>
              <Text style={styles.userInfoLabel}>Height</Text>
              <Text style={styles.userInfoValue}>{userHeight}</Text>
            </View>

            <View>
              <Text style={styles.userInfoLabel}>Gender</Text>
              <Text style={styles.userInfoValue}>{userData?.gender || 'N/A'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* STATUS */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <View style={styles.statusCircle}>
              <IconButton icon="check" iconColor="white" size={24} style={styles.iconButton} />
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>You're on the right track! 🎯</Text>
              <Text style={styles.statusDescription}>Great job! You're making healthy choices and staying consistent.</Text>
            </View>

            <IconButton icon="chevron-right" size={22} iconColor="#69758A" />
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Medication Progress Today</Text>
            <Text style={styles.progressPercentage}>{Math.round(medicationProgress * 100)}%</Text>
          </View>

          <ProgressBar progress={medicationProgress} style={styles.progressBar} />

          <Text style={styles.progressMessage}>
            {totalDosesToday === 0 ? 'No medication schedule found.' : `${dosesTakenToday} of ${totalDosesToday} doses taken today.`}
          </Text>
        </Card.Content>
      </Card>

      {/* NEXT MEDICATION */}
      <Text style={styles.sectionTitle}>Next Medication</Text>

      {medicationsLoading ? (
        <Card style={styles.medicationCard}>
          <Card.Content>
            <ActivityIndicator color="#5B50E9" />
            <Text style={styles.centerText}>Loading medications...</Text>
          </Card.Content>
        </Card>

      ) : medicationError !== '' && medications.length === 0 ? (
        <Card style={styles.medicationCard}>
          <Card.Content>
            <Text style={styles.medicationName}>Unable to load medication</Text>
            <Text style={styles.errorMedicationText}>{medicationError}</Text>
            <Button mode="outlined" style={styles.retryButton} onPress={getMedications}>Try Again</Button>
          </Card.Content>
        </Card>

      ) : scheduledDoses.length === 0 ? (
        <Card style={styles.medicationCard}>
          <Card.Content>
            <Text style={styles.medicationName}>No medications found</Text>
            <Text style={styles.medicationDosage}>Your medications will appear here.</Text>
          </Card.Content>
        </Card>

      ) : currentDoseIndex >= scheduledDoses.length ? (
        <Card style={styles.completedMedicationCard}>
          <Card.Content>
            <View style={styles.completedRow}>
              <View style={styles.completedCircle}>
                <IconButton icon="check" iconColor="white" size={22} style={styles.iconButton} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.medicationName}>All medications completed!</Text>
                <Text style={styles.medicationDosage}>You have gone through today's medication schedule.</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

      ) : (
        <Card style={styles.medicationCard}>
          <Card.Content>
            <View style={styles.medicationTop}>

              <View style={styles.medicationIconContainer}>
                <IconButton icon="pill" iconColor="#5C4FEF" size={25} style={styles.iconButton} />
              </View>

              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{currentDose.name}</Text>
                <Text style={styles.medicationDosage}>{currentDose.dosage}</Text>
                {currentDose.frequency ? <Text style={styles.medicationFrequency}>{currentDose.frequency}</Text> : null}
              </View>

              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{currentDose.time || 'No time'}</Text>
              </View>
            </View>

            {medicationError !== '' && <Text style={styles.errorMedicationText}>{medicationError}</Text>}

            <Button
              mode="contained"
              buttonColor="#5B50E9"
              textColor="white"
              style={styles.takeButton}
              contentStyle={styles.takeButtonContent}
              onPress={handleTakeMedication}
              loading={takingMedication}
              disabled={takingMedication}
            >
              {takingMedication ? 'Saving...' : 'Take Now'}
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* OVERVIEW */}
      <Text style={styles.sectionTitle}>Today's Overview</Text>

      <View style={styles.overviewGrid}>
        {overview.map((item, index) => <OverviewCard key={index} item={item} />)}
      </View>

      {/* REMINDERS */}
      <Text style={styles.sectionTitle}>Upcoming Reminders</Text>

      <Card style={styles.reminderCard}>
        {scheduledDoses.length === 0 ? (
          <View style={styles.emptyReminder}>
            <Text style={styles.emptyReminderText}>No medication reminders found.</Text>
          </View>
        ) : (
          scheduledDoses.map((dose, index) => (
            <View key={`${dose.medicationId}-${dose.time}-${index}`}>
              <TouchableOpacity style={styles.reminderRow}>
                <Text style={styles.reminderTime}>{dose.time || 'No time'}</Text>

                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderName}>{dose.name}</Text>
                  <Text style={styles.reminderDosage}>{dose.dosage}</Text>
                </View>

                <IconButton icon="chevron-right" size={21} iconColor="#657087" />
              </TouchableOpacity>

              {index < scheduledDoses.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>

      {/* HEALTH STATUS */}
      <TouchableOpacity onPress={() => navigation.navigate('Daily Health Track')}>
  <Card style={styles.healthStatusCard}>
    <Card.Content>
      <View style={styles.healthStatusHeader}>
        <View style={styles.healthCheck}>
          <IconButton icon="check" iconColor="white" size={22} style={styles.iconButton} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.healthStatusTitle}>Health Status</Text>
          <Text style={styles.healthStatusGood}>Good</Text>
          <Text style={styles.healthStatusText}>You're doing great! Keep it up.</Text>
        </View>

        <IconButton icon="chevron-right" size={21} iconColor="#657087" />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>🔥 7 Day Streak</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.statText}>⭐ 2 Goals Met Today</Text>
      </View>
    </Card.Content>
  </Card>
</TouchableOpacity>

      {/* AI INSIGHTS */}
      <Text style={styles.sectionTitle}>AI Insights</Text>

      {insights.map((insight, index) => (
        <View key={index} style={[styles.insightCard, { backgroundColor: insight.background }]}>
          <View style={[styles.insightIcon, { backgroundColor: `${insight.iconColor}20` }]}>
            <IconButton icon={insight.icon} iconColor={insight.iconColor} size={21} style={styles.iconButton} />
          </View>

          <View style={styles.insightText}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.text}</Text>
          </View>
        </View>
      ))}

      <View style={styles.bottomMessage}>
        <Text style={styles.bottomMessageText}>🎯 Small daily actions lead to big long-term results!</Text>
      </View>

    </ScrollView>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 15, fontSize: 14, color: '#69758A' },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#FFFFFF' },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#24324B', marginBottom: 10 },
  errorText: { fontSize: 14, color: '#69758A', textAlign: 'center' },
  errorMedicationText: { color: '#D64545', fontSize: 12, marginTop: 10 },
  centerText: { textAlign: 'center', marginTop: 10, color: '#69758A' },
  retryButton: { marginTop: 12 },

  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 30 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#24324B' },
  subGreeting: { fontSize: 13, color: '#8791A3', marginTop: 3 },

  userInfoCard: { borderRadius: 15, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: '#E8EBF2', elevation: 0, marginBottom: 15 },
  userInfoTitle: { fontSize: 14, fontWeight: '700', color: '#24324B', marginBottom: 12 },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  userInfoLabel: { fontSize: 10, color: '#8791A3', marginBottom: 3 },
  userInfoValue: { fontSize: 13, fontWeight: '700', color: '#34415A' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#24324B', marginTop: 20, marginBottom: 10 },

  statusCard: { borderRadius: 15, backgroundColor: '#F1FBF7', borderWidth: 1, borderColor: '#D4EEE3', elevation: 0 },
  statusHeader: { flexDirection: 'row', alignItems: 'center' },
  statusCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#45BD89', justifyContent: 'center', alignItems: 'center' },
  statusTextContainer: { flex: 1, marginLeft: 10 },
  statusTitle: { color: '#31A975', fontSize: 14, fontWeight: '700' },
  statusDescription: { color: '#667286', fontSize: 12, lineHeight: 17, marginTop: 3 },

  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 7 },
  progressTitle: { fontSize: 12, fontWeight: '600', color: '#69758A' },
  progressPercentage: { fontSize: 13, fontWeight: '700', color: '#32B77D' },
  progressBar: { height: 11, borderRadius: 10, backgroundColor: '#DDE5E4' },
  progressMessage: { textAlign: 'center', color: '#69758A', fontSize: 11, marginTop: 8 },

  medicationCard: { borderRadius: 15, backgroundColor: '#F7F6FF', elevation: 0 },
  completedMedicationCard: { borderRadius: 15, backgroundColor: '#F1FBF7', elevation: 0 },
  completedRow: { flexDirection: 'row', alignItems: 'center' },
  completedCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#45BD89', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  medicationTop: { flexDirection: 'row', alignItems: 'center' },
  medicationIconContainer: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#ECEAFF', justifyContent: 'center', alignItems: 'center' },
  medicationInfo: { flex: 1, marginLeft: 10 },
  medicationName: { fontSize: 14, fontWeight: '700', color: '#26334D' },
  medicationDosage: { fontSize: 12, color: '#7D8798', marginTop: 2 },
  medicationFrequency: { fontSize: 10, color: '#9A9FB0', marginTop: 2 },
  timeBadge: { backgroundColor: '#ECEAFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  timeText: { fontSize: 11, color: '#5B50E9', fontWeight: '700' },
  takeButton: { marginTop: 13, borderRadius: 12 },
  takeButtonContent: { height: 42 },

  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  overviewCard: { width: '48.5%', minHeight: 100, borderRadius: 14, padding: 12, marginBottom: 9 },
  smallIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  iconButton: { margin: 0 },
  overviewTitle: { fontSize: 11, color: '#566176', fontWeight: '600' },
  overviewValue: { fontSize: 17, fontWeight: '800', marginTop: 2 },
  overviewSubtitle: { fontSize: 10, color: '#69758A' },

  reminderCard: { borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8ECF2', elevation: 0 },
  reminderRow: { minHeight: 61, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  reminderTime: { width: 75, fontSize: 11, fontWeight: '700', color: '#34415A' },
  reminderInfo: { flex: 1 },
  reminderName: { fontSize: 12, fontWeight: '700', color: '#354159' },
  reminderDosage: { fontSize: 11, color: '#7A8496', marginTop: 2 },
  emptyReminder: { padding: 18, alignItems: 'center' },
  emptyReminderText: { fontSize: 12, color: '#7A8496' },

  healthStatusCard: { marginTop: 20, borderRadius: 15, backgroundColor: '#F1FBF7', elevation: 0 },
  healthStatusHeader: { flexDirection: 'row', alignItems: 'center' },
  healthCheck: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#45BD89', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  healthStatusTitle: { fontSize: 11, color: '#687489' },
  healthStatusGood: { fontSize: 15, fontWeight: '800', color: '#31A975', marginTop: 1 },
  healthStatusText: { fontSize: 11, color: '#69758A', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  statText: { fontSize: 11, fontWeight: '600', color: '#556176' },
  dot: { marginHorizontal: 10, color: '#9CA5B4' },

  insightCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 13, padding: 11, marginBottom: 8 },
  insightIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 11, fontWeight: '700', color: '#364157', lineHeight: 16 },
  insightDescription: { fontSize: 11, color: '#69758A', lineHeight: 15, marginTop: 2 },

  overviewBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  overviewViewAll: { fontSize: 10, fontWeight: '700', color: '#5B50E9' },
  overviewTouchable: { width: '48.5%' },

  bottomMessage: { marginTop: 15, backgroundColor: '#F3F0FF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center' },
  bottomMessageText: { color: '#5A50D6', fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
