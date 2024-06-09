import React, { useEffect, useState, useContext } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from 'expo-av';
import RNFetchBlob from 'rn-fetch-blob';
import {
    RTCPeerConnection,
    mediaDevices, 
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStream
} from "react-native-webrtc";
import {
    db, 
    addDoc, 
    collection, 
    doc, 
    setDoc, 
    updateDoc, 
    onSnapshot, 
    deleteField 
} from "../firebase/index";
import CallActionBox from "./CallActionBox";
// import AppContext from "./AppContext";

const configuration = {
    iceServers: [
      {
        urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      },
    ],
    iceCandidatePoolSize: 10,
  };

const CallScreen = ({ roomId, screens, setScreen }) => {
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();
    const [isMuted, setIsMuted] = useState(false);
    const [recording, setRecording] = useState();
    const [isJoinerScammer, setIsJoinerScammer] = useState(false);

    const [recordings, setRecordings] = useState();
    const [audioUri, setAudioUri] = useState();

    // const { setIsCallerScammer, isJoinerScammer} = useContext(AppContext);

    const uriToFile = async (fileUri) => {
      try {
          console.log("FileURI:\n\n",fileUri, "\n\n");
          const response = await RNFetchBlob.fs.readFile(fileUri, 'base64');
          // console.log("response:\n\n",response, "\n\n");

          const formData = new FormData();
          formData.append('data', {
              uri: fileUri,
              name: 'audio.wav',
              type: 'audio/wav',
            });
          formData.append('roomid', roomId);

          console.log("Form Data:\n\n",formData, "\n\n");

          const uploadResponse = await fetch('https://your-ip/upload-audio/call-screen', {
              method: 'POST',
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
              body: formData
          })

          const data = await uploadResponse.json();
          console.log('\n\n\nServer response:\t', data, "\n\n\n");
          if (data != null && data != undefined) {
              console.log("\n\n\nSetting Scam Alert ON NOW!\n\n\n");
              if (data.isJoinerScam == 1) {
                setIsJoinerScammer(true);
              } else {
                setIsJoinerScammer(false);
              }
          }
          // send response to join screen.

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

    const startRecording = async () => {
        try {
            console.log("Starting Recording!!");
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.startAsync();
            setRecordings(recording);
            console.log("Recording Started!!");

        } catch (e) {
            console.error("Failed to start recording!", e);
        }
    }
    const stopRecording = async () => {
        console.log("Stopping Recording!!!!!!");
        await recordings.stopAndUnloadAsync();
        const uri = recordings.getURI();
        uriToFile(uri);
        setAudioUri(uri);
        console.log("Recording stopped and stored at ", uri);
    }
    // useEffects

    // Re render when the isJoinerScammer state is updated.
    useEffect(() => {}, [isJoinerScammer]);

    useEffect(()=> {},[recordings]);
    useEffect( () => {
      (async () => {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS:true,
          playsInSilentModeIOS: true
        })
      })();
      startLocalStream();
    },[])

    useEffect(() => {
        if (localStream && roomId) {
          startCall(roomId);
        }
    }, [localStream, roomId]);

    async function endCall() {
        stopRecording();
        if (cachedLocalPC) {
          const senders = cachedLocalPC.getSenders();
          senders.forEach((sender) => {
            cachedLocalPC.removeTrack(sender);
          });
          cachedLocalPC.close();
        }
    
        const roomRef = doc(db, "room", roomId);
        await updateDoc(roomRef, { answer: deleteField() });

        setLocalStream();
        setRemoteStream(); // set remoteStream to null or empty when callee leaves the call
        setCachedLocalPC();
        // cleanup
        setScreen(screens.ROOM); //go back to room screen
    }
      
  const startLocalStream = async () => {
      const constraints = {
        audio: {
          "echoCancellation": true,
          "sampleSize": 16,
          "channelCount": 2,
        },
        video: false,
      };
      const newStream = await mediaDevices.getUserMedia(constraints);
      setLocalStream(newStream);
  };

  const startCall = async (id) => {
      const localPC = new RTCPeerConnection(configuration);
      localStream.getTracks().forEach((track) => {
        track._peerConnectionId = 0;
        localPC.addTrack(track, localStream);
      }
      )

      const dataChannel = localPC.createDataChannel("audio");
      dataChannel.onopen = (e) => {
        console.log("\n\n\nSenders:",localPC.getSenders(), "\n\n\n");
      }

      dataChannel.onmessage = (e) => {
        console.log("\n\n\n",e.data,"\n\n\n");
      }

      console.log("\n\n\n LocalStream GEtAUdioTRracks \n\n\n", localStream.getAudioTracks());

      localPC.onaddtrack = (e) => {
        console.log("\n\n\nStream on Add stream:\n",e.stream,"\n\n\n");
      }

      const roomRef = doc(db, "room", id);
      const callerCandidatesCollection = collection(roomRef, "callerCandidates");
      const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

      localPC.addEventListener("icecandidate", (e) => {
          if (!e.candidate) {
              console.log("Got final Candidate");
              return;
          }
          addDoc(callerCandidatesCollection, e.candidate.toJSON());
      });

      localPC.ontrack = (e) => {
          const newStream = new MediaStream();
          console.log("\n\n\n newStream._tracks \n\n\n",e.streams[0], "\n\n\n");
          e.streams[0].getTracks().forEach((track) => {
            newStream.addTrack(track);
            console.log("\n\n\nSenders:",localPC.getSenders(), "\n\n\n");
            console.log("\n\n\n Track \n\n\n",track);
          });
          console.log("\n\n\nStream\n\n\n", newStream);
          console.log("\n\n\n CODECS \n\n\n", e.streams[0].getAudioTracks()[0]);
          setRemoteStream(newStream);
      }

      const offer = await localPC.createOffer();
      await localPC.setLocalDescription(offer);
      console.log("\n\n\nOffer\n\n\n", offer);
      await setDoc(roomRef, {offer, connected: false}, {merge: true});
      // listen for remote answer
      onSnapshot(roomRef, (doc) => {
        const data = doc.data();
        if (!localPC.currentRemoteDescription && data.answer) {
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            localPC.setRemoteDescription(rtcSessionDescription);
        } else {
          setRemoteStream();
        }
      });

      onSnapshot(calleeCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
              let data = change.doc.data();
              localPC.addIceCandidate(new RTCIceCandidate(data));
          }
        });
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

    const showAlert = () => {
      Alert.alert("SCAM ALERT!", "You might be getting scammed by the other user!");
      setIsJoinerScammer(false);
    }
    return(
      <View
        style={{
          flex: 1,
          flexDirection:'column',
          minHeight: "100%"
        }}
      >
        { isJoinerScammer ? showAlert() : <></>}
        <CallActionBox
          toggleMute={toggleMute}
          endCall={endCall}
        />
      </View>
        
    );
}

export default CallScreen;