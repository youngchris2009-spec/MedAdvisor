// theme.js
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // MedAdvisor brand colors
    primary: '#00BFA5',           // Teal/green from logo
    onPrimary: '#FFFFFF',

    primaryContainer: '#D8F7F1',  // Very light teal
    onPrimaryContainer: '#00695C',

    secondary: '#0866D5',         // Blue from logo
    onSecondary: '#FFFFFF',

    secondaryContainer: '#DCEBFF',
    onSecondaryContainer: '#064A9D',

    // Inputs / borders
    outline: '#00AFA0',
    outlineVariant: '#72B5B3',

    // Backgrounds
    background: '#FFFFFF',
    onBackground: '#123A63',

    surface: '#FFFFFF',
    onSurface: '#123A63',

    surfaceVariant: '#EFFAF8',
    onSurfaceVariant: '#426A70',

    // Errors
    error: '#BA1A1A',
    onError: '#FFFFFF',
  },
};

export default theme;
