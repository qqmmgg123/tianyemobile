import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import TYicon from './TYicon'
import { get } from './request'
import Back from './component/Back';

export default class Profile extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      profile: null
    }
  }

  async getProfile() {
    const userId = this.props.navigation.getParam('itemId')
    const res = await get(`profile/${userId}`)
    if (res) {
      const { success, profile } = res
      if (success) {
        this.setState({
          profile
        })
      }
    }
  }

  componentWillMount() {
    this.getProfile()
  }

  render() {
    let { navigation } = this.props
    let { profile } = this.state
    let userInfos = [
      { key: 'panname', name: '笔名', value: profile && profile.panname || '' },
    ]

    return (
      <View
        style={styles.container}
      >
        <Back 
          navigation={navigation}
        />
        {userInfos.map((info, index) => (
          info.value ? (<View key={index}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'nowrap',
                padding: 20
              }}
            >
              <Text 
                style={{
                  flex: 1
                }}
              >{info.name}</Text>
              <Text 
                style={{
                  maxWidth: '50%',
                  color: '#666'
                }}
                numberOfLines={1}
              >{info.value}</Text>
            </View>
        </View>) : null
        ))}
        </View>
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
