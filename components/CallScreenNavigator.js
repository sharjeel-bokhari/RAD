import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import RoomScreen from './RoomScreen';
import CallScreen from './CallScreen';
import JoinScreen from './JoinScreen';

const CallScreenNavigator = () => {

    const [screen, setScreen] = useState(Screens.ROOM);
    const [roomId, setRoomId] = useState("");

    const Screens = {
        ROOM: "JOIN_ROOM",
        CALL: "CALL",
        JOIN: "JOIN",
    };
    
    return (
        <SafeAreaView>
            {screen == Screens.ROOM ? 
                <RoomScreen 
                    roomId={roomId}
                    setRoomId={setRoomId}
                    screens={Screens}
                    setScreen={setScreen}
                />
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
    )
};

export default CallScreenNavigator;
