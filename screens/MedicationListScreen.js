import React, { useEffect, useState } from 'react';

import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  Text,
  TextInput,
  ActivityIndicator,
  Icon,
} from 'react-native-paper';



import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore';

import { db } from '../firebase';


const MedicationListScreen = ({ navigation }) => {

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
const logMedication = async (medication) => {
  try {
    if (!medication?.id) {
      Alert.alert(
        'Error',
        'Medication ID could not be found.'
      );
      return;
    }

    const medicationRef = doc(
      db,
      'medication',
      medication.id
    );

    const logEntry = {
      dateTime: new Date().toISOString(),
      dosage: medication.dosage || '',
    };

    await updateDoc(medicationRef, {
      medicationLog: arrayUnion(logEntry),
    });

    Alert.alert(
      'Medication Logged',
      `${medication.name} has been logged.`
    );

  } catch (error) {
    console.log('Error logging medication:', error);

    Alert.alert(
      'Error',
      'Unable to save medication log.'
    );
  }
};

  // ---------------------------------------
  // 1. Load medications from Firebase
  // ---------------------------------------

  const loadMedications = async () => {

    try {

      setLoading(true);

      const userID = 'auth.currentUser.uid;';

      const medicationQuery = query(
        collection(db, 'medication'),
        where('userID', '==', userID)
      );

      const snapshot = await getDocs(
        medicationQuery
      );

      const medicationData = [];

      snapshot.forEach((doc) => {

        medicationData.push({
          id: doc.id,
          ...doc.data(),
        });

      });

      setMedications(medicationData);

    } catch (error) {

      console.log(
        'Error loading medications:',
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadMedications();

  }, []);

  // ---------------------------------------
// Determine what time of day a medication is
// ---------------------------------------

const getTimePeriod = (time) => {

  if (!time) {
    return '';
  }

  const timeString = time
    .toString()
    .toLowerCase()
    .trim();


  // If your database contains
  // "Morning", "Afternoon", or "Evening"
  if (timeString.includes('morning')) {
    return 'Morning';
  }

  if (timeString.includes('afternoon')) {
    return 'Afternoon';
  }

  if (timeString.includes('evening')) {
    return 'Evening';
  }


  // Handle times such as:
  // 8:00 AM
  // 12:00 PM
  // 6:00 PM

  const match = timeString.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/
  );


  // Couldn't understand the time
  if (!match) {
    return '';
  }


  let hour = parseInt(match[1], 10);

  const ampm = match[3];


  // Convert PM to 24-hour time
  if (ampm === 'am') {

    if (hour === 12) {
      hour = 0;
    }

  } else {

    if (hour !== 12) {
      hour += 12;
    }

  }


  // 12:00 AM - 11:59 AM
  // = Morning

  if (hour >= 0 && hour < 12) {
    return 'Morning';
  }


  // 12:00 PM - 4:59 PM
  // = Afternoon

  if (hour >= 12 && hour < 17) {
    return 'Afternoon';
  }


  // 5:00 PM - 11:59 PM
  // = Evening

  return 'Evening';
};


  // ---------------------------------------
  // Filter medications
  // ---------------------------------------

  const filteredMedications = medications.filter(
  (medication) => {

    // -----------------------------------
    // Search filter
    // -----------------------------------

    const matchesSearch =
      medication.name
        ?.toLowerCase()
        .includes(search.toLowerCase());


    // -----------------------------------
    // If "All" is selected,
    // show every medication
    // -----------------------------------

    if (selectedFilter === 'All') {
      return matchesSearch;
    }


    // -----------------------------------
    // Get medication times
    // -----------------------------------

    const times = Array.isArray(medication.time)
      ? medication.time
      : [medication.time];


    // -----------------------------------
    // Check each medication time
    // -----------------------------------

    const matchesTime = times.some(
      (time) => {

        return (
          getTimePeriod(time) === selectedFilter
        );

      }
    );


    // -----------------------------------
    // Medication must match BOTH:
    // Search + Time
    // -----------------------------------

    return matchesSearch && matchesTime;

  }
);


  // ---------------------------------------
  // Open medication
  // ---------------------------------------

  const openMedication = (medication) => {

    navigation.navigate(
      'Medication Detail',
      {
        medication: medication,
      }
    );

  };


  // ---------------------------------------
  // Get first medication time
  // ---------------------------------------

  const getMedicationTime = (medication) => {

    if (
      Array.isArray(medication.time) &&
      medication.time.length > 0
    ) {
      return medication.time[0];
    }

    return '--:--';
  };


  // ---------------------------------------
  // Get frequency
  // ---------------------------------------

  const getFrequency = (medication) => {

    if (medication.frequency) {
      return medication.frequency;
    }

    return 'Daily';
  };


  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading medications...
        </Text>

      </View>
    );
  }


  // ---------------------------------------
  // Screen
  // ---------------------------------------

  return (

    <View style={styles.container}>

      {/* ---------------------------------
          Header
      ---------------------------------- */}

      <View style={styles.header}>

        <Text style={styles.title}>
          My Medications
        </Text>

        <TouchableOpacity>
          <Icon
            source="magnify"
            size={25}
          />
        </TouchableOpacity>

      </View>


      {/* ---------------------------------
          Search
      ---------------------------------- */}

      <View style={styles.searchContainer}>

        <Icon
          source="magnify"
          size={19}
          color="#777"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search medication"
          placeholderTextColor="#999"
          style={styles.searchInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />

      </View>


      {/* ---------------------------------
          Filters
      ---------------------------------- */}

      <View style={styles.filters}>

        {[
          'All',
          'Morning',
          'Afternoon',
          'Evening',
        ].map((filter) => (

          <TouchableOpacity
            key={filter}
            onPress={() =>
              setSelectedFilter(filter)
            }
            style={[
              styles.filterButton,
              selectedFilter === filter &&
                styles.selectedFilter,
            ]}
          >

            <Text
              style={[
                styles.filterText,
                selectedFilter === filter &&
                  styles.selectedFilterText,
              ]}
            >
              {filter}
            </Text>

          </TouchableOpacity>

        ))}

      </View>


      {/* ---------------------------------
          Medication List
      ---------------------------------- */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >

        {filteredMedications.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Icon
              source="pill-off-outline"
              size={45}
              color="#777"
            />

            <Text style={styles.emptyTitle}>
              No medications found
            </Text>

            <Text style={styles.emptyText}>
              Add a medication to get started.
            </Text>

          </View>

        ) : (

          filteredMedications.map(
            (medication, index) => (

              <TouchableOpacity
                key={medication.id}
                activeOpacity={0.8}
                onPress={() =>
                  openMedication(medication)
                }
              >

                <View style={styles.medicationCard}>

                  {/* Pill Icon */}

                  <View
                    style={[
                      styles.pillCircle,
                      index % 2 === 0
                        ? styles.bluePill
                        : styles.redPill,
                    ]}
                  >

                    <Icon
                      source="pill"
                      size={20}
                      color="#FFFFFF"
                    />

                  </View>


                  {/* Medication Information */}

                  <View style={styles.medicationInfo}>

                    <Text
                      style={styles.medicationName}
                      numberOfLines={1}
                    >
                      {medication.name}
                    </Text>

                    <Text style={styles.medicationDetails}>

                      {medication.dosage || '--'} •{' '}

                      {getFrequency(medication)}

                    </Text>

                    <Text style={styles.dailyText}>
                      Daily
                    </Text>

                  </View>


                  {/* Time */}

                  <View style={styles.timeContainer}>

  <Text style={styles.timeText}>
    {getMedicationTime(medication)}
  </Text>

  <TouchableOpacity
    style={styles.logButton}
    onPress={() => logMedication(medication)}
  >
    <Icon
      source="check"
      size={16}
      color="#FFFFFF"
    />

    <Text style={styles.logButtonText}>
      Take
    </Text>
  </TouchableOpacity>

</View>

                </View>

              </TouchableOpacity>

            )
          )

        )}


        <View style={styles.bottomSpace} />

      </ScrollView>


      {/* ---------------------------------
          Add Medication
      ---------------------------------- */}

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('Prescript Scan')
        }
      >

        <Icon
          source="plus"
          size={18}
          color="#FFFFFF"
        />

        <Text style={styles.addButtonText}>
          Add Medication
        </Text>

      </TouchableOpacity>

    </View>
  );
};


export default MedicationListScreen;


const styles = StyleSheet.create({

  // -----------------------------------
  // Main
  // -----------------------------------

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },


  // -----------------------------------
  // Header
  // -----------------------------------

  header: {
    paddingTop: 50,
    paddingBottom: 12,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#171717',
  },


  // -----------------------------------
  // Search
  // -----------------------------------

  searchContainer: {
    height: 38,

    borderWidth: 1,
    borderColor: '#E5E5E5',

    borderRadius: 19,

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FAFAFA',
  },

  searchInput: {
    flex: 1,

    height: 38,

    backgroundColor: 'transparent',

    fontSize: 12,

    paddingHorizontal: 7,
  },


  // -----------------------------------
  // Filters
  // -----------------------------------

  filters: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 12,
    marginBottom: 12,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,

    borderRadius: 15,

    backgroundColor: '#F4F4F7',
  },

  selectedFilter: {
    backgroundColor: '#6558F5',
  },

  filterText: {
    fontSize: 10,
    color: '#555',
    fontWeight: '500',
  },

  selectedFilterText: {
    color: '#FFFFFF',
  },


  // -----------------------------------
  // List
  // -----------------------------------

  list: {
    paddingTop: 2,
  },


  // -----------------------------------
  // Medication Card
  // -----------------------------------

  medicationCard: {
    minHeight: 70,

    borderWidth: 1,
    borderColor: '#E9E9E9',

    borderRadius: 10,

    marginBottom: 8,

    paddingHorizontal: 10,
    paddingVertical: 9,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',
  },


  // -----------------------------------
  // Pill Icon
  // -----------------------------------

  pillCircle: {
    width: 38,
    height: 38,

    borderRadius: 19,

    justifyContent: 'center',
    alignItems: 'center',
  },

  bluePill: {
    backgroundColor: '#6C63FF',
  },

  redPill: {
    backgroundColor: '#F56B6B',
  },


  // -----------------------------------
  // Medication Info
  // -----------------------------------

  medicationInfo: {
    flex: 1,

    marginLeft: 10,
  },

  medicationName: {
    fontSize: 13,

    fontWeight: '700',

    color: '#222',
  },

  medicationDetails: {
    fontSize: 10,

    color: '#555',

    marginTop: 2,
  },

  dailyText: {
    fontSize: 9,

    color: '#999',

    marginTop: 2,
  },


  // -----------------------------------
  // Time
  // -----------------------------------

  timeContainer: {
  alignItems: 'flex-end',
  marginLeft: 5,
},

  timeText: {
    fontSize: 10,

    fontWeight: '700',

    color: '#333',
  },


  // -----------------------------------
  // Empty State
  // -----------------------------------

  emptyContainer: {
    alignItems: 'center',

    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 18,

    fontWeight: '700',

    marginTop: 10,

    color: '#333',
  },

  emptyText: {
    fontSize: 13,

    color: '#888',

    marginTop: 5,
  },


  // -----------------------------------
  // Add Button
  // -----------------------------------

  addButton: {
    position: 'absolute',

    left: 16,
    right: 16,
    bottom: 18,

    height: 40,

    borderRadius: 9,

    backgroundColor: '#6558F5',

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
  },

  addButtonText: {
    color: '#FFFFFF',

    fontSize: 12,

    fontWeight: '600',

    marginLeft: 5,
  },


  // -----------------------------------
  // Loading
  // -----------------------------------

  loadingContainer: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    marginTop: 10,

    color: '#777',
  },


  bottomSpace: {
    height: 80,
  },

logButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  marginTop: 6,

  paddingVertical: 5,
  paddingHorizontal: 9,

  borderRadius: 7,

  backgroundColor: '#6558F5',
},

logButtonText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '600',
  marginLeft: 4,
},

});
