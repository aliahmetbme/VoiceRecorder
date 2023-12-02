import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import Icon from "react-native-vector-icons/FontAwesome5"

const audioRecorderPlayer = new AudioRecorderPlayer();

const App = () => {
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00');

  const [currentPosition, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState('00:00');
  const [Playtime, setPlayTime] = useState(0);
  const [duration, setDuration] = useState('00:00');

  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)



  useEffect(() => {
    // kayıt esnasında dinleme yapıyor 
    const recordBackListener = (e) => {
      setRecordSecs(e.currentPosition);
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
    };
    // oynatma esnasında dinleme yapıyor 
    const playBackListener = (e) => {
      if (e.currentPosition === e.duration) {
        audioRecorderPlayer.stopPlayer()
      }
      setCurrentPositionSec(e.currentPosition);
      setCurrentDurationSec(e.duration);
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
    };
    audioRecorderPlayer.addPlayBackListener(playBackListener);
    audioRecorderPlayer.addRecordBackListener(recordBackListener);
    // Temizlik fonksiyonu: bileşen çözüldüğünde olay dinleyicisini kaldır
    return () => {
      audioRecorderPlayer.removeRecordBackListener(recordBackListener);
      audioRecorderPlayer.removePlayBackListener(playBackListener);
    };
  }, [])

  async function stopRecord() {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecordSecs(0);
      setIsRecording(false)
      console.log('Recording stopped:', result);
    } catch (error) {
      console.error('Error stopping recorder:', error);
    }
  }

  async function playRecord() {
    try {
      setIsPlaying(true)
      await audioRecorderPlayer.stopPlayer();  // Player'ı durdur
      const msg = await audioRecorderPlayer.startPlayer();
      console.log("güncelleme", msg);
      if (msg === 'undefined') {
        console.error('startPlayer returned undefined. There might be an issue.');
      }
    } catch (error) {
      console.error('Error starting player:', error);
    }
  }

  const onStopPlay = async () => {
    setIsRecording(false)
    setIsPlaying(false)
    console.log('onStopPlay');
    await audioRecorderPlayer.stopPlayer();
  };

  const onPausePlay = async () => {
    setIsPlaying(false)
    await audioRecorderPlayer.pausePlayer();
  };

  const onResumePlay = async () => {
    setIsPlaying(true)
    await audioRecorderPlayer.resumePlayer()
  };

  async function onStart() {
    setIsRecording(true)
    const result = await audioRecorderPlayer.startRecorder()
    audioRecorderPlayer.addPlayBackListener((e) => {
      console.log(e.currentPosition, audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)))
    })

    console.log(result)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text >{recordSecs}</Text>
      <Text style={{ color: "white" }}>{recordTime}</Text>
      {isRecording ? <Text style={{ color: "white" }}>recording</Text> : null}

      <View style={styles.buttons}>
        {!isRecording ? <TouchableOpacity onPress={onStart}>
          <Icon name={"microphone"} color={"blue"} size={55}></Icon>
        </TouchableOpacity> :
          <TouchableOpacity onPress={stopRecord}>
            <Icon name={"stop-circle"} color={"blue"} size={55}></Icon>
          </TouchableOpacity>}
      </View>

        {!isPlaying ? (
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onStopPlay}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPausePlay}>
              <Text style={styles.buttonText}>Pause </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onResumePlay}>
              <Text style={styles.buttonText}>Resume </Text>
            </TouchableOpacity>
          </View>

        ) :
          (<View style={styles.buttons}>
            <TouchableOpacity onPress={playRecord}>
              <Text style={styles.buttonText}>Play</Text>
              <Text style={{ color: "white" }}>{duration}</Text>
            </TouchableOpacity>
          </View>)
        }
    </SafeAreaView>

  )
}

export default App

const styles = StyleSheet.create({
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    margin: 10
  },
  buttonText: {
    fontSize: 25,
    color: "white"
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  }
})
