
import React, { useEffect, useMemo, useState } from "react";
import {View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Card,
  IconButton,
  Surface,
  Divider
} from "react-native-paper";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// =====================================================
// MAIN SCREEN
// =====================================================

const HealthTrendScreen = () => {
  const [healthData, setHealthData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  
  // Load fictional sample data
  useEffect(() => {
    const sampleData = createSampleHealthData();

    setHealthData(sampleData);
    setSelectedDate(getDateOnly(new Date()));
    setLoading(false);
  }, []);

  const dates = useMemo(() => {
    return [...new Set(
      healthData.map((item) => getDateOnly(item.dateTime))
    )]
      .sort()
      .slice(-7);
  }, [healthData]);
  
  const chartDates = useMemo(() => {
    return [...new Set(
      healthData.map((item) => getDateOnly(item.dateTime))
    )]
      .sort()
      .slice(-14);
  }, [healthData]);
  
  
    // Your loading screen comes after this

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5964FF" />
        <Text style={styles.loadingText}>
          Loading your health data...
        </Text>
      </View>
    );
  }

  // =====================================================
  // NO DATA SCREEN
  // =====================================================

  if (healthData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Tracking Data</Text>
        <Text style={styles.emptyText}>
          Your health and habit records will appear here.
        </Text>
      </View>
    );
  }

  // =====================================================
  // SELECTED DAY DATA
  // =====================================================

  const selectedDayData = healthData.filter(
    (item) => getDateOnly(item.dateTime) === selectedDate
  );

  const bloodPressure = selectedDayData.find(
    (item) => item.name === "Blood Pressure"
  );

  const bloodSugar = selectedDayData.find(
    (item) => item.name === "Blood Sugar"
  );

  const mood = selectedDayData.find(
    (item) => item.name === "Mood"
  );

  // Habit records only
  const selectedDayHabits = selectedDayData.filter((item) =>
    ["Sleep", "Exercise", "Water Intake", "Steps", "Calories"]
        .includes(item.name)
);

  // =====================================================
  // DATE SELECTOR
  // =====================================================


  // =====================================================
  // CHART DATA
  // =====================================================

  const systolicData = chartDates.map((date) => {
    const item = healthData.find(
      (record) =>
        getDateOnly(record.dateTime) === date &&
        record.name === "Blood Pressure"
    );
    return item ? getSystolic(item.vitals) : 0;
  });

  const bloodSugarData = chartDates.map((date) => {
    const item = healthData.find(
      (record) =>
        getDateOnly(record.dateTime) === date &&
        record.name === "Blood Sugar"
    );

    return item ? getNumber(item.vitals) : 0;
  });

  const moodData = chartDates.map((date) => {
    const item = healthData.find(
      (record) =>
        getDateOnly(record.dateTime) === date &&
        record.name === "Mood"
    );

    return item ? getNumber(item.vitals) * 20 : 0;
  });

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={25}
          iconColor="#202344"
        />

        <View style={styles.headerText}>
          <Text style={styles.title}>Health Tracking</Text>
          <Text style={styles.subtitle}>
            Track your vitals and daily habits
          </Text>
          <Text style={styles.demoLabel}>
            DEMO DATA · FICTIONAL EXAMPLE
          </Text>
        </View>

        <View style={styles.periodButton}>
          <Text style={styles.periodText}>14 Days</Text>
        </View>
      </View>

      {/* VITAL CARDS */}

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

      {/* VITALS CHART */}

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>
            Health Trends
          </Text>

          <View style={styles.legend}>
            <Text style={styles.legendItem}>
              🔴 Systolic BP
            </Text>
            <Text style={styles.legendItem}>
              🔵 Blood Sugar
            </Text>
            <Text style={styles.legendItem}>
              🟣 Mood
            </Text>
          </View>

          <LineChart
            data={{
              labels: chartDates.map((date) =>
                formatShortDate(date)
              ),
              datasets: [
                {
                  data: systolicData,
                  color: () => "#FF4D5A",
                  strokeWidth: 2,
                },
                {
                  data: bloodSugarData,
                  color: () => "#2679FF",
                  strokeWidth: 2,
                },
                {
                  data: moodData,
                  color: () => "#8146FF",
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 48}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              decimalPlaces: 0,
              color: () => "#555555",
              labelColor: () => "#777777",
              propsForDots: {
                r: "3",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#ECECF4",
              },
            }}
            bezier
            fromZero={false}
            style={styles.chart}
          />

          <Text style={styles.chartNote}>
            Mood is scaled for display. Blood pressure, blood sugar,
            and mood use different units, so compare each trend
            cautiously.
          </Text>
        </Card.Content>
      </Card>

      {/* DATE SELECTOR */}

      <Text style={styles.sectionTitle}>Choose a Date</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
      >
        {dates.map((date) => (
          <Card
            key={date}
            style={[
              styles.dateCard,
              selectedDate === date && styles.selectedDateCard,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Card.Content style={styles.dateCardContent}>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {formatShortDate(date)}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* SELECTED DAY DETAILS */}

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.detailsTitle}>
            Details for {formatFullDate(selectedDate)}
          </Text>

          {/* VITAL DETAILS */}

          <Text style={styles.sectionTitle}>
            Daily Vitals
          </Text>

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

          <Divider style={styles.divider} />

          {/* HABIT RECORDS */}

          <Text style={styles.sectionTitle}>
            Habit Records
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your daily activity and wellness habits
          </Text>

          {selectedDayHabits.length > 0 ? (
            selectedDayHabits.map((item) => (
              <HealthRow
                key={item.id}
                icon={item.icon}
                name={item.name}
                value={item.vitals}
                dateTime={item.dateTime}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No habit records for this day.
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={{ height: 35 }} />
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
            icon={defaultIcon}
            size={20}
            iconColor="#5964FF"
            style={{ margin: 0 }}
          />
        </View>

        <Text style={styles.vitalLabel}>
          {defaultName}
        </Text>

        <Text style={styles.vitalValue}>
          {data?.vitals ?? "--"}
        </Text>

        <Text style={styles.vitalUnit}>
          {getUnit(defaultName)}
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
        icon={defaultIcon}
        size={20}
        iconColor="#5964FF"
        style={{ margin: 0 }}
      />

      <Text style={styles.detailVitalName}>
        {defaultName}
      </Text>

      <Text style={styles.detailVitalValue}>
        {data?.vitals ?? "--"}
      </Text>

      <Text style={styles.detailVitalUnit}>
        {getUnit(defaultName)}
      </Text>
    </View>
  );
};

// =====================================================
// HABIT RECORD ROW
// =====================================================

const HealthRow = ({ icon, name, value, dateTime }) => {
  return (
    <Surface style={styles.healthRow} elevation={0}>
      <View style={styles.rowIcon}>
        <IconButton
          icon={icon || "check-circle-outline"}
          size={23}
          iconColor="#4E5EFF"
          style={{ margin: 0 }}
        />
      </View>

      <View style={styles.rowMiddle}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowDate}>
          {formatTime(dateTime)}
        </Text>
      </View>

      <Text style={styles.rowValue}>{value}</Text>
    </Surface>
  );
};

// =====================================================
// SAMPLE DATA GENERATOR
// =====================================================

const createSampleHealthData = () => {
  const records = [];

  const sampleValues = [
    { bloodPressure: "118/76", bloodSugar: "92", mood: "4", sleep: 8, exercise: 30, water: 6, steps: 7500, calories: 2000 },
    { bloodPressure: "120/78", bloodSugar: "95", mood: "3", sleep: 7.5, exercise: 20, water: 7, steps: 8200, calories: 2100 },
    { bloodPressure: "117/75", bloodSugar: "89", mood: "4", sleep: 8.5, exercise: 45, water: 8, steps: 9100, calories: 2200 },
    { bloodPressure: "121/79", bloodSugar: "98", mood: "5", sleep: 8, exercise: 35, water: 6, steps: 7800, calories: 2000 },
    { bloodPressure: "119/77", bloodSugar: "94", mood: "4", sleep: 7, exercise: 25, water: 7, steps: 8500, calories: 2500 },
    { bloodPressure: "116/74", bloodSugar: "91", mood: "3", sleep: 8, exercise: 40, water: 8, steps: 10000, calories: 2100 },
    { bloodPressure: "122/80", bloodSugar: "97", mood: "4", sleep: 7.5, exercise: 30, water: 6, steps: 7200, calories: 2200 },
    { bloodPressure: "118/76", bloodSugar: "93", mood: "5", sleep: 9, exercise: 50, water: 8, steps: 11000, calories: 2100 },
    { bloodPressure: "120/77", bloodSugar: "96", mood: "4", sleep: 8, exercise: 30, water: 7, steps: 8900, calories: 2400 },
    { bloodPressure: "117/75", bloodSugar: "90", mood: "3", sleep: 7, exercise: 20, water: 6, steps: 6500, calories: 2300 },
    { bloodPressure: "119/78", bloodSugar: "94", mood: "4", sleep: 8.5, exercise: 40, water: 8, steps: 9500, calories: 2500 },
    { bloodPressure: "121/79", bloodSugar: "99", mood: "4", sleep: 7.5, exercise: 25, water: 7, steps: 8000, calories: 2000 },
    { bloodPressure: "118/76", bloodSugar: "92", mood: "5", sleep: 9, exercise: 45, water: 8, steps: 10500, calories: 1900 },
    { bloodPressure: "120/78", bloodSugar: "95", mood: "4", sleep: 8, exercise: 35, water: 7, steps: 9000, calories: 2300 },
  ];

  sampleValues.forEach((values, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    date.setHours(12, 0, 0, 0);

    const dateTime = date.toISOString();

    records.push(
      {
        id: `sample-bp-${index}`,
        userID: "demo-user",
        name: "Blood Pressure",
        vitals: values.bloodPressure,
        icon: "heart-outline",
        dateTime,
      },
      {
        id: `sample-calories-${index}`,
        userID: "demo-user",
        name: "Calories",
        vitals: `${values.calories} kcal`,
        icon: "food-apple",
        dateTime,
    },
      {
        id: `sample-sugar-${index}`,
        userID: "demo-user",
        name: "Blood Sugar",
        vitals: values.bloodSugar,
        icon: "water",
        dateTime,
      },
      {
        id: `sample-mood-${index}`,
        userID: "demo-user",
        name: "Mood",
        vitals: values.mood,
        icon: "emoticon-outline",
        dateTime,
      },
      {
        id: `sample-sleep-${index}`,
        userID: "demo-user",
        name: "Sleep",
        vitals: `${values.sleep} hours`,
        icon: "sleep",
        dateTime,
      },
      {
        id: `sample-exercise-${index}`,
        userID: "demo-user",
        name: "Exercise",
        vitals: `${values.exercise} minutes`,
        icon: "run",
        dateTime,
      },
      {
        id: `sample-water-${index}`,
        userID: "demo-user",
        name: "Water Intake",
        vitals: `${values.water} glasses`,
        icon: "cup-water",
        dateTime,
      },
      {
        id: `sample-steps-${index}`,
        userID: "demo-user",
        name: "Steps",
        vitals: `${values.steps.toLocaleString()} steps`,
        icon: "walk",
        dateTime,
      }
    );
  });

  return records;
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getDateOnly = (dateTime) => {
  const date = new Date(dateTime);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatShortDate = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatFullDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateTime) => {
  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getNumber = (value) => {
  const number = parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isNaN(number) ? 0 : number;
};

const getSystolic = (value) => {
  if (!value) return 0;

  return parseFloat(String(value).split("/")[0]) || 0;
};

const getUnit = (name) => {
  const lower = name.toLowerCase();

  if (lower.includes("blood pressure")) return "mmHg";
  if (lower.includes("blood sugar")) return "mg/dL";
  if (lower.includes("mood")) return "out of 5";

  return "";
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
    paddingHorizontal: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 18,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10132B",
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  demoLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#5964FF",
    marginTop: 5,
  },

  periodButton: {
    backgroundColor: "#EEF1FF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
  },

  periodText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#25294A",
  },

  vitalsRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 14,
  },

  vitalCard: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    elevation: 0,
  },

  vitalIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  vitalLabel: {
    fontSize: 10,
    color: "#555",
    marginTop: 3,
  },

  vitalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#11152E",
    marginTop: 5,
  },

  vitalUnit: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },

  chartCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    elevation: 0,
    marginBottom: 18,
    overflow: "hidden",
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#151832",
    marginBottom: 12,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },

  legendItem: {
    fontSize: 9,
    color: "#666",
  },

  chart: {
    marginLeft: -15,
    borderRadius: 15,
  },

  chartNote: {
    fontSize: 10,
    color: "#888",
    lineHeight: 15,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#151832",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: -5,
    marginBottom: 12,
  },

  dateScroll: {
    marginBottom: 16,
  },

  dateCard: {
    marginRight: 8,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    elevation: 0,
  },

  dateCardContent: {
    paddingVertical: 4,
    paddingHorizontal: 3,
  },

  selectedDateCard: {
    backgroundColor: "#536DFE",
  },

  dateText: {
    fontSize: 11,
    color: "#444",
  },

  selectedDateText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  detailsCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    elevation: 0,
    marginBottom: 20,
  },

  detailsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#151832",
    marginBottom: 16,
  },

  detailVitals: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 18,
  },

  detailVital: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    borderRadius: 13,
    padding: 8,
  },

  detailVitalName: {
    fontSize: 9,
    color: "#666",
    marginTop: 5,
  },

  detailVitalValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
    color: "#151832",
  },

  detailVitalUnit: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },

  divider: {
    marginBottom: 16,
    backgroundColor: "#ECECF4",
  },

  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEF4",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 5,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },

  rowIcon: {
    width: 40,
    alignItems: "center",
  },

  rowMiddle: {
    flex: 1,
    paddingLeft: 5,
  },

  rowName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B1E39",
  },

  rowDate: {
    fontSize: 10,
    color: "#888",
    marginTop: 3,
  },

  rowValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#25294A",
    marginRight: 8,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "#777",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FD",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#151832",
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    lineHeight: 20,
  },
});

export default HealthTrendScreen;
