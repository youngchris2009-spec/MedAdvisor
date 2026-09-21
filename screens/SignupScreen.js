import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';

import {
  Text,
  TextInput,
  Button,
  Divider,
  Menu,
  Checkbox,
} from 'react-native-paper';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';

const SignUpScreen = ({ navigation }) => {

  // -----------------------------
  // Personal Information
  // -----------------------------

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');

  // -----------------------------
  // Login Information
  // -----------------------------

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // -----------------------------
  // Medical Conditions
  // -----------------------------

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);

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

  const toggleCondition = (condition) => {

    if (condition === 'None') {
      setSelectedConditions(['None']);
      return;
    }

    let updatedConditions = [...selectedConditions];

    // Remove "None" if another condition is selected
    updatedConditions = updatedConditions.filter(
      item => item !== 'None'
    );

    if (updatedConditions.includes(condition)) {
      updatedConditions = updatedConditions.filter(
        item => item !== condition
      );
    } else {
      updatedConditions.push(condition);
    }

    setSelectedConditions(updatedConditions);
  };

  const displayValue =
    selectedConditions.length === 0
      ? 'Select medical conditions'
      : selectedConditions.join(', ');

  // -----------------------------
  // Lifestyle
  // -----------------------------

  const [exerciseMenuVisible, setExerciseMenuVisible] = useState(false);
  const [smokingMenuVisible, setSmokingMenuVisible] = useState(false);
  const [alcoholMenuVisible, setAlcoholMenuVisible] = useState(false);

  const [exercise, setExercise] = useState('');
  const [smoking, setSmoking] = useState('');
  const [alcohol, setAlcohol] = useState('');

  const [sleep, setSleep] = useState('');
  const [diet, setDiet] = useState('');
  const [water, setWater] = useState('');

  const exerciseOptions = [
    'Never',
    '1-2 times a week',
    '3-4 times a week',
    '5+ times a week',
  ];

  const smokingOptions = [
    'Never',
    'Former smoker',
    'Occasionally',
    'Daily',
  ];

  const alcoholOptions = [
    'Never',
    'Occasionally',
    '1-2 times a week',
    '3+ times a week',
  ];

  // -----------------------------
  // Register User
  // -----------------------------

  const register = async () => {

    try {

      // Basic validation
      if (!name.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your name.'
        );
        return;
      }

      if (!email.trim()) {
        Alert.alert(
          'Missing Information',
          'Please enter your email.'
        );
        return;
      }

      if (!password) {
        Alert.alert(
          'Missing Information',
          'Please enter a password.'
        );
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert(
          'Password Error',
          'Passwords do not match.'
        );
        return;
      }

      // -----------------------------
      // Create Firebase Auth account
      // -----------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // -----------------------------
      // Convert allergies to a list
      // -----------------------------

      const allergiesList = allergies
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      // -----------------------------
      // Create Firestore user data
      // -----------------------------

      const userData = {

        email: user.email,

        name: name.trim(),

        dateOfBirth: dateOfBirth.trim(),

        gender: gender.trim(),

        height: height.trim(),

        weight: weight.trim(),

        allergies: allergiesList,

        medicalConditions: selectedConditions,

        lifeStyle: {

          question: [
            'Exercise',
            'Smoking',
            'Alcohol',
            'Sleep',
            'Diet',
            'Water',
          ],

          answer: [
            exercise,
            smoking,
            alcohol,
            sleep,
            diet,
            water,
          ],
        },
      };

      // -----------------------------
      // Save user profile
      // -----------------------------

      await setDoc(
        doc(db, 'users', user.uid),
        userData
      );

      Alert.alert(
        'Registration Complete',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('My Medication');
            },
          },
        ]
      );

    } catch (error) {

      console.log('Registration error:', error);

      if (error.code === 'auth/email-already-in-use') {

        Alert.alert(
          'Registration Error',
          'An account with this email already exists.'
        );

      } else if (error.code === 'auth/invalid-email') {

        Alert.alert(
          'Registration Error',
          'Please enter a valid email address.'
        );

      } else if (error.code === 'auth/weak-password') {

        Alert.alert(
          'Registration Error',
          'The password is too weak.'
        );

      } else {

        Alert.alert(
          'Registration Error',
          'Something went wrong while creating your account.'
        );
      }
    }
  };

  // -----------------------------
  // Screen
  // -----------------------------

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      <Text style={styles.title}>
        Create Account
      </Text>

      <Text style={styles.sectionTitle}>
        Account Information
      </Text>

      {/* Email */}

      <TextInput
        mode="outlined"
        label="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}

      <TextInput
        mode="outlined"
        label="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password */}

      <TextInput
        mode="outlined"
        label="Confirm Password"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Personal Information
      </Text>

      {/* Name */}

      <TextInput
        mode="outlined"
        label="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Date of Birth */}

      <TextInput
        mode="outlined"
        label="Date of Birth"
        placeholder="MM/DD/YYYY"
        style={styles.input}
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      {/* Gender */}

      <TextInput
        mode="outlined"
        label="Gender"
        style={styles.input}
        value={gender}
        onChangeText={setGender}
      />

      {/* Height */}

      <TextInput
        mode="outlined"
        label="Height"
        placeholder="e.g. 5'8"
        style={styles.input}
        value={height}
        onChangeText={setHeight}
      />

      {/* Weight */}

      <TextInput
        mode="outlined"
        label="Weight"
        placeholder="e.g. 150 lbs"
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
      />

      {/* Allergies */}

      <TextInput
        mode="outlined"
        label="Allergies"
        placeholder="Separate multiple allergies with commas"
        style={styles.input}
        value={allergies}
        onChangeText={setAllergies}
      />

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Medical Conditions
      </Text>

      {/* Medical Conditions Menu */}

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
          >
            {displayValue}
          </Button>
        }
        contentStyle={styles.menuContent}
      >

        <ScrollView style={styles.conditionScroll}>

          {conditions.map((condition) => (

            <Checkbox.Item
              key={condition}
              label={condition}
              status={
                selectedConditions.includes(condition)
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={() => toggleCondition(condition)}
            />

          ))}

        </ScrollView>

      </Menu>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>
        Lifestyle
      </Text>

      {/* Exercise */}

      <Menu
        visible={exerciseMenuVisible}
        onDismiss={() => setExerciseMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setExerciseMenuVisible(true)}
            style={styles.menuButton}
          >
            {exercise || 'Select exercise frequency'}
          </Button>
        }
      >

        {exerciseOptions.map((option) => (

          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              setExercise(option);
              setExerciseMenuVisible(false);
            }}
          />

        ))}

      </Menu>

      {/* Smoking */}

      <Menu
        visible={smokingMenuVisible}
        onDismiss={() => setSmokingMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setSmokingMenuVisible(true)}
            style={styles.menuButton}
          >
            {smoking || 'Select smoking frequency'}
          </Button>
        }
      >

        {smokingOptions.map((option) => (

          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              setSmoking(option);
              setSmokingMenuVisible(false);
            }}
          />

        ))}

      </Menu>

      {/* Alcohol */}

      <Menu
        visible={alcoholMenuVisible}
        onDismiss={() => setAlcoholMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setAlcoholMenuVisible(true)}
            style={styles.menuButton}
          >
            {alcohol || 'Select alcohol frequency'}
          </Button>
        }
      >

        {alcoholOptions.map((option) => (

          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              setAlcohol(option);
              setAlcoholMenuVisible(false);
            }}
          />

        ))}

      </Menu>

      {/* Sleep */}

      <TextInput
        mode="outlined"
        label="Sleep"
        placeholder="e.g. 7-8 hours"
        style={styles.input}
        value={sleep}
        onChangeText={setSleep}
      />

      {/* Diet */}

      <TextInput
        mode="outlined"
        label="Diet"
        placeholder="e.g. Balanced"
        style={styles.input}
        value={diet}
        onChangeText={setDiet}
      />

      {/* Water */}

      <TextInput
        mode="outlined"
        label="Daily Water Intake"
        placeholder="e.g. 6-8 glasses"
        style={styles.input}
        value={water}
        onChangeText={setWater}
      />

      {/* Register */}

      <Button
        mode="contained"
        onPress={register}
        style={styles.registerButton}
      >
        Register
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.loginButton}
      >
        Already have an account? Log In
      </Button>

    </ScrollView>
  );
};

const styles = StyleSheet.create({

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },

  input: {
    marginBottom: 15,
  },

  divider: {
    marginVertical: 20,
  },

  menuButton: {
    marginBottom: 15,
  },

  menuContent: {
    maxHeight: 400,
  },

  conditionScroll: {
    maxHeight: 350,
  },

  registerButton: {
    marginTop: 20,
    paddingVertical: 5,
  },

  loginButton: {
    marginTop: 10,
  },

});

export default SignUpScreen;
