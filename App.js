import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignupScreen';
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
    
  </Stack.Navigator>
  </NavigationContainer>
  </PaperProvider>
  )
}

export default App