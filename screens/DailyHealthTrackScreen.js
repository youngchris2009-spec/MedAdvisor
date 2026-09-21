import { StyleSheet, View, FlatList, ScrollView, TextInput, Pressable } from 'react-native'
import { Text, Button, Card, LeftContent, Divider, Icon } from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import { experimentalSetDeliveryMetricsExportedToBigQueryEnabled } from 'firebase/messaging/sw';
import { doc, setDoc, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const DailyHealthTrackScreen = () => {

    const [weight, setWeight] = useState('');
    const [bloodPressure, setBloodPressure] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [heartRate, setHeartRate] = useState('');

    const [exercise, setExercise] = useState('');
    const [sleep, setSleep] = useState('');
    const [waterIntake, setWaterIntake] = useState([false, false, false, false, false, false, false, false]);
    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState('');

    const vitals = [
    { name: 'Weight: ', vitals: weight, unit: 'lbs', icon: 'scale-bathroom', color: 'navy', setValue: setWeight },
    { name: 'Blood Pressure: ', vitals: bloodPressure, unit: 'mmHg', icon: 'gauge', color: 'orange', setValue: setBloodPressure },
    { name: 'Blood Sugar: ', vitals: bloodSugar, unit: ' mg/dL', icon: 'water', color: 'red', setValue: setBloodSugar },
    { name: 'Heart Rate: ', vitals: heartRate, unit: 'bpm', icon: 'heart', color: 'red', setValue: setHeartRate }
    ]
    const mood = [{ icon: 'emoticon-frown', color: 'red', label: 'Very Bad' },
    { icon: 'emoticon-sad', color: 'orange', label: 'Bad' },
    { icon: 'emoticon-neutral', color: 'gold', label: 'Okay' },
    { icon: 'emoticon-happy', color: 'yellowgreen', label: 'Good' },
    { icon: 'emoticon', color: 'limegreen', label: 'Great' }
    ]
    const waterCups = Array.from({ length: 8 });

    useEffect(() => {
        loadTodayHealthData()
    }, [])

    const loadTodayHealthData = async () => {

        try {

            const userID = '12345'
            // replace with logged-in user ID

            // Start of today
            const startOfToday = new Date()

            startOfToday.setHours(
                0,
                0,
                0,
                0
            )

            // Start of tomorrow
            const startOfTomorrow = new Date(startOfToday)

            startOfTomorrow.setDate(
                startOfTomorrow.getDate() + 1
            )


            const q = query(
                collection(
                    db,
                    'dailyHealthTracking'
                ),

                where(
                    'userID',
                    '==',
                    userID
                ),

                where(
                    'dateTime',
                    '>=',
                    Timestamp.fromDate(startOfToday)
                ),

                where(
                    'dateTime',
                    '<',
                    Timestamp.fromDate(startOfTomorrow)
                ),

                orderBy(
                    'dateTime',
                    'desc'
                )
            )


            const snapshot =
                await getDocs(q)


            // Blank if nothing exists today
            if (snapshot.empty) {

                setWeight('')
                setBloodPressure('')
                setBloodSugar('')
                setHeartRate('')
                setSelectedMood(null)

                return
            }


            const latest = {}


            snapshot.forEach(doc => {

                const data = doc.data()

                // Because query is newest -> oldest,
                // only keep first occurrence of each name
                if (!latest[data.name]) {

                    latest[data.name] = data

                }

            })


            // -------------------------
            // VITALS
            // -------------------------

            if (latest['Weight']) {

                setWeight(
                    latest['Weight'].vitals?.toString() || ''
                )

            }


            if (latest['Blood Pressure']) {

                setBloodPressure(
                    latest['Blood Pressure'].vitals?.toString() || ''
                )

            }


            if (latest['Blood Sugar']) {

                setBloodSugar(
                    latest['Blood Sugar'].vitals?.toString() || ''
                )

            }


            if (latest['Heart Rate']) {

                setHeartRate(
                    latest['Heart Rate'].vitals?.toString() || ''
                )

            }


            // -------------------------
            // MOOD
            // -------------------------

            if (latest['Mood']) {

                const moodLabel =
                    latest['Mood'].vitals

                const moodIndex =
                    mood.findIndex(
                        item =>
                            item.label === moodLabel
                    )

                if (moodIndex !== -1) {

                    setSelectedMood(moodIndex)

                }

            }
            if (latest['Notes']) {
                setNotes(
                    latest['Notes'].vitals?.toString() || ''
                );
            }

        }
        catch (error) {

            console.log(
                'Error loading health data:',
                error
            )

        }

    }


    const save = async () => {
        try {
            const userID = '12345'; // Replace this with the actual logged-in user's ID
            const dateTime = new Date().toISOString();

            // =========================
            // DAILY HEALTH TRACKING
            // VITALS
            // =========================

            const healthTracking = [
                {
                    name: 'Weight',
                    vitals: weight,
                    icon: 'scale-bathroom'
                },
                {
                    name: 'Blood Pressure',
                    vitals: bloodPressure,
                    icon: 'gauge'
                },
                {
                    name: 'Blood Sugar',
                    vitals: bloodSugar,
                    icon: 'water'
                },
                {
                    name: 'Heart Rate',
                    vitals: heartRate,
                    icon: 'heart'
                },
                {
                    name: 'Mood',
                    vitals: selectedMood,
                    icon: mood[selectedMood].icon
                },
                {
                    name: 'Notes',
                    vitals: notes,
                    icon: 'note-text'
                }
            ];

            for (const item of healthTracking) {
                const docID = `${userID}_${item.name}_${dateTime}`;

                await setDoc(
                    doc(db, 'dailyHealthTracking', docID),
                    {
                        userID: userID,
                        name: item.name,
                        vitals: item.vitals,
                        dateTime: dateTime,
                        icon: item.icon
                    }
                );
            }

            // =========================
            // HEALTH HABIT RECOMMENDATION
            // WATER
            // =========================

            const waterAmount = waterIntake.filter(cup => cup).length;

            const habits = [
                {
                    name: 'Water',
                    detail: 'Drink water throughout the day',
                    amount: waterAmount
                },
                {
                    name: 'Exercise',
                    detail: 'Daily physical activity',
                    amount: exercise
                },
                {
                    name: 'Sleep',
                    detail: 'Hours of sleep',
                    amount: sleep
                }
            ];

            for (const habit of habits) {
                const docID = `${userID}_${habit.name}_${dateTime}`;

                await setDoc(
                    doc(db, 'healthHabitRecommendation', docID),
                    {
                        userID: userID,
                        name: habit.name,
                        detail: habit.detail,
                        dailyHabitTraking: {
                            dateTime: dateTime,
                            amount: habit.amount
                        }
                    }
                );
            }

            console.log('Health data saved successfully!');

        } catch (error) {
            console.error('Error saving health data:', error);
        }
    };


    const renderVitalsItem = ({ item }) => (
        <View style={{ marginVertical: '3' }}>
            <View style={{
                flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3
            }}>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                    <Icon source={item.icon} color={item.color} size={25} />
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
    const renderMoodItem = ({ item, index }) => (
        <View style={{
            alignItems: 'center',
            flex: 1
        }}>
            <Pressable
                onPress={() => setSelectedMood(index)}
                style={{
                    width: 52, height: 52, borderRadius: 26, alignItems: 'center',
                    justifyContent: 'center', borderWidth: selectedMood === index ? 2 : 0,
                    borderColor: 'black'
                }}>
                <View style={{
                    width: 46, height: 46, borderRadius: 23, alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon
                        source={item.icon}
                        color={item.color}
                        size={23}
                    />
                </View>
            </Pressable>

            {selectedMood === index && (
                <Text style={{
                    color: 'black',
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: '500'
                }}>
                    {item.label}
                </Text>
            )}
        </View>
    )

    const renderWaterIntakeItem = ({ index }) => (
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
        <ScrollView style={{ margin: 15 }}>

            <Card style={{ marginBottom: 13 }}>
                <Card.Title
                    title="Vitals"
                    left={LeftContent}
                />
                <Card.Content>
                    <FlatList
                        data={vitals}
                        renderItem={renderVitalsItem}
                    />
                </Card.Content>
            </Card>

            <Card style={{ marginBottom: 13 }}>
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

            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>


                <Card style={{
                    marginBottom: 13,
                    flex: 1,
                    marginRight: 9
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Card.Title
                            title="Mood"
                            left={LeftContent}
                        />
                    </View>

                    <Text style={{
                        fontSize: 14,
                        color: '#64748B',
                        marginLeft: 16,
                        marginTop: 4
                    }}>
                        How are you feeling?
                    </Text>

                    <Card.Content style={{
                        marginTop: 15,
                        paddingHorizontal: 5
                    }}>
                        <FlatList
                            horizontal
                            data={mood}
                            renderItem={renderMoodItem}
                            keyExtractor={(_, index) => index.toString()}
                            contentContainerStyle={{
                                flexGrow: 1,
                                justifyContent: 'space-evenly'
                            }}
                            showsHorizontalScrollIndicator={false}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ marginBottom: 13, flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Card.Title
                            title="Exercise"
                            left={LeftContent}
                        />

                        <Text style={{ marginRight: 20 }} >
                            {exercise} of 45 min
                        </Text>

                    </View>

                    <Card.Content>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <Icon
                                source="run"
                                color="limegreen"
                                size={35}
                            />

                            <TextInput
                                value={exercise}
                                onChangeText={setExercise}
                                keyboardType="numeric"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    width: 60,
                                    padding: 0
                                }}
                            />

                            <Text style={{
                                fontSize: 16
                            }}>
                                min
                            </Text>
                        </View>

                        <View style={{
                            height: 6,
                            backgroundColor: 'lightgray',
                            borderRadius: 5,
                            marginTop: 10,
                            marginBottom: 5
                        }}>
                            <View style={{
                                height: 6,
                                width: `${Math.min((Number(exercise) / 45) * 100, 100)}%`,
                                backgroundColor: 'limegreen',
                                borderRadius: 5
                            }} />
                        </View>
                    </Card.Content>
                </Card>

            </View>

            <Card style={{ marginBottom: 13 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Card.Title
                        title="Sleep"
                        left={LeftContent}
                    />

                    <Text style={{ marginRight: 20 }}>
                        {sleep} of 8 hours
                    </Text>
                </View>

                <Card.Content>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <Icon
                            source="sleep"
                            color="purple"
                            size={35}
                        />

                        <TextInput
                            value={sleep}
                            onChangeText={setSleep}
                            keyboardType="numeric"
                            style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                width: 60,
                                padding: 0
                            }}
                        />

                        <Text style={{
                            fontSize: 16
                        }}>
                            hours
                        </Text>
                    </View>

                    <View style={{
                        height: 6,
                        backgroundColor: 'lightgray',
                        borderRadius: 5,
                        marginTop: 10,
                        marginBottom: 5,
                    }}>
                        <View style={{
                            height: 6,
                            width: `${Math.min((Number(sleep) / 8) * 100, 100)}%`,
                            backgroundColor: 'purple',
                            borderRadius: 5
                        }} />
                    </View>

                </Card.Content>
            </Card>

<Card style={{ marginBottom: 13 }}>
    <Card.Content>
        <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10
        }}>
            Notes
        </Text>

        <TextInput
            placeholder="Tap here to add symptoms or notes..."
            value={notes}
            onChangeText={setNotes}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 12,
                minHeight: 120,
                fontSize: 16
            }}
        />
    </Card.Content>
</Card>


            <Button mode="contained" buttonColor='purple' onPress={save} > Save </Button>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notesTitle: {
        fontWeight: '700',
        color: 'black',
    },
    notesInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        minHeight: 60,
    },
});

export default DailyHealthTrackScreen
