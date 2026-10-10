import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
import MainScreen from './screens/MainScreen';
import HealthHabitRecommendationsScreen from './screens/HeathHabitRecommendationsScreen';
import DailyHealthTrackScreen from './screens/DailyHealthTrackScreen';
import PrescriptionScanScreen from './screens/PrescriptionScanScreen';
import MedicationListScreen from './screens/MedicationListScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import { PaperProvider } from 'react-native-paper';
import theme from './theme';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false}} />
          <Stack.Screen name="Register" component={SignUpScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Daily Health Track" component={DailyHealthTrackScreen} />
          <Stack.Screen name="Health Recommendation" component={HealthHabitRecommendationsScreen} />
          <Stack.Screen name="Add Medication" component={PrescriptionScanScreen} />
          <Stack.Screen name="Medication List" component={MedicationListScreen} />
          <Stack.Screen name="Medication Detail" component={MedicationDetailScreen} />
          
        
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App
