import React, { useState } from 'react';

import {
    View,
    ScrollView,
    StyleSheet,
    TextInput,
    Alert
} from 'react-native';

import {
    Text,
    Card,
    Button,
    Chip,
    Icon
} from 'react-native-paper';

import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase';


const MedicationDetailScreen = ({ route, navigation }) => {

    const medication = route.params?.medication;

    console.log(
        'RECEIVED MEDICATION:',
        medication
    );


    // -----------------------------
    // State
    // -----------------------------

    const [name, setName] =
        useState(medication?.name || '');

    const [dosage, setDosage] =
        useState(medication?.dosage || '');

    const [frequency, setFrequency] =
        useState(medication?.frequency || '');

    const [sideEffect, setSideEffect] =
        useState(medication?.sideEffect || []);

const [time, setTime] = useState(
    medication?.time?.length ? medication.time : ['9:00 PM']
);

    const [startDate, setStartDate] =
        useState(medication?.startDate || '');

    const [thingsToAvoid, setThingsToAvoid] =
        useState(medication?.thingsToAvoid || []);

    const [bestWayToTake, setBestWayToTake] =
        useState(medication?.bestWayToTake || []);

    const [quantity, setQuantity] =
        useState(
            medication?.quantity?.toString() || ''
        );

    const [saving, setSaving] =
        useState(false);


    // -----------------------------
    // Save Medication
    // -----------------------------

    const saveMedication = async () => {

    if (!name.trim()) {
        Alert.alert(
            'Missing Information',
            'Please enter the medication name.'
        );
        return;
    }

    try {

        setSaving(true);

        const userID = 'YIuwbxGpb1OMWnNzOGiJgJsA1Fr1';

        await addDoc(
            collection(db, 'medication'),
            {
                userID: userID,
                name: name.trim(),
                dosage: dosage.trim(),
                frequency: frequency.trim(),
                sideEffect: sideEffect,
                time: time,
                startDate: startDate.trim(),
                thingsToAvoid: thingsToAvoid,
                bestWayToTake: bestWayToTake,
                quantity: quantity
                    ? Number(quantity)
                    : 0,
                medicationLog: [],
                createdAt: serverTimestamp()
            }
        );

        // Show success message
        Alert.alert(
            'Success',
            'Medication saved successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.navigate('Medication List');
                    }
                }
            ]
        );

    } catch (error) {

        console.log(
            'Error saving medication:',
            error
        );

        Alert.alert(
            'Error',
            'Could not save medication. Please try again.'
        );

    } finally {

        setSaving(false);

    }
};


    // -----------------------------
    // Render Chips
    // -----------------------------

    const renderList = (items) => {

        if (!items || items.length === 0) {
            return (
                <Text style={styles.noData}>
                    None
                </Text>
            );
        }


        return (
            <View style={styles.chipContainer}>

                {items.map((item, index) => (

                    <Chip
                        key={index}
                        style={styles.chip}
                    >
                        {item}
                    </Chip>

                ))}

            </View>
        );

    };


    // -----------------------------
    // Screen
    // -----------------------------

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >


            {/* Medication */}

            <Card style={styles.card}>

                <Card.Title
                    title="Medication"
                    left={() =>
                        <Icon
                            source="pill"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    <Text style={styles.label}>
                        Medication Name
                    </Text>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholder="Medication name"
                    />


                    <Text style={styles.label}>
                        Dosage
                    </Text>

                    <TextInput
                        value={dosage}
                        onChangeText={setDosage}
                        style={styles.input}
                        placeholder="e.g. 500 mg"
                    />


                    <Text style={styles.label}>
                        Frequency
                    </Text>

                    <TextInput
                        value={frequency}
                        onChangeText={setFrequency}
                        style={styles.input}
                        placeholder="e.g. Once daily"
                    />

                </Card.Content>

            </Card>


            {/* Schedule */}

            <Card style={styles.card}>

                <Card.Title
                    title="Schedule"
                    left={() =>
                        <Icon
                            source="clock-outline"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    <Text style={styles.label}>
</Text>

<Text style={styles.label}>
    Time
</Text>

{time.map((item, index) => (
    <View
        key={index}
        style={styles.timeRow}
    >

        <TextInput
            value={item}
            onChangeText={(text) => {

                const updatedTimes = [...time];

                updatedTimes[index] = text;

                setTime(updatedTimes);

            }}
            style={styles.timeInput}
            placeholder="e.g. 8:00 AM"
        />

        <Button
            mode="outlined"
            onPress={() => {

                const updatedTimes =
                    time.filter((_, i) => i !== index);

                setTime(updatedTimes);

            }}
            compact
        >
            Remove
        </Button>

    </View>
))}


<Button
    mode="outlined"
    icon="plus"
    onPress={() => {
        setTime([
            ...time,
            ''
        ]);
    }}
    style={styles.addTimeButton}
>
    Add Time
</Button>




                    <Text style={styles.label}>
                        Start Date
                    </Text>

                    <TextInput
                        value={startDate}
                        onChangeText={setStartDate}
                        style={styles.input}
                        placeholder="e.g. 10/01/2026"
                    />

                </Card.Content>

            </Card>


            {/* Quantity */}

            <Card style={styles.card}>

                <Card.Title
                    title="Medication Supply"
                    left={() =>
                        <Icon
                            source="counter"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    <Text style={styles.label}>
                        Quantity
                    </Text>

                    <TextInput
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholder="Number of pills"
                    />

                </Card.Content>

            </Card>


            {/* Best Way To Take */}

            <Card style={styles.card}>

                <Card.Title
                    title="Best Way to Take"
                    left={() =>
                        <Icon
                            source="check-circle-outline"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    {renderList(bestWayToTake)}

                </Card.Content>

            </Card>


            {/* Things To Avoid */}

            <Card style={styles.card}>

                <Card.Title
                    title="Things to Avoid"
                    left={() =>
                        <Icon
                            source="alert-circle-outline"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    {renderList(thingsToAvoid)}

                </Card.Content>

            </Card>


            {/* Side Effects */}

            <Card style={styles.card}>

                <Card.Title
                    title="Possible Side Effects"
                    left={() =>
                        <Icon
                            source="information-outline"
                            size={28}
                        />
                    }
                />

                <Card.Content>

                    {renderList(sideEffect)}

                </Card.Content>

            </Card>


            {/* Save Button */}

            <Button
                mode="contained"
                onPress={saveMedication}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
            >
                {saving
                    ? 'Saving...'
                    : 'Save Medication'
                }
            </Button>


        </ScrollView>

    );

};


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    content: {
        padding: 15,
        paddingBottom: 30
    },

    card: {
        marginBottom: 13
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff'
    },

    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
        marginTop: 5
    },

    chip: {
        marginBottom: 5
    },

    noData: {
        color: '#777',
        marginTop: 5
    },

    saveButton: {
        marginTop: 5,
        marginBottom: 20
    }

});


export default MedicationDetailScreen
