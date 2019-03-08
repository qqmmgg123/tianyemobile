import React from 'react'
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text,
  ScrollView,
  RefreshControl
} from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { get } from 'app/component/request'
import globalStyles from 'app/component/globalStyles'
import Back from 'app/component/Back'
import UserSearchScreen from 'app/Friend/UserSearch'
import FriendItem from 'app/Friend/FriendItem'
import AcceptPrompt from 'app/Friend/AcceptPrompt'
import { createFriendModal } from 'app/component/GlobalModal'
import { Empty, Footer } from 'app/component/ListLoad'
import CardView from 'react-native-rn-cardview'
import TYicon from 'app/component/TYicon'

const AcceptModal = createFriendModal({ AcceptPrompt })

let noDataTips = '当前没有内容'

class FriendList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      friends: [],
      loading: true,
      noDataTips,
      dropdownShow: false
    }
    this._dropDown = {}
  }

  refresh() {
    this.loadData()
  }

  async loadData() {
    const { loading } =  this.state
    let data = await get('friend')
    if (loading) {
      this.setState({
        loading: false,
        refreshing: false,
      }, () => {
        let { success, friends } = data
        if (success) {
          this.setState({
            friends,
            noDataTips
          })
        }
      })
    }
  }

  componentWillMount() {
    this.loadData()
  }

  groupDropDown(name, target) {
    this._dropDown[name] = target
  }

  dropDownBlur = (e) => {
    let target = e.nativeEvent.target
    let dropDowns = Object.values(this._dropDown)
    if (dropDowns.indexOf(target) === -1) {
      this.setState({
        dropdownShow: false
      })
    }
  }

  render() {
    let { 
      friends, 
      loading, 
      refreshing, 
      dropdownShow 
    } = this.state

    return (
      <View 
        onStartShouldSetResponderCapture={this.dropDownBlur}
        style={[globalStyles.container, {
          zIndex: 0
        }]}
      >
        <Back 
          name="有缘人"
          routeName={this.props.navigation.state.params.routeName}
          navigation={this.props.navigation} 
          rightButton={{
            icon: 'mn_tianjiahaoyou',
            noBorder: true,
            onPress: () => {
              this.props.navigation.navigate('UserSearch', {
                onGoBack: () => this.refresh()
              })
            }
            /*onPress: () => {
              this.setState({
                dropdownShow: !dropdownShow
              })
            }*/
          }}
          onLayoutRightBtn={ 
            (name, target) => this.groupDropDown(
              name, 
              target
            ) 
          }
        />
        { dropdownShow ? 
          <CardView
            onLayout={ 
              e => this.groupDropDown(
                'list', 
                e.nativeEvent.target
              ) 
            }
            cardElevation={4}
            maxCardElevation={4}
            radius={5}
            backgroundColor={'#ffffff'}
            style={{
              ...globalStyles.dropDown,
              width: 180
            }}
          >
            <TouchableOpacity 
              onLayout={ 
                e => this.groupDropDown(
                  'menu_1', 
                  e.nativeEvent.target
                ) 
              }
              onPress={() => {
                this.props.navigation.navigate('UserSearch', {
                  onGoBack: () => this.refresh()
                })
                this.setState({ dropdownShow: false })
              }}
              style={{
                padding: 10
              }}
            >
              <Text
                onLayout={ 
                  e => this.groupDropDown(
                    'menu_1_text', 
                    e.nativeEvent.target
                  ) 
                }
              >查找并添加</Text>
            </TouchableOpacity>
            {/*<TouchableOpacity 
              onLayout={ 
                e => this.groupDropDown(
                  'menu_2', 
                  e.nativeEvent.target
                ) 
              }
              style={{
                padding: 10
              }}
            >
              <Text
                onLayout={ 
                  e => this.groupDropDown(
                    'menu_2_text', 
                    e.nativeEvent.target
                  ) 
                }
              >邀请他（她）加入</Text>
              </TouchableOpacity>*/}
          </CardView>
        : null}
        {this.state.friends.length ? <FlatList
          style={{
            marginTop: 10
          }}
          data={this.state.friends}
          renderItem={({item, index}) => <FriendItem 
            {...item} 
            onRemove={() => {
              friends.splice(index, 1)
              this.setState({
                friends
              })
            }} 
            onAccpect={(friendId) => {
              this._modal.open()
              this._modal.setParams({
                friendId,
                status: 'accept'
              })
            }}
            onDeny={(friendId, animateFun) => {
              this._modal.open()
              this._modal.setParams({
                friendId,
                status: 'deny',
                onDenyConfirm: () => {
                  animateFun()
                }
              })
            }}
            onRemark={(friendship) => {
              this._modal.open()
              this._modal.setParams({
                friendship,
                status: 'remark'
              })
            }}
          />}
          ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
          keyExtractor={(item) => (item._id)}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        /> : (!loading ? <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.refresh}
            />
          }
          contentContainerStyle={{
            flex: 1,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={{
            fontSize: 16,
            color: '#999'
          }}>当前未添加有缘人~</Text>
          {/*<Text style={{
            marginTop: 20,
            color: '#444',
            fontSize: 16
          }}>
            他（她）已经是田野用户
          </Text>*/}
          <Text style={{
            marginTop: 20,
            fontSize: 16,
            color: '#666'
          }}>一、不知道对方用户名、邮箱</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Fate', {
              onGoBack: () => this.refresh()
            })}
            style={{
              borderRadius: 3,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 28,
              color: '#FF0140',
              marginRight: 10
            }}>去“投缘”看看，有没有投缘的人</Text>
            <TYicon 
              name='jiantou'
              size={16} 
              color={'#FF0140'}></TYicon>
          </TouchableOpacity>
          <Text style={{
            color: '#666',
            marginTop: 20,
            fontSize: 16
          }}>二、知道对方的用户名或邮箱</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('UserSearch', {
              onGoBack: () => this.refresh()
            })}
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 28,
              color: '#FF0140',
              marginRight: 10
            }}>通过用户名或邮箱添加</Text>
            <TYicon 
              name='sousuo'
              size={16} 
              color={'#FF0140'}></TYicon>
          </TouchableOpacity>
          {/*<Text style={{
            marginTop: 30,
            color: '#444',
            fontSize: 16
          }}>他（她）不是心也用户</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('UserSearch', {
              onGoBack: () => this.refresh()
            })}
            style={{
              borderRadius: 3,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text style={{
              marginTop: 10,
              fontSize: 16,
              lineHeight: 28,
              color: '#FF0140',
              marginRight: 10
            }}>邀请他（她）加入心也</Text>
            <TYicon 
              name='yaoqing'
              size={16} 
              color={'#FF0140'}></TYicon>
          </TouchableOpacity>*/}
        </ScrollView> : <Empty loading={true} />)}
        <AcceptModal 
          ref={ref => this._modal = ref}
          listRefresh={() => this.refresh()}
        />
      </View>
    )
  }
}

export default createStackNavigator({
  FriendList,
  UserSearch: UserSearchScreen
}, {
  headerMode: 'none',
  mode: 'modal'
})
