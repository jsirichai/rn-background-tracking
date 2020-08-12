// @flow
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  NativeModules,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import {withLocationPermissions} from './hocs/withLocationPermissions';

type LocationCoordinates = {
  latitude: number,
  longitude: number,
  timestamp: number,
};

class MainPageClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timestamp: '',
      latitude: '',
      longitude: '',
    };
  }

  componentDidMount() {
    this.subscription = DeviceEventEmitter.addListener(
      NativeModules.LocationManager.JS_LOCATION_EVENT_NAME,
      (e: LocationCoordinates) => {
        console.log(
          `Runing Background Time : ${new Date(e.timestamp).toTimeString()} `,
        );
        console.log(`Location : ${e.latitude},${e.longitude}`);
        this.setState({timestamp: new Date(e.timestamp).toTimeString()});
        this.setState({latitude: e.latitude});
        this.setState({longitude: e.longitude});
      },
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  onEnableLocationPress = async () => {
    const {locationPermissionGranted, requestLocationPermission} = this.props;
    if (!locationPermissionGranted) {
      const granted = await requestLocationPermission();
      if (granted) {
        return NativeModules.LocationManager.startBackgroundLocation();
      }
    }
    NativeModules.LocationManager.startBackgroundLocation();
  };

  onCancelLocationPress = () => {
    NativeModules.LocationManager.stopBackgroundLocation();
  };

  render() {
    const {container, button, text} = styles;
    const {timestamp, latitude, longitude} = this.state;
    return (
      <View style={container}>
        <TouchableHighlight style={button} onPress={this.onEnableLocationPress}>
          <Text style={text}>Enable Location</Text>
        </TouchableHighlight>
        <TouchableHighlight style={button} onPress={this.onCancelLocationPress}>
          <Text style={text}>Cancel Location</Text>
        </TouchableHighlight>
        <View style={{marginTop: 10}}>
          <Text style={{fontSize: 20}}>Time : {timestamp}</Text>
          <Text style={{fontSize: 20}}>Latitude : {latitude}</Text>
          <Text style={{fontSize: 20}}>Longitude : {longitude}</Text>
        </View>
      </View>
    );
  }
}

export const MainPage = withLocationPermissions(MainPageClass);

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 50,
  },
  button: {
    marginVertical: 10,
    backgroundColor: '#2b5082',
    padding: 20,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
  },
});
