import React from 'react';
import { 
  SafeAreaView,
  Dimensions,
  Platform, 
  TouchableOpacity,
  StyleSheet, 
  Text, 
  View
} from 'react-native';
import { createAppContainer, createNavigator } from 'react-navigation'
import Classic from './Classic'
import Share from './Share'

const { width } = Dimensions.get('window');

const MyStack = createNavigator({   
  Classic,
  Share
}, );

class CustomNavigator extends React.Component {
  static router = {
    ...MyStack.router,
    getStateForAction: (action, lastState) => {
      console.log(action, lastState)
      // check for custom actions and return a different navigation state.
      return MyStack.router.getStateForAction(action, lastState);
    },
  };
  componentDidUpdate(lastProps) {
    // Navigation state has changed from lastProps.navigation.state to this.props.navigation.state
  }
  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>田野</Text>
            <Text style={styles.slogan}>吃饭</Text>
          </View>
          <MyStack style={{ flex: 1 }} navigation={navigation} />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            width,
            height: 54,
            borderStyle: 'solid',
            borderTopColor: '#cccccc',
            borderTopWidth: 1
          }}>
            <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', }}
            onPress={() => {
              navigation.navigate('Classic')
            }}
            >
              <Text>经典著作</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', }}
            onPress={() => {
              navigation.navigate('Share')
            }}
            >
              <Text>心得感悟</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FF0140',
    margin: 10,
  },
  slogan: {
    textAlign: 'center',
    color: 'orange',
    marginBottom: 5,
  },
})

export default createAppContainer(CustomNavigator)
