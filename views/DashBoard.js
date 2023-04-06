import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import Card from "../components/card";
import { LineChart } from "react-native-chart-kit-bar";
import { Dimensions } from "react-native";
import {
  Header as HeaderRNE,
  HeaderProps,
  Button,
  Overlay,
} from "@rneui/themed";
import Icon from "react-native-vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";
// import { Client, Message } from 'react-native-mqtt';

const screenWidth = Dimensions.get("window").width;
const chartConfig = {
  backgroundGradientFrom: "#ffff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#ffff",
  backgroundGradientToOpacity: 0,
  color: (opacity = 10) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};
const img = require("../assets/Vector.png");
const img1 = require("../assets/thermometer.png");
const img3 = require("../assets/Chart-1.png");
const Logo = require("../assets/logo1.png");

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const client = new Paho.MQTT.Client("broker.hivemq.com", 8000, "test-mqtt");

//
export default function DashBoard() {
  const [visible, setVisible] = useState(false);
  const [Temperature, setTemperature] = useState(0);
  const [Humidity, setHumidity] = useState(0);
  const [SPO2, setSPO2] = useState(0);
  const [Pulse, setPulse] = useState(0);
  const [ECG, setECG] = useState(0);
  const [HRV, setHRV] = useState(0);
  // const [myArray, setMyArray] = useState([]);
  const [ecgData, setEcgData] = useState([464]);

  // const arraySize = 6;

  // const addValueToArray = (value) => {
  //   setMyArray([...myArray, value]);  // add value to end of array

  //   if (myArray.length >= arraySize) {
  //     setMyArray(myArray.slice(1));  // remove first element from array
  //   }
  // };

  function onConnect() {
    console.log("onConnect");
    client.subscribe("bncoe/rpm/stream", { qos: 1 });
    client.subscribe("bncoe/rpm/ecg", { qos: 1 });
    client.subscribe("bncoe/rpm/fall", { qos: 1 });
  }
  function oninvo() {
    console.log("oninvo");
    // client.subscribe("testtopic/#", { qos: 0 });
  }

  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
    client.connect({
      onSuccess: onConnect,
      onFailure: function onFailure(err) {
        console.log(err);
      },
      // timeout: 10,
      // keepAliveInterval:1000 ,
      // cleanSession: true,
    });
  }

  function onMessageArrived(message) {
    // console.log("onMessageArrived:" + message.payloadString);
    // if
    // console.log("Topic:",message.topic);
    if (message.topic == "bncoe/rpm/stream") {
      const { temperature, humidity, spo2, pulse } = JSON.parse(
        message.payloadString
      );
      // console.log("Temp:", temperature);
      setTemperature(temperature);
      setHumidity(humidity);
      setSPO2(spo2);
      setPulse(pulse);
    }
    else if (message.topic == "bncoe/rpm/ecg") {
      const { ecg, hrv } = JSON.parse(message.payloadString);
      setHRV(hrv);
      // console.log("ECG:", ecg);
      // setECG(ecg);
      // addValueToArray(ecg);
      setEcgData((prevData) =>
        [...prevData, Number(ecg.toString())].slice(-50)
      );
    }
    else if (message.topic == "bncoe/rpm/fall") {
      setVisible(true);
    }
  }

  useEffect(() => {
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
      onSuccess: onConnect,
      onFailure: function onFailure(err) {
        console.log(err);
      },
      // timeout: 10,
      // keepAliveInterval:1000 ,
      // cleanSession: true,
    });
  }, []);

  // const data = {
  //   // labels: ["January", "February", "March", "April", "May", "June"],
  //   datasets: [
  //     {
  //       data: [20,50,40,12],
  //       color: (opacity = 1) => `rgba(237, 47, 47 , ${opacity})`, // optional
  //       strokeWidth: 2, // optional
  //     },
  //   ],
  //   // legend: ["Rainy Days"] // optional
  // };

  const toggleOverlay = () => {
    setVisible(!visible);
  };
  return (
    <View style={styles.container}>
      <View>
        <ScrollView>
          <HeaderRNE
            backgroundColor="#7DC253"
            leftComponent={
              <Image
                source={Logo}
                style={{ width: "100%", resizeMode: "contain" }}
              ></Image>
            }
            centerComponent={{ text: "RPM", style: styles.heading }}
          />
          <Overlay
            isVisible={visible}
            onBackdropPress={toggleOverlay}
            overlayStyle={{
              borderRadius: 25,
              padding: 25,
              alignItems: "center",
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 15,
              }}
            >
              <Icon name="alert" color="#FF0000" size={45} />
            </View>
            <Text style={styles.textSecondary}>Fall Detected</Text>
            <Button
              type="outline"
              titleStyle={{ color: "#FF0000" }}
              buttonStyle={{
                borderWidth: 1,
                backgroundColor: "#fff",
                borderColor: "#FF0000",
                borderRadius: 30,
              }}
              containerStyle={{
                width: 200,
                marginVertical: 10,
              }}
              title="Close"
              onPress={toggleOverlay}
            />
          </Overlay>
          <View>
        <Text style={styles.text}>IoT based Remote Patient Monitoring</Text>
        <Text style={styles.top}>
          Babasaheb Naik College of Engineering, Pusad
        </Text>
      </View>
          <View style={{ padding: 20 }}>
            <Card>
              <Text style={styles.h1}>Heart Rate Variablity (HRV)</Text>
              <Text style={styles.h3}>{HRV.toFixed(2)} ms</Text>
            </Card>

            <Card>
              <TouchableOpacity
                onPress={() => {
                  console.log("Touched!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                  setEcgData([500]);
                }}
              >
                <Text style={styles.h1}>
                  ECG (HR vs Time){" "}
                  <Icon name="sync" color="#7DC253" size={17} />
                </Text>
              </TouchableOpacity>
              <View style={{ marginRight: 50 }}>
                <LineChart
                  data={{
                    // labels: ["January", "February", "March", "April", "May", "June"],
                    datasets: [
                      {
                        data: ecgData,
                        color: (opacity = 1) =>
                          `rgba(237, 47, 47 , ${opacity})`, // optional
                        strokeWidth: 2, // optional
                      },
                    ],
                    // legend: ["Rainy Days"] // optional
                  }}
                  width={screenWidth}
                  height={110}
                  chartConfig={chartConfig}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={false}
                  withVerticalLabels={false}
                  getDotColor={(opacity = 15) =>
                    `rgba(255, 255, 255, ${opacity})`
                  }
                />
              </View>
            </Card>

            <Card>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View
                  style={{ flex: 0.4, flexWrap: "wrap", alignItems: "center" }}
                >
                  <Text style={styles.h1}>%SpO2</Text>
                  <Text style={styles.h2}>{SPO2}</Text>
                </View>
                <View
                  style={{
                    flex: 0.2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* <Text>P1 10.5</Text> */}
                </View>
                <View
                  style={{ flex: 0.4, flexWrap: "wrap", alignItems: "center" }}
                >
                  <Text style={styles.h1}>PR bpm</Text>
                  <Text style={styles.h2}>{Math.ceil(Pulse)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", height: 35 }}>
                <Image
                  source={img3}
                  style={{ width: "100%", resizeMode: "contain" }}
                ></Image>
              </View>
            </Card>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{ flex: 0.5, position: "relative", flexWrap: "nowrap" }}
              >
                <Card>
                  <Text style={styles.h1}>Temprature</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={img1}
                      style={styles.image1}
                      resizeMode="contain"
                    />
                    <View style={{ left: 20 }}>
                      <Text style={styles.h4}>{Math.round(Temperature)}°C</Text>
                      <Text style={styles.h5}>Normal- 37°C</Text>
                    </View>
                  </View>
                </Card>
              </View>

              <View
                style={{ flex: 0.5, position: "relative", flexWrap: "nowrap" }}
              >
                <Card>
                  <Text style={styles.h1}>Humidity</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={img}
                      style={[
                        styles.image,
                        {
                          height: 132,
                          resizeMode: "contain",
                          right: 20,
                          top: 10,
                        },
                      ]}
                    />
                    <View style={{ position: "absolute", left: 40 }}>
                      <Text style={styles.h4}>{Math.ceil(Humidity)}%</Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>
          </View>
         
        </ScrollView>
        </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  
container:{
  alignItems: 'center',
  justifyContent:"space-around",
},
  h1: {
    // fontfamily: 'Qualion',
    fontStyle: "normal",
    fontSize: 20,
    fontWeight: 800,
    paddingBottom: 10,
    color: "#7DC253",
  },
  h2: {
    // fontfamily: 'Qualion',
    fontStyle: "normal",
    fontSize: 35,
    fontWeight: 800,
    lineHeight: 50,
    color: "#000",
  },
  h3: {
    // fontfamily: 'Qualion',
    fontStyle: "normal",
    fontSize: 25,
    fontWeight: 600,
    lineHeight: 40,
    color: "#C15252",
  },
  h4: {
    // fontfamily: 'Qualion',
    fontStyle: "normal",
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 45,
    color: "#000",
  },
  card: {
    backgroundColor: "#ffff",
    borderRadius: 20,
  },
  image: {
    width: 79,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
  },
  textSecondary: {
    marginVertical: 20,
    textAlign: "center",
    fontSize: 17,
    color: "red",
  },
  top: {
    fontSize: 16,
    color: '#666666', // Replace with your desired gray color
    textAlign:"center",
    width:"90%",
    fontWeight:"bold",
    alignSelf:"center",
  },
  text: {
    marginTop:5,
    fontSize: 18,
    color: '#333333', // Replace with your desired gray color
    textAlign:"center",
    width:"100%",
    fontWeight:"bold",
    alignSelf:"center"
  },
});
