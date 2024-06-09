import { StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppContext from './components/AppContext';
import { Login } from './components/Login';
// import { NavigationContainer } from "@react-navigation/native";
import 'react-native-gesture-handler';
import CallActionBox from './components/CallActionBox';
import { LinearGradient } from 'react-native-linear-gradient'

const App = () => {
  
  const [user, setUser] = useState({});
  const [loadAgain, setLoadAgain] = useState(false);
//   const [isJoinerScammer, setIsJoinerScammer] = useState(false);
//   const [isCallerScammer, setIsCallerScammer] = useState(false);
//   const [apiRoomID, setApiRoomID] = useState("");
  
  return (
    // <NavigationContainer>
    <AppContext.Provider 
      value={{
        user,
        setUser,
        loadAgain,
        setLoadAgain,
      }}
    >
        <Login />
        
    </AppContext.Provider>
    // </NavigationContainer>
  )
}

const styles = StyleSheet.create ({
  contactNameCard:{
      marginVertical: 5,
      flexDirection: 'row',
      padding: 15,
      backgroundColor: '#dddddf',
      width: '95%',
      borderRadius: 10,
      alignSelf: 'center',
  },
  modalUpdateScreen: {
      flex: 1
  },
  modalUpdateScreenBody:{
      flex: 9,
      justifyContent: 'flex-start',
  },
  inputModalUpdateScreen:{
      height: 50,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      fontSize: 20,
      borderRadius: 8,
      fontFamily: 'Times New Roman',
      fontSize: 15,
  },
  modalUpdateScreenHeader: {
      flex: 1,
      flexDirection: 'row',
  },

  modal: {
      flex: 1,
      flexDirection: "column",
  },
  modalBody: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignContent: 'flex-end',
      alignItems: 'flex-end',
  },
  callerId:{
      flex: 1,
  },
  muteID: {
      padding: 20,
      paddingHorizontal: 30,
      backgroundColor: '#dddddf',
      borderRadius: 60
  },
  endCallButton: {
      padding: 20,
      paddingHorizontal: 30,
      backgroundColor: '#dddddf',
      borderRadius: 60
      // flex:1,
      // backgroundColor: 'red',
      // justifyContent: 'center',
      // alignItems: 'center'
  },
})

export default App;