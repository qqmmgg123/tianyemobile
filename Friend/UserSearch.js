import React from 'react'
import { 
  View, 
  ScrollView,
  TouchableOpacity, 
  TextInput, 
  Text,
} from 'react-native'
import { connect } from 'react-redux'
import { get } from '../request'
import globalStyles from '../globalStyles'
import Back from '../component/Back'
import AcceptPrompt from './AcceptPrompt'
import { createFriendModal } from '../GlobalModal'

const AcceptModal = createFriendModal({ AcceptPrompt })

class UserSearch extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      query: '',
      users: [],
      noUserResult: '',
      modalVisible: false
    }
  }

  searchUser = async () => {
    let res = await get('user/search', {
      username: this.state.query.trim()
    })
    if (res) {
      const { success, users = [], noUserResult = '' } = res
      if (success) {
        this.setState({
          users,
          noUserResult
        })
      }
    }
  }

  render() {
    let { users, noUserResult } = this.state
    let { userId } = this.props.loginData

    return (
      <View 
        style={{
          flex: 1
        }}
      >
        <Back goBack={() => this.props.navigation.goBack()} />
        <View style={{
          flexDirection: 'row', 
          alignItems: 'center',
          marginTop: 10,
          padding: 10
        }}>
          <TextInput
            style={{
              borderColor: '#cccccc', 
              borderWidth: 1,
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              borderRadius: 3,
              flex: 1
            }}
            placeholder="请输入对方用户名或邮箱..."
            placeholderTextColor="#cccccc"
            allowFontScaling={false}
            autoCapitalize="none"
            onChangeText={(query) => this.setState({query})}
            value={this.state.query}
            autoFocus={true}
            returnKeyType='search'
            returnKeyLabel='查找'
            // onSubmitEditing={this.searchUser}
          />
          <TouchableOpacity
            style={{
              borderColor: '#dddddd', 
              borderWidth: 1, 
              borderRadius: 3,
              justifyContent: 'center',
              height: 36,
              paddingTop: 3,
              paddingHorizontal: 7,
              paddingBottom: 4,
              marginLeft: 10
            }}
            onPress={this.searchUser}
          >
            <Text style={{alignItems: 'center', color: '#666666'}}>查找</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{
          padding: 10
        }}>
          {users && users.length ? users.map(item => (
            <View 
              key={item._id} 
              style={{
                flexDirection: 'row'
              }}
            >
              <Text numberOfLines={1} style={{
                flex: 1
              }}>{item.username}</Text>
              {item.isfriend ? (<Text>知己</Text>) : (userId !== item._id ? (
                <TouchableOpacity
                  style={globalStyles.button}
                  onPress={() => {
                    this._modal.open()
                    this._modal.setParams({
                      friendId: item._id,
                      status: 'add'
                    })
                  }}
                >
                  <Text style={globalStyles.buttonText}>添加</Text>
                </TouchableOpacity>
              ) : null)}
            </View>
          )) : (
            <View>
              <Text style={globalStyles.noDataText}>{noUserResult}</Text>
            </View>
          )}
        </ScrollView>
        <AcceptModal 
          ref={ref => this._modal = ref}
          onAdd={() => {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onGoBack();
          }}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

const UserSearchScreen = connect(mapStateToProps)(UserSearch)

export default UserSearchScreen