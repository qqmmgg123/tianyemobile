import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { get, post } from './request'
import Back from './component/Back'
import globalStyles from './globalStyles'
import { createFriendModal } from './GlobalModal'
import Report from './Report'

const ShareModal = createFriendModal({ Report })

class ShareDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      share: null,
      loading: true
    }
  }

  refresh() {
    this.loginData()
  }

  async thank() {
    let { share } = this.state
    if (!share.isThanked && !share.thanking) {
      share.thanking = true
      this.setState({
        share: share
      })
      const res = await post(`thank/${share._id}`)
      share.thanking = false
      if (res.success) {
        share.isThanked = true
        this.setState({
          share: share
        })
      }
    }
  }

  componentWillMount() {
    this.loginData()
  }

  async loginData() {
    const shareId = this.props.navigation.getParam('itemId')
    let data = await get(`share/${shareId}`)
    let { success, share } = data
    if (success) {
      this.setState({
        share,
        loading: false
      })
    }
  }

  render() {
    let { share } = this.state
    const { userId = '' } = this.props.loginData

    return share ? (
      <View style={{ flex: 1 }}>
        <Back routeName='Share' navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          <ScrollView style={{
            marginTop: 20,
            height: 200
          }}>
            <View style={{
              flex: 1,
              marginTop: 20,
              paddingHorizontal: 10,
            }}>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 32,
                  textAlign: 'center'
                }}
              >{share && share.title || ''}</Text>
            </View>
            <View style={{
              flex: 1,
              marginTop: 20,
              paddingHorizontal: 10,
              paddingBottom: 20
            }}>
              <Text style={{
                flex: 1,
                color: '#333333',
                fontSize: 16,
                lineHeight: 28
              }}>
              {share && share.content || ''}
              </Text>
            </View>
          </ScrollView>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text 
              style={{
                flex: 1,
                fontSize: 14,
                color: '#666',
                padding: 10 
              }}
              numberOfLines={1}
            >作者：{share && share.author && share.author.panname || ''}</Text>
          {share && share.isThanked
            ? (<Text style={{
                color: '#999', 
                fontSize: 14,
                padding: 10
              }}>已赞叹</Text>)
            : (<TouchableOpacity
                  style={{
                    padding: 10
                  }}
                  onPress={() => this.thank()}
                >
                  <Text style={{ 
                    fontSize: 14,
                    color: '#666'
                  }}>赞叹</Text>
                </TouchableOpacity>)}
            {
              (userId && userId) === (share && share.creator_id)
               ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => {
                      this.props.navigation.navigate('ShareEditor', {
                        itemId: share._id,
                        itemColumn: share.column_id,
                        onGoBack: () => this.refresh()
                      })}
                    }
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666',
                    }}>编辑</Text>
                  </TouchableOpacity>)
              : null
            }
            {
              (userId && userId) === (share && share.creator_id)
               ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                    onPress={() => this.removeHelp(_id)}
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666'
                    }}>删除</Text>
                  </TouchableOpacity>)
              : null
            }
            <TouchableOpacity
              style={{
                padding: 10
              }}
              onPress={() => this._modal.open()}
            >
              <Text style={{ 
                fontSize: 14,
                color: '#666'
              }}>举报</Text>
            </TouchableOpacity>
          </View>
          <ShareModal 
            ref={ref => this._modal = ref}
          />
      </View>
    ) : (this.state.loading
      ? (
      <View style={{ flex: 1 }}>
        <Back navigation={this.props.navigation} />
        <Text style={globalStyles.noDataText}>加载中...</Text>
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <Back navigation={this.props.navigation} />
        <Text style={globalStyles.noDataText}>您查看的内容已被删除。</Text>
      </View>)
    )
  }
}

const mapStateToProps = (state) => {
  const { loginData } = state
  return { loginData }
}

export default connect(mapStateToProps)(ShareDetail);
