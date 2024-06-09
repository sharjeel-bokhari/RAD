import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

// import Icon from "react-native-vector-icons/MaterialIcons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhoneSlash, height } from '@fortawesome/free-solid-svg-icons/faPhoneSlash';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone'
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons/faMicrophoneSlash'
import LinearGradient from "react-native-linear-gradient";
import MaskedView from '@react-native-masked-view/masked-view';


const CallActionBox = ({ toggleMute, endCall }) => {
  const [isMicOn, setIsMicOn] = useState(true);

  const onToggleMicrophone = () => {
    toggleMute();
    setIsMicOn(!isMicOn);
  };

  return (
    <View style={{
      flex: 1
    }}>
      <View style={{
            display: 'flex',
            flex: 0.92,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            
          }}>
            <Image style={{width: 300, height: 90}} source={require('../images/logoWhite.png')}/>
      </View>
    <View style={{

        flex: 0.08,
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 30,
        justifyContent:'space-evenly',
        backgroundColor: 'black',
        borderRadius: 20
    }}>
      <TouchableOpacity
        onPress={onToggleMicrophone}
        style={{backgroundColor: "#4a5568", padding: 12, borderRadius: 99}} 
      >
          <View>
              <FontAwesomeIcon icon={isMicOn ? faMicrophone : faMicrophoneSlash} size={35} color={"white"}/>
          </View>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={endCall}
        style={{backgroundColor: "#dc2626", padding: 12, borderRadius: 99}}
      >
          <View>
              <FontAwesomeIcon icon={faPhoneSlash} size={35} color={"white"}/>
          </View>
      </TouchableOpacity>
    </View>
    </View>
  );
};

export default CallActionBox;
