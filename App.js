import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DashBoard from './views/DashBoard';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, Button, createTheme } from '@rneui/themed';

const theme = createTheme({
  Button: {
    raised: true,
  },
});


export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <View style={styles.container}>
          <DashBoard></DashBoard>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: 'red',
    // alignItems: 'center',
    // justifyContent: 'center',
    // margin: 0,
    marginTop: 10,

  },
  h1: {
    // fontfamily: 'Qualion',
    fontStyle: 'normal',
    fontWeight: 800,
    lineHeight: 32,
    color: "#7DC253",
  }
});

