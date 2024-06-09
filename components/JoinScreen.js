import React, { useState, useEffect, useContext} from "react";
import { Text, StyleSheet, Button, View, Alert } from "react-native";
import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import { db } from "../firebase";
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
import CallActionBox from "../components/CallActionBox";
import { Audio } from 'expo-av';
import RNFetchBlob from 'rn-fetch-blob';
// import AppContext from "./AppContext";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function JoinScreen({ roomId, screens, setScreen }) {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [recordings, setRecordings] = useState();
  const [audioUri, setAudioUri] = useState();
  const [isCallerScammer, setIsCallerScammer] = useState(false);

  // const { isCallerScammer, setIsJoinerScammer } = useContext(AppContext);

  const showAlert = () => {
    Alert.alert("SCAM ALERT!", "You might be getting scammed by the other user!");
    setIsCallerScammer(false);
  }

  const uriToFile = async (fileUri) => {
    try {
        console.log("FileURI:\n\n",fileUri, "\n\n");
        const response = await RNFetchBlob.fs.readFile(fileUri, 'base64');
        
        const formData = new FormData();
        formData.append('data', {
            uri: fileUri,
            name: 'audio.wav',
            type: 'audio/wav',
          });
        formData.append('roomid', roomId);

        console.log("Form Data:\n\n",formData, "\n\n");

        const uploadResponse = await fetch('https://your-ip/upload-audio/join-screen', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        })

        const data = await uploadResponse.json();
        console.log('Server response:', data);
        if (data != null && data!= undefined) {
          console.log("Joiner Server Setting Caller As a Scam:\t");
          if (data.isCallerScam == 1) {
            setIsCallerScammer(true);
          }
          else {
            setIsCallerScammer(false);
          }
        }

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload File! throw error!');
        }

        console.log('File Uploaded Successfully')
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

const recordAndPlay = async () => {
  try {
      console.log("Starting Recording!!");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecordings(recording);
      console.log("Recording Started!!");
      setTimeout( async ()=> {
          console.log("Stopping Recording!!!!!!");
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          console.log("Recording stopped and stored at ", uri);
          uriToFile(uri);
          recordAndPlay();
      }, 10000)

  } catch (e) {
      console.error("Failed to start recording!", e);
  }
}

const stopRecording = async () => {
  console.log("Stopping Recording!!!!!!");
  await recordings.stopAndUnloadAsync();
  const uri = recordings.getURI();
  setAudioUri(uri);
  console.log("Recording stopped and stored at ", uri);
}

  // useEffects

  //  Re-render when the isCallerScammer state is updated
  useEffect(() => {}, [isCallerScammer]);

  useEffect(()=> {},[recordings]);
  //Automatically start stream
  useEffect(() => {
    
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS:true,
        playsInSilentModeIOS: true
      })
    })();
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream) {
      joinCall(roomId);
    }
  }, [localStream]);

  //End call button
  async function endCall() {
    stopRecording()
    if (cachedLocalPC) {
      const senders = cachedLocalPC.getSenders();
      senders.forEach((sender) => {
        cachedLocalPC.removeTrack(sender);
      });
      cachedLocalPC.close();
    }

    const roomRef = doc(db, "room", roomId);
    await updateDoc(roomRef, { answer: deleteField(), connected: false });

    setLocalStream();
    setRemoteStream(); // set remoteStream to null or empty when callee leaves the call
    setCachedLocalPC();
    // cleanup
    setScreen(screens.ROOM); //go back to room screen
  }

  //start local webcam on your device
  const startLocalStream = async () => {
    const constraints = {
      audio: {
        'echoCancellation': true,
        "sampleSize": 16,
        "channelCount": 2,
      },
      video: false
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    setLocalStream(newStream);
  };

  //join call function
  const joinCall = async (id) => {
    const roomRef = doc(db, "room", id);
    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists) return;
    const localPC = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach((track) => {
      localPC.addTrack(track, localStream);
    });
    
    localPC.ondatachannel = (e) => {
      const channel = e.channel;
      channel.onmessage = (e2) => {
        channel.send("Hello to you too");
        console.log("\n\n\n",e2.data,"\n\n\n");
      }
    }

    const callerCandidatesCollection = collection(roomRef, "callerCandidates");
    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    localPC.addEventListener("icecandidate", (e) => {
      if (!e.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("\n\n\nCandidate\n\n\n", e.candidate.toJSON());
      addDoc(calleeCandidatesCollection, e.candidate.toJSON());
    });

    localPC.ontrack = (e) => {
      const newStream = new MediaStream();
      console.log("\n\n\n CODECS \n\n\n", e.streams[0].getAudioTracks()[0].codec);
      e.streams[0].getTracks().forEach((track) => {
        newStream.addTrack(track);
        console.log("\n\n\nRecievers:",localPC.getReceivers(), "\n\n\n");
        console.log("\n\n\n JOINER TRACK \n\n\n",track);
      });
      setRemoteStream(newStream);
    };

    const offer = roomSnapshot.data().offer;
    await localPC.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await localPC.createAnswer();
    await localPC.setLocalDescription(answer);
    console.log("\n\n\nAnswer\n\n\n", answer);
    await updateDoc(roomRef, { answer, connected: true }, { merge: true });

    onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          localPC.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    onSnapshot(roomRef, (doc) => {
      const data = doc.data();
      if (!data.answer) {
        setScreen(screens.ROOM);
      }
    });

    setCachedLocalPC(localPC);
    recordAndPlay();
  };

  // Mutes the local's outgoing audio
  const toggleMute = () => {
    if (!remoteStream) {
      return;
    }
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  return (
    <View
        style={{
          flex: 1,
          flexDirection:'column',
          minHeight: "100%"
        }}
    >
      { isCallerScammer ? showAlert() : <></>}
        <CallActionBox
          toggleMute={toggleMute}
          endCall={endCall}
        />
    </View>
  );
}