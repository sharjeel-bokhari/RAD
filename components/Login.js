import React, { useContext, useState } from "react";
import { StyleSheet,View,SafeAreaView,Text,Alert,TextInput,TouchableOpacity, Modal, Image} from "react-native";
import {app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "../firebase/index"
import AppContext from "./AppContext";
// import { Feather } from '@expo/vector-icons';
import RoomScreen from "./RoomScreen";
import CallScreen from "./CallScreen";
import JoinScreen from "./JoinScreen";
import { signOut } from "firebase/auth";
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from "react-native-linear-gradient";

const Login = (props) => {
  const Screens = {
    ROOM: "JOIN_ROOM",
    CALL: "CALL",
    JOIN: "JOIN",
  };
    const [text, onChangeText] = useState("");
    const [text2, onChangeText2] = useState("");
    const [showPass, setShowPass] = useState(true)
    const {setUser} = useContext(AppContext);
    const [isRoomScreen, setIsRoomScreen] = useState(false);
    const [screen, setScreen] = useState(Screens.ROOM);
    const [roomId, setRoomId] = useState("");
    
    return(
      <LinearGradient
          colors={['#3b5998', '#00020d','#00020d', '#61d4b7']}
          start={{x:0,y: -0.15}} end={{x:1.2, y:1.2}}
          style={{
            minHeight: '100%'
          }}
      >
    <SafeAreaView style={styles.container}>
          <View style={{
            display: 'flex',
            flex: 0.5,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            
          }}>
            <Image style={{width: 300, height: 90}} source={require('../images/logoWhite.png')}/>
          </View>
      <View>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder="Email"
          placeholderTextColor={"gray"}
          value={text}
        />
        <View style={styles.passView}>
          <TextInput
            style={styles.passInput}
            onChangeText={onChangeText2}
            value={text2}
            placeholder="Password"
            placeholderTextColor={"gray"}
            secureTextEntry={showPass}
          />
          {/* <TouchableOpacity>
            <Feather name={showPass ? "eye-off": "eye"} size={24} color="black" onPress={() => {setShowPass(!showPass)}} />
          </TouchableOpacity> */}
        </View>
        <View style={styles.fixToText}>
          <LinearGradient
              colors={['black','black']}
              style={{width: '94%', height: 55, margin: 12, marginBottom: 0,borderRadius: 20, justifyContent: 'center'}}
          >
              <TouchableOpacity
                // style={styles.loginScreenButton}
                title="Register"
                onPress={ async () =>
                  await createUserWithEmailAndPassword(auth, text, text2)
                    .then((userCredential) => {
                      // Registration Successful
                      console.log("\n\n\n\n\n\nLogin now");
                      const user = userCredential.user;
                      const payload = {
                        email: user.email,
                      }
                      setUser(payload);
                      Alert.alert("Registration Successful");
                      // props.navigation.navigate("Home");
                      setIsRoomScreen(true);
                    })
                    .catch((error) => {
                      console.log("\n\n\n\n\n\nError now", error.message);
                      if (error.code == "auth/email-already-in-use"){
                        Alert.alert("This Email Already Exists")
                      }
                      if (error.code == "auth/invalid-email") {
                        Alert.alert("Please Enter a Valid Email");
                      }
                    })
                }
              >
                <Text style={styles.title}>Register</Text>
              </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
              colors={['black','black']}
              style={{width: '94%', height: 55, margin: 12, borderRadius: 20, justifyContent: 'center'}}
          >
          <TouchableOpacity
            onPress={() => {
                signInWithEmailAndPassword(auth, text, text2)
                .then((userCredential) => {
                  const user = userCredential.user;
                  const payload = {
                    email: user.email,
                  }
                  setUser(payload);
                  // props.navigation.navigate("Home");
                  console.log("Login Successful!");
                  setIsRoomScreen(true);
                })
                .catch((error) => {
                  if (error.code ==  "auth/invalid-login-credentials") {
                    Alert.alert("Invalid Credentials!");
                  }
                });
            }}
          >
            <Text style={styles.title}>Login</Text>
          </TouchableOpacity>
          </LinearGradient>
          
          <Modal
            visible={isRoomScreen}
            animationType='fade'
            presentationStyle="fullScreen"
          >
            <LinearGradient
              colors={['#3b5998', '#00020d','#00020d', '#61d4b7']}
              start={{x:0,y: -0.15}} end={{x:1.2, y:1.2}}
              style={{
                minHeight: '100%'
              }}
            >
            <SafeAreaView style={styles.modal}>
                {screen == Screens.ROOM ? 
                    <View>
                      <LinearGradient
                          colors={['black','black']}
                          style={styles.logout}
                      >
                          <TouchableOpacity 
                            onPress={async () => {
                                console.log('logging out!');
                                await signOut(auth)
                                .then(() => {
                                    console.log("Logged Out Successfully!");
                                    setIsRoomScreen(false);
                                })
                                .catch ((err) => {
                                    console.log("\n\n\n\nSigning out Error:\t", err, "\n\n\n\n");
                                })
                            }}
                            >
                            <Text style={{color: 'white'}}>
                              Logout
                            </Text>
                          </TouchableOpacity>
                      </LinearGradient>
                      <View style={{
                        display:'flex',
                        
                      }}>
                      <RoomScreen 
                          roomId={roomId}
                          setRoomId={setRoomId}
                          screens={Screens}
                          setScreen={setScreen}
                      />
                      </View>
                    </View>
                :
                    (screen == Screens.CALL ? 
                        <CallScreen 
                            roomId={roomId} 
                            screens={Screens} 
                            setScreen={setScreen}
                        /> 
                    : 
                        <JoinScreen 
                            roomId={roomId} 
                            screens={Screens} 
                            setScreen={setScreen}
                        />
                    )
                }
            </SafeAreaView>
          </LinearGradient>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      // backgroundColor: "white",
    },
    title: {
      textAlign: "center",
      color: "white",
      fontSize: 20,
      padding: 4,
      fontFamily: 'serif',
      fontWeight:'bold'
    },
    fixToText: {
      flexDirection: "column",
      justifyContent: "space-around",
    },
    passView: {
      flexDirection: 'row',
      width: '95%',
      marginHorizontal: 12,
      height: 50,
      color: 'black',
      fontFamily:'serif',
      borderRadius: 8,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white'
    },
    passInput: {
      width: '100%',
      padding: 10,
      height: 50,
      fontSize: 20,
      fontWeight: '500',
      color: 'black',
      backgroundColor: 'white',
      fontFamily:'serif',
      borderRadius: 8,
    },
    input: {
      height: 50,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      fontFamily:'serif',
      color: 'black',
      fontSize: 20,
      borderRadius: 8,
      fontWeight: '500',
      backgroundColor: 'white'
    },
    loginScreenButton: {
      height: 60,
      width: "94%",
      marginRight: 12,
      marginLeft: 12,
      marginTop: 12,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 20,
    },
    heading: {
      fontWeight: "bold",
      fontSize: 35,
      color: "gray",
      textAlign: "center",
      marginBottom: 40,
      fontFamily: "Times New Roman",
    },
    logout: {
      margin: 15,
      alignSelf:'flex-end',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 20,
      width: 85
    },
    modal: {
      display: 'flex',
      // height:'100%',
      // alignItems: '',
      // justifyContent: 'space-evenly'
    }
  });
export {Login};