import React, { useContext, useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { db } from "../firebase/index";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteField,
} from "firebase/firestore";

export default function RoomScreen({ setScreen, screens, setRoomId, roomId }) {

  const onCallOrJoin = (screen) => {
    if (roomId.length > 0) {
      setScreen(screen);
    }
  };

  //generating random room id
  useEffect(() => {
    const generateRandomId = () => {
      const characters = "abcdefghijklmnopqrstuvwxyz";
      let result = "";
      for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }
      return setRoomId(result);
    };
    generateRandomId();
  }, []);


  // send roomid to fastapi backend

  const sendingRoomID = async () => {
    try {
      const response = fetch('https://36c1-2400-adcc-159-200-414f-2de5-630d-90d1.ngrok-free.app/getUserId', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: roomId
    })

        const data = await response.json();
        console.log('Server response:', data);

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload File! throw error!');
        }

        console.log('File Uploaded Successfully')
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  //checks if room is existing
  const checkMeeting = async () => {
    if (roomId) {
      const roomRef = doc(db, "room", roomId);
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists() || roomId === "") {
        Alert.alert("Wait for your instructor to start the meeting.");
        return;
      } else {
        onCallOrJoin(screens.JOIN);
      }
    } else {
      Alert.alert("Provide a valid Room ID.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '30%'
          }}>
            <Image style={{width: 300, height: 90}} source={require('../images/logoWhite.png')}/>
      </View>
    <View >
      <Text style={{
        fontSize: 24,
        fontWeight: "bold", 
        textAlign: "center",
        padding: 10,
        color: 'white',
        fontFamily: 'serif'
      }}>
          Enter Room ID
        </Text>
      <TextInput
        style={{
            color: 'black',
            backgroundColor: '#fff',
            borderWidth: 2,
            width: '94%',
            padding: 10,
            borderRadius: 15,
            alignSelf:'center',
            fontFamily: 'serif',
        }}
        value={roomId}
        onChangeText={setRoomId}
      />
      <View>
        <LinearGradient
            colors={['black','black']}
            style={{width: '94%', height: 55, margin: 12, marginBottom:0, borderRadius: 20, justifyContent: 'center'}}
        >
          <TouchableOpacity
            style={{
                alignItems: 'center'
            }}
            onPress={() => {
              onCallOrJoin(screens.CALL);

            }}
          >
            <Text style={styles.textButton}>
              Start Meeting
            </Text>
          </TouchableOpacity>
        </LinearGradient>
        <LinearGradient
            colors={['black','black']}
            style={{width: '94%', height: 55, margin: 12, borderRadius: 20, justifyContent: 'center'}}
        >
        <TouchableOpacity
          style={{
            alignItems: 'center',
          }}
          onPress={() => {
            checkMeeting();
          }}
        >
          <Text 
          style={styles.textButton}>
            Join Meeting
          </Text>
        </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    paddingTop: '50%',
  },
  textButton:{
    fontSize:17,
    fontWeight:'bold',
    color: 'white',
    fontFamily: 'serif'
}
})