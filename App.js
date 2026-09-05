import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HealthRecommendation from './screens/HealthRecommendation';
import DailyHealthTrackScreen from './screens/DailyHealthTrackScreen';
import PrescriptionScanScreen from './screens/PrescriptionScanScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import { PaperProvider } from 'react-native-paper';
import theme from './theme';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* <Stack.Screen name="Daily Health Track" component={DailyHealthTrackScreen} /> */}
          {/* <Stack.Screen name="Health Recommendation" component={HealthRecommendation} /> */}
          <Stack.Screen name="Prescript Scan" component={PrescriptionScanScreen} />
          <Stack.Screen name="Medication Detail" component={MedicationDetailScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false}} />
          <Stack.Screen name="Register" component={SignUpScreen} />
        
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App

