import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Text, Card, IconButton, Surface } from "react-native-paper";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import { db, auth } from "../firebase";

const screenWidth = Dimensions.get("window").width;

const DailyHealthTrackingScreen = () => {
  const [healthData, setHealthData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // GET DATA FROM FIREBASE
  // =====================================================

  useEffect(() => {
    getHealthData();
  }, []);

  const getHealthData = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;


      const healthRef = collection(db, "dailyHealthTracking");
      const q = query(healthRef, where("userID", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id, ...doc.data()
      }));

      data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      setHealthData(data);

      if (data.length > 0) {
        const mostRecentDate = getDateOnly(data[data.length - 1].dateTime);
        setSelectedDate(mostRecentDate);
      }
    } catch (error) {
      console.log("Error getting health data:", error);
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }


  // =====================================================
  // NO DATA
  // =====================================================

  if (healthData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Health Data</Text>
        <Text style={styles.emptyText}>
          Your health information will appear here once you add a record.
        </Text>
      </View>
    );
  }


  // =====================================================
  // SELECTED DAY
  // =====================================================

  const selectedDayData = healthData.filter(item => getDateOnly(item.dateTime) === selectedDate);


  // =====================================================
  // FIND VITALS
  // =====================================================

  const bloodPressure = selectedDayData.find(item => item.name?.toLowerCase().includes("blood pressure"));

  const bloodSugar = selectedDayData.find(item => item.name?.toLowerCase().includes("blood sugar"));

  const mood = selectedDayData.find(item => item.name?.toLowerCase().includes("mood"));


  // =====================================================
  // GET DATES
  // =====================================================

  const dates = [...new Set(healthData.map(item => getDateOnly(item.dateTime)))].slice(-7);

  const chartDates = [...new Set(healthData.map(item => getDateOnly(item.dateTime)))].slice(-14);


  // =====================================================
  // CHART DATA
  // =====================================================

  const systolicData = chartDates.map(date => {
    const item = healthData.find(record =>
      getDateOnly(record.dateTime) === date &&
      record.name?.toLowerCase().includes("blood pressure")
    );

    return item ? getSystolic(item.vitals) : 0;
  });


  const bloodSugarData = chartDates.map(date => {
    const item = healthData.find(record =>
      getDateOnly(record.dateTime) === date &&
      record.name?.toLowerCase().includes("blood sugar")
    );

    return item ? getNumber(item.vitals) : 0;
  });


  const moodData = chartDates.map(date => {
    const item = healthData.find(record =>
      getDateOnly(record.dateTime) === date &&
      record.name?.toLowerCase().includes("mood")
    );

    return item ? getNumber(item.vitals) * 20 : 0;
  });


  // =====================================================
  // MAIN SCREEN
  // =====================================================

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}

      <View style={styles.header}>
        <IconButton icon="arrow-left" size={25} />

        <View style={styles.headerText}>
          <Text style={styles.title}>Health Tracking</Text>
          <Text style={styles.subtitle}>Track your vitals and daily habits</Text>
        </View>

        <View style={styles.periodButton}>
          <Text style={styles.periodText}>3 Months</Text>
          <Text>▼</Text>
        </View>
      </View>


      {/* CURRENT VITALS */}

      <View style={styles.vitalsRow}>

        <VitalCard
          data={bloodPressure}
          defaultName="Blood Pressure"
          defaultIcon="heart-outline"
        />

        <VitalCard
          data={bloodSugar}
          defaultName="Blood Sugar"
          defaultIcon="water"
        />

        <VitalCard
          data={mood}
          defaultName="Mood"
          defaultIcon="emoticon-outline"
        />

      </View>


      {/* CHART */}

      <Card style={styles.chartCard}>
        <Card.Content>

          <View style={styles.legend}>
            <Text style={styles.legendItem}>🔴 Systolic BP</Text>
            <Text style={styles.legendItem}>🔵 Blood Sugar</Text>
            <Text style={styles.legendItem}>🟣 Mood</Text>
          </View>

          <LineChart
            data={{
              labels: chartDates.map(date => formatShortDate(date)),
              datasets: [
                {
                  data: systolicData, color: () => "#FF4D5A", strokeWidth: 2
                },
                {
                  data: bloodSugarData, color: () => "#2679FF", strokeWidth: 2
                },
                {
                  data: moodData, color: () => "#8146FF", strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 35}
            height={260}
            chartConfig={{
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              decimalPlaces: 0,
              color: () => "#555555",
              labelColor: () => "#777777",
              propsForDots: { r: "4" },
              propsForBackgroundLines: { strokeDasharray: "" }
            }}
            bezier
            fromZero={false}
            style={styles.chart}
          />

        </Card.Content>
      </Card>


      {/* DATE SELECTOR */}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>

        {dates.map(date => (
          <Card
            key={date}
            style={[
              styles.dateCard,
              selectedDate === date && styles.selectedDateCard
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Card.Content>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText
                ]}
              >
                {formatShortDate(date)}
              </Text>
            </Card.Content>
          </Card>
        ))}

      </ScrollView>


      {/* DETAILS */}

      <Card style={styles.detailsCard}>
        <Card.Content>

          <Text style={styles.detailsTitle}>
            Details for {formatFullDate(selectedDate)}
          </Text>


          {/* VITAL DETAILS */}

          <View style={styles.detailVitals}>

            <DetailVital
              data={bloodPressure}
              defaultName="Blood Pressure"
              defaultIcon="heart-outline"
            />

            <DetailVital
              data={bloodSugar}
              defaultName="Blood Sugar"
              defaultIcon="water"
            />

            <DetailVital
              data={mood}
              defaultName="Mood"
              defaultIcon="emoticon-outline"
            />

          </View>


          {/* HEALTH RECORDS */}

          <Text style={styles.sectionTitle}>Health Records</Text>

          {selectedDayData.map(item => (
            <HealthRow
              key={item.id}
              icon={item.icon || "heart-outline"}
              name={item.name}
              value={item.vitals}
              dateTime={item.dateTime}
            />
          ))}

        </Card.Content>
      </Card>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
};


// =====================================================
// VITAL CARD
// =====================================================

const VitalCard = ({ data, defaultName, defaultIcon }) => {
  return (
    <Card style={styles.vitalCard}>
      <Card.Content>

        <View style={styles.vitalIconContainer}>
          <IconButton
            icon={data?.icon || defaultIcon}
            size={20}
            iconColor="#5964FF"
          />
        </View>

        <Text style={styles.vitalLabel}>
          {data?.name || defaultName}
        </Text>

        <Text style={styles.vitalValue}>
          {data?.vitals || "--"}
        </Text>

        <Text style={styles.vitalUnit}>
          {getUnit(data?.name)}
        </Text>

      </Card.Content>
    </Card>
  );
};


// =====================================================
// DETAIL VITAL
// =====================================================

const DetailVital = ({ data, defaultName, defaultIcon }) => {
  return (
    <View style={styles.detailVital}>

      <IconButton
        icon={data?.icon || defaultIcon}
        size={20}
        iconColor="#5964FF"
        style={{ margin: 0 }}
      />

      <Text style={styles.detailVitalName}>
        {data?.name || defaultName}
      </Text>

      <Text style={styles.detailVitalValue}>
        {data?.vitals || "--"}
      </Text>

      <Text style={styles.detailVitalUnit}>
        {getUnit(data?.name)}
      </Text>

    </View>
  );
};


// =====================================================
// HEALTH ROW
// =====================================================

const HealthRow = ({ icon, name, value, dateTime }) => {
  return (
    <Surface style={styles.healthRow} elevation={0}>

      <View style={styles.rowIcon}>
        <IconButton icon={icon} size={23} iconColor="#4E5EFF" />
      </View>

      <View style={styles.rowMiddle}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowDate}>{formatTime(dateTime)}</Text>
      </View>

      <Text style={styles.rowValue}>{value}</Text>

      <Text style={styles.rowArrow}>›</Text>

    </Surface>
  );
};


// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getDateOnly = dateTime => {
  const date = new Date(dateTime);
  return date.toISOString().split("T")[0];
};


const formatShortDate = dateString => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric"
  });
};


const formatFullDate = dateString => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
};


const formatTime = dateTime => {
  const date = new Date(dateTime);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit"
  });
};


const getNumber = value => {
  if (typeof value === "number") {
    return value;
  }

  const number = parseFloat(String(value).replace(/[^\d.]/g, ""));

  return isNaN(number) ? 0 : number;
};


const getSystolic = value => {
  if (!value) {
    return 0;
  }

  const systolic = String(value).split("/")[0];

  return parseFloat(systolic) || 0;
};


const getUnit = name => {
  if (!name) {
    return "";
  }

  const lower = name.toLowerCase();

  if (lower.includes("blood pressure")) {
    return "mmHg";
  }

  if (lower.includes("blood sugar")) {
    return "mg/dL";
  }

  if (lower.includes("mood")) {
    return "out of 5";
  }

  return "";
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1, backgroundColor: "#F8F9FD", paddingHorizontal: 12
  },

  header: {
    flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 15
  },

  headerText: {
    flex: 1
  },

  title: {
    fontSize: 24, fontWeight: "700", color: "#10132B"
  },

  subtitle: {
    fontSize: 12, color: "#777", marginTop: 2
  },

  periodButton: {
    flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EEF1FF", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20
  },

  periodText: {
    fontSize: 12, color: "#25294A"
  },

  vitalsRow: {
    flexDirection: "row", gap: 7, marginBottom: 12
  },

  vitalCard: {
    flex: 1, borderRadius: 15, backgroundColor: "#FFFFFF", elevation: 0
  },

  vitalIconContainer: {
    width: 35, height: 35, borderRadius: 20, backgroundColor: "#EEF0FF", alignItems: "center", justifyContent: "center", marginBottom: 3
  },

  vitalLabel: {
    fontSize: 10, color: "#555", marginTop: 2
  },

  vitalValue: {
    fontSize: 17, fontWeight: "700", color: "#11152E", marginTop: 4
  },

  vitalUnit: {
    fontSize: 9, color: "#888"
  },

  chartCard: {
    borderRadius: 18, backgroundColor: "#FFFFFF", elevation: 0, marginBottom: 12, overflow: "hidden"
  },

  legend: {
    flexDirection: "row", justifyContent: "space-around", marginBottom: 5
  },

  legendItem: {
    fontSize: 9, color: "#666"
  },

  chart: {
    marginLeft: -15, borderRadius: 15
  },

  dateScroll: {
    marginBottom: 12
  },

  dateCard: {
    marginRight: 7, borderRadius: 15, backgroundColor: "#FFFFFF", elevation: 0
  },

  selectedDateCard: {
    backgroundColor: "#536DFE"
  },

  dateText: {
    fontSize: 11, color: "#444"
  },

  selectedDateText: {
    color: "#FFFFFF", fontWeight: "700"
  },

  detailsCard: {
    borderRadius: 20, backgroundColor: "#FFFFFF", elevation: 0, marginBottom: 20
  },

  detailsTitle: {
    fontSize: 17, fontWeight: "700", color: "#151832", marginBottom: 15
  },

  detailVitals: {
    flexDirection: "row", gap: 7, marginBottom: 18
  },

  detailVital: {
    flex: 1, backgroundColor: "#F7F8FC", borderRadius: 13, padding: 8
  },

  detailVitalName: {
    fontSize: 9, color: "#666"
  },

  detailVitalValue: {
    fontSize: 15, fontWeight: "700", marginTop: 4, color: "#151832"
  },

  detailVitalUnit: {
    fontSize: 9, color: "#888"
  },

  sectionTitle: {
    fontSize: 15, fontWeight: "700", marginBottom: 8, color: "#151832"
  },

  healthRow: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EEEEF4", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 5, marginBottom: 7, backgroundColor: "#FFFFFF"
  },

  rowIcon: {
    width: 40, alignItems: "center"
  },

  rowMiddle: {
    flex: 1
  },

  rowName: {
    fontSize: 13, fontWeight: "600", color: "#1B1E39"
  },

  rowDate: {
    fontSize: 10, color: "#888", marginTop: 2
  },

  rowValue: {
    fontSize: 12, fontWeight: "600", color: "#25294A", marginRight: 5
  },

  rowArrow: {
    fontSize: 23, color: "#888"
  },

  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 10
  },

  loadingText: {
    color: "#777"
  },

  emptyContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", padding: 30
  },

  emptyTitle: {
    fontSize: 22, fontWeight: "700", marginBottom: 8
  },

  emptyText: {
    textAlign: "center", color: "#777"
  }

});

export default DailyHealthTrackingScreen;
