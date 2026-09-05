import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TextInput
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


const MedicationDetailScreen = ({ route }) => {

  const medication =
    route.params?.medication

  console.log(
    'RECEIVED MEDICATION:',
    medication
  )

    const [name, setName] =
  useState(medication?.name || '')

const [dosage, setDosage] =
  useState(medication?.dosage || '')

const [frequency, setFrequency] =
  useState(medication?.frequency || '')

const [sideEffect, setSideEffect] =
  useState(medication?.sideEffect || [])

const [time, setTime] =
  useState(medication?.time || [])

const [startDate, setStartDate] =
  useState(medication?.startDate || '')

const [thingsToAvoid, setThingsToAvoid] =
  useState(medication?.thingsToAvoid || [])

const [bestWayToTake, setBestWayToTake] =
  useState(medication?.bestWayToTake || [])

const [quantity, setQuantity] =
  useState(
    medication?.quantity?.toString() || ''
  )


    const saveMedication = async () => {

        try {

            const userID = '12345';
            // Replace later with logged-in user's Firebase UID

            await addDoc(
                collection(db, 'medication'),
                {
                    userID: userID,

                    name: name,

                    dosage: dosage,

                    frequency: frequency,

                    sideEffect: sideEffect,

                    time: time,

                    startDate: startDate,

                    thingsToAvoid: thingsToAvoid,

                    bestWayToTake: bestWayToTake,

                    quantity: Number(quantity),

                    medicationLog: [],

                    createdAt: serverTimestamp()
                }
            );

            console.log('Medication saved');

        }
        catch (error) {

            console.log(
                'Error saving medication:',
                error
            );

        }
    };


    const renderList = (items) => {

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


    return (

        <ScrollView style={styles.container}>

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
                    />


                    <Text style={styles.label}>
                        Dosage
                    </Text>

                    <TextInput
                        value={dosage}
                        onChangeText={setDosage}
                        style={styles.input}
                    />


                    <Text style={styles.label}>
                        Frequency
                    </Text>

                    <TextInput
                        value={frequency}
                        onChangeText={setFrequency}
                        style={styles.input}
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
                        Time
                    </Text>

                    {renderList(time)}


                    <Text style={styles.label}>
                        Start Date
                    </Text>

                    <TextInput
                        value={startDate}
                        onChangeText={setStartDate}
                        style={styles.input}
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
                    />

                </Card.Content>

            </Card>


            {/* Best way to take */}

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


            {/* Things to avoid */}

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


            <Button
                mode="contained"
                onPress={saveMedication}
                style={styles.saveButton}
            >
                Save Medication
            </Button>


        </ScrollView>

    );

};


const styles = StyleSheet.create({

    container: {
        margin: 15
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
        fontSize: 16
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

    saveButton: {
        marginTop: 5,
        marginBottom: 30
    }

});


export default MedicationDetailScreen;