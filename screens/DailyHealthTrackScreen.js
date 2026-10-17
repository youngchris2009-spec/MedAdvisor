
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Text, Button, Card, Divider, Icon } from 'react-native-paper';
import { doc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const USER_ID = '12345';

const MOODS = [
    { icon: 'emoticon-frown', color: 'red', label: 'Very Bad' },
    { icon: 'emoticon-sad', color: 'orange', label: 'Bad' },
    { icon: 'emoticon-neutral', color: 'gold', label: 'Okay' },
    { icon: 'emoticon-happy', color: 'yellowgreen', label: 'Good' },
    { icon: 'emoticon', color: 'limegreen', label: 'Great' }
];

const DailyHealthTrackScreen = () => {

    const [weight, setWeight] = useState('');
    const [bloodPressure, setBloodPressure] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [heartRate, setHeartRate] = useState('');

    const [exercise, setExercise] = useState('');
    const [sleep, setSleep] = useState('');
    const [waterIntake, setWaterIntake] = useState(Array(8).fill(false));
    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const [foodName, setFoodName] = useState('');
    const [foodCalories, setFoodCalories] = useState('');
    const [foodEntries, setFoodEntries] = useState([]);

    const vitals = [
        { name: 'Weight', value: weight, unit: 'lbs', icon: 'scale-bathroom', color: 'navy', setValue: setWeight },
        { name: 'Blood Pressure', value: bloodPressure, unit: 'mmHg', icon: 'gauge', color: 'orange', setValue: setBloodPressure },
        { name: 'Blood Sugar', value: bloodSugar, unit: 'mg/dL', icon: 'water', color: 'red', setValue: setBloodSugar },
        { name: 'Heart Rate', value: heartRate, unit: 'bpm', icon: 'heart', color: 'red', setValue: setHeartRate }
    ];

    useEffect(() => {
        loadTodayHealthData();
    }, []);

    // -----------------------------------
    // Load Today's Health Data
    // -----------------------------------

    const loadTodayHealthData = async () => {
        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

            // dateTime is stored as an ISO string.
            const q = query(
                collection(db, 'dailyHealthTracking'),
                where('userID', '==', USER_ID),
                where('dateTime', '>=', startOfToday.toISOString()),
                where('dateTime', '<', startOfTomorrow.toISOString()),
                orderBy('dateTime', 'desc')
            );

            const snapshot = await getDocs(q);
            const latest = {};

            snapshot.forEach(snapshotDoc => {
                const data = snapshotDoc.data();
                if (!latest[data.name]) latest[data.name] = data;
            });

            setWeight(String(latest['Weight']?.vitals ?? ''));
            setBloodPressure(String(latest['Blood Pressure']?.vitals ?? ''));
            setBloodSugar(String(latest['Blood Sugar']?.vitals ?? ''));
            setHeartRate(String(latest['Heart Rate']?.vitals ?? ''));

            const savedMood = latest['Mood']?.vitals;
            const moodIndex = MOODS.findIndex(item => item.label === savedMood);
            const numericMood = Number(savedMood);

            setSelectedMood(
                moodIndex >= 0 ? moodIndex :
                savedMood !== undefined && savedMood !== null && savedMood !== '' &&
                Number.isInteger(numericMood) && numericMood >= 0 && numericMood < MOODS.length
                    ? numericMood : null
            );

            setNotes(String(latest['Notes']?.vitals ?? ''));

            // Load habit data saved in healthHabitRecommendation.
            const habitsQuery = query(
                collection(db, 'healthHabitRecommendation'),
                where('userID', '==', USER_ID)
            );

            const habitSnapshot = await getDocs(habitsQuery);
            const latestHabits = {};

            habitSnapshot.forEach(snapshotDoc => {
                const data = snapshotDoc.data();
                const entry = data.dailyHabitTraking;
                const date = entry?.dateTime;

                if (!date || date < startOfToday.toISOString() || date >= startOfTomorrow.toISOString()) return;

                if (!latestHabits[data.name] || date > latestHabits[data.name].dateTime) {
                    latestHabits[data.name] = entry;
                }
            });

            setExercise(String(latestHabits['Exercise']?.amount ?? ''));
            setSleep(String(latestHabits['Sleep']?.amount ?? ''));

            const cups = Math.min(8, Math.max(0, Number(latestHabits['Water']?.amount) || 0));
            setWaterIntake(Array.from({ length: 8 }, (_, index) => index < cups));

        } catch (error) {
            console.log('Error loading health data:', error);
        }
    };

    // -----------------------------------
    // Save Health Data
    // -----------------------------------

    const save = async () => {
        try {
            setSaving(true);

            const dateTime = new Date().toISOString();

            const healthTracking = [
                { name: 'Weight', vitals: weight, icon: 'scale-bathroom' },
                { name: 'Blood Pressure', vitals: bloodPressure, icon: 'gauge' },
                { name: 'Blood Sugar', vitals: bloodSugar, icon: 'water' },
                { name: 'Heart Rate', vitals: heartRate, icon: 'heart' },
                { name: 'Notes', vitals: notes, icon: 'note-text' }
            ];

            if (selectedMood !== null) {
                healthTracking.push({
                    name: 'Mood',
                    vitals: selectedMood,
                    icon: MOODS[selectedMood].icon
                });
            }

            for (const item of healthTracking) {
                const docID = `${USER_ID}_${item.name}_${dateTime}`;

                await setDoc(doc(db, 'dailyHealthTracking', docID), {
                    userID: USER_ID,
                    name: item.name,
                    vitals: item.vitals,
                    dateTime,
                    icon: item.icon
                });
            }

            const waterAmount = waterIntake.filter(Boolean).length;

            const habits = [
                { name: 'Water', detail: 'Drink water throughout the day', amount: waterAmount },
                { name: 'Exercise', detail: 'Daily physical activity', amount: exercise },
                { name: 'Sleep', detail: 'Hours of sleep', amount: sleep }
            ];

            for (const habit of habits) {
                const docID = `${USER_ID}_${habit.name}_${dateTime}`;

                await setDoc(doc(db, 'healthHabitRecommendation', docID), {
                    userID: USER_ID,
                    name: habit.name,
                    detail: habit.detail,
                    dailyHabitTraking: {
                        dateTime,
                        amount: habit.amount
                    }
                });
            }

            Alert.alert('Success', 'Health data saved successfully!');

        } catch (error) {
            console.error('Error saving health data:', error);
            Alert.alert('Error', 'Unable to save health data.');
        } finally {
            setSaving(false);
        }
    };

    // -----------------------------------
    // Render Vitals
    // -----------------------------------

    const renderVitalsItem = (item) => (
        <View key={item.name} style={{ marginVertical: 3 }}>
            <View style={styles.vitalRow}>
                <View style={styles.vitalLabel}>
                    <Icon source={item.icon} color={item.color} size={25} />
                    <Text style={styles.vitalName}>{item.name}</Text>
                </View>

                <View style={styles.vitalInputGroup}>
                    <TextInput
                        value={item.value}
                        onChangeText={item.setValue}
                        keyboardType={item.name === 'Blood Pressure' ? 'numbers-and-punctuation' : 'numeric'}
                        style={styles.vitalInput}
                        placeholder="--"
                    />
                    <Text style={styles.vitalUnit}>{item.unit}</Text>
                </View>
            </View>

            <Divider style={styles.divider} />
        </View>
    );

    // -----------------------------------
    // Render Mood
    // -----------------------------------

    const renderMoodItem = (item, index) => (
        <Pressable
            key={index}
            onPress={() => setSelectedMood(index)}
            style={styles.moodItem}
        >
            <View style={[
                styles.moodCircle,
                selectedMood === index && styles.moodSelected
            ]}>
                <Icon source={item.icon} color={item.color} size={25} />
            </View>

            <Text
                style={[
                    styles.moodLabel,
                    selectedMood === index && styles.moodLabelSelected
                ]}
                numberOfLines={1}
            >
                {item.label}
            </Text>
        </Pressable>
    );

    // -----------------------------------
    // Render Water Cups
    // -----------------------------------

    const renderWaterIntakeItem = (index) => (
        <Pressable
            key={index}
            onPress={() => {
                setWaterIntake(prev => {
                    const updated = [...prev];
                    updated[index] = !updated[index];
                    return updated;
                });
            }}
            style={styles.waterCup}
        >
            <Icon
                source="cup-water"
                color={waterIntake[index] ? 'deepskyblue' : 'silver'}
                size={32}
            />
        </Pressable>
    );

    const waterAmount = waterIntake.filter(Boolean).length;

    // -----------------------------------
    // Main Screen
    // -----------------------------------

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* VITALS */}
            <Card style={styles.card}>
                <Card.Title title="Vitals" left={() => <Icon source="heart-pulse" size={25} />} />

                <Card.Content>
                    <View>
                        {vitals.map(renderVitalsItem)}
                    </View>
                </Card.Content>
            </Card>

            {/* WATER INTAKE */}
            <Card style={styles.card}>
                <Card.Title
                    title="Water Intake"
                    subtitle={`${waterAmount} of 8 cups`}
                    left={() => <Icon source="water" size={25} />}
                />

                <Card.Content>
                    <View style={styles.waterRow}>
                        {Array.from({ length: 8 }, (_, index) => renderWaterIntakeItem(index))}
                    </View>
                </Card.Content>
            </Card>

            {/* MOOD AND EXERCISE */}
            <View style={styles.twoColumnRow}>

                {/* MOOD */}
                <Card style={styles.halfCard}>
                    <Card.Title title="Mood" />

                    <Card.Content style={{ paddingHorizontal: 5 }}>
                        <Text style={styles.cardDescription}>How are you feeling?</Text>

                        <View style={styles.moodRow}>
                            {MOODS.map(renderMoodItem)}
                        </View>
                    </Card.Content>
                </Card>

                {/* EXERCISE */}
                <Card style={styles.halfCard}>
                    <Card.Title title="Exercise" />

                    <Card.Content>
                        <Text style={styles.goalText}>{exercise || 0} of 45 min</Text>

                        <View style={styles.habitInputRow}>
                            <Icon source="run" color="limegreen" size={30} />

                            <TextInput
                                value={exercise}
                                onChangeText={setExercise}
                                keyboardType="numeric"
                                style={styles.habitInput}
                                placeholder="0"
                            />

                            <Text>min</Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(Math.max(Number(exercise) || 0, 0) / 45 * 100, 100)}%`,
                                    backgroundColor: 'limegreen'
                                }
                            ]} />
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* SLEEP */}
            <Card style={styles.card}>
                <Card.Title
                    title="Sleep"
                    right={() => (
                        <Text style={{ marginRight: 15 }}>
                            {sleep || 0} of 8 hours
                        </Text>
                    )}
                />

                <Card.Content>
                    <View style={styles.habitInputRow}>
                        <Icon source="sleep" color="purple" size={35} />

                        <TextInput
                            value={sleep}
                            onChangeText={setSleep}
                            keyboardType="numeric"
                            style={styles.habitInput}
                            placeholder="0"
                        />

                        <Text>hours</Text>
                    </View>

                    <View style={styles.progressTrack}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(Math.max(Number(sleep) || 0, 0) / 8 * 100, 100)}%`,
                                backgroundColor: 'purple'
                            }
                        ]} />
                    </View>
                    

                </Card.Content>
            </Card>
  

            {/* DIET */}
            <Card style={styles.card}>
                <Card.Title
                    title="Diet"
                    left={() => (
                        <Icon source="food-apple" color="orange" size={30} />
                    )}
                />

                <Card.Content>
                    <Text style={styles.goalText}>
                        {foodCalories || 0} calories
                    </Text>

                    <View style={styles.habitInputRow}>
                        <Icon source="silverware-fork-knife" color="orange" size={30} />

                        <TextInput
                            value={foodName}
                            onChangeText={setFoodName}
                            style={[styles.habitInput, { flex: 1, }]}
                            placeholder="What did you eat?"
                        />
                    </View>

                    <View style={[styles.habitInputRow, { marginTop: 12 }]}>

                        <TextInput
                            value={foodCalories}
                            onChangeText={setFoodCalories}
                            keyboardType="numeric"
                            style={styles.habitInput}
                            placeholder="0"
                        />

                        <Text>calories</Text>
                    </View>

                    <Button
                        mode="outlined"
                        onPress={() => {
                            if (
                                !foodName.trim() ||
                                foodCalories.trim() === '' ||
                                !Number.isFinite(Number(foodCalories)) ||
                                Number(foodCalories) < 0
                            ) {
                                Alert.alert(
                                    'Invalid Entry',
                                    'Enter a food name and a valid calorie amount.'
                                );
                                return;
                            }

                            setFoodEntries(prev => [
                                ...prev,
                                {
                                    id: `${Date.now()}-${Math.random()}`,
                                    name: foodName.trim(),
                                    calories: Number(foodCalories),
                                    meal: 'Snack',
                                },
                            ]);

                            setFoodName('');
                            setFoodCalories('');
                        }}
                        style={{ marginTop: 12 }}
                    >
                        Add Meal or Snack
                    </Button>

                    {foodEntries.map(item => (
                        <View
                            key={item.id}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <Text style={{ flex: 1 }}>
                                {item.name} — {item.calories} cal
                            </Text>

                            <Pressable
                                onPress={() =>
                                    setFoodEntries(prev =>
                                        prev.filter(food => food.id !== item.id)
                                    )
                                }
                            >
                                <Icon source="delete-outline" color="red" size={22} />
                            </Pressable>
                        </View>
                    ))}

                    <Divider style={{ marginTop: 12, marginBottom: 10 }} />

                    <Text style={{ fontWeight: '700', fontSize: 16 }}>
                        Total: {foodEntries.reduce(
                            (total, item) => total + (Number(item.calories) || 0),
                            0
                        )} calories
                    </Text>
                </Card.Content>
            </Card>

            {/* NOTES */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.notesTitle}>Notes</Text>

                    <TextInput
                        placeholder="Tap here to add symptoms or notes..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        style={styles.notesInput}
                    />
                </Card.Content>
            </Card>

            {/* SAVE */}
            <Button
                mode="contained"
                buttonColor="#6558F5"
                onPress={save}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
            >
                Save
            </Button>
        </ScrollView>
    );
};


// -----------------------------------
// Styles
// -----------------------------------

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: '#F8F9FD' },
    content: { padding: 15, paddingBottom: 35 },

    card: { marginBottom: 13, backgroundColor: '#FFFFFF', borderRadius: 13 },
    halfCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 13, elevation: 0, shadowOpacity: 0, shadowOffset: { width: 0, height: 0 }, shadowRadius: 0 },

    vitalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    vitalLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    vitalName: { fontSize: 13, fontWeight: '500' },
    vitalInputGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    vitalInput: { width: 80, textAlign: 'right', fontSize: 15, paddingVertical: 4, borderBottomWidth: 1, borderColor: '#E5E5E5' },
    vitalUnit: { width: 45, fontSize: 10, color: '#777' },
    divider: { marginLeft: 30, opacity: 0.2 },

    waterRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', gap: 5 },
    waterCup: { padding: 2 },

    twoColumnRow: { flexDirection: 'row', gap: 9, marginBottom: 13 },
    cardDescription: { fontSize: 11, color: '#64748B', marginBottom: 12, textAlign: 'center' },

    moodRow: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
    moodItem: { width: '20%', alignItems: 'center', marginBottom: 5 },
    moodCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    moodSelected: { borderWidth: 2, borderColor: '#6558F5' },
    moodLabel: { fontSize: 8, color: '#777', textAlign: 'center', marginTop: 4 },
    moodLabelSelected: { color: '#6558F5', fontWeight: '700' },

    goalText: { fontSize: 11, color: '#64748B', marginBottom: 10 },
    habitInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    habitInput: { fontSize: 18, fontWeight: '700', width: 50, padding: 0 },
    progressTrack: { height: 7, backgroundColor: '#E5E7EB', borderRadius: 5, marginTop: 12, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 5 },

    notesTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
    notesInput: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, minHeight: 120, fontSize: 15, borderWidth: 1, borderColor: '#EEEEF4' },

    saveButton: { marginTop: 5, marginBottom: 15, borderRadius: 9 }

});

export default DailyHealthTrackScreen;
