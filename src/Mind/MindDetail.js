import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { getDate } from 'app/utils'
import { get, post } from 'app/component/request'
import Back from 'app/component/Back'
import globalStyles from 'app/component/globalStyles'
import { createFriendModal } from 'app/component/GlobalModal'
import Report from 'app/component/Report'

const MindModal = createFriendModal({ Report })

class MindDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mind: null,
      loading: true
    }
  }

  refresh() {
    this.loadData()
  }

  componentWillMount() {
    this.loadData()
  }

  async loadData() {
    const mindId = this.props.navigation.getParam('itemId')
    let data = await get(`mind/${mindId}`)
    if (data) {
      let { success, mind } = data
      if (success) {
        this.setState({
          mind,
          loading: false
        })
      }
    }
  }

  render() {
    let { mind } = this.state
    const { userId = '' } = this.props.loginData

    return mind ? (
      <View style={{ flex: 1 }}>
        <Back navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {mind.title ? (<View style={{
              flex: 1,
              padding: 10,
            }}>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 32,
                  textAlign: 'center'
                }}
              >{mind.title}</Text>
            </View>) : null}
            {mind.content ? (<View style={{
              flex: 1,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingBottom: 20
            }}>
              <Text style={{
                color: '#333333',
                fontSize: 16,
                lineHeight: 28
              }}>
              {mind.content}
              </Text>
            </View>) : null}
          </ScrollView>
        </View>
        <View style={globalStyles.headerBottomLine}></View>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingRight: 10
            }}
          >
            <Text style={{ 
              fontSize: 14,
              color: '#999999',
              flex: 1,
            }}>
              {getDate(new Date(mind.state_change_date))}
            </Text>
          </View>
            {
              userId === mind.creator_id
                ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666',
                    }}>编辑</Text>
                  </TouchableOpacity>)
              : null
            }
            {
              userId === mind.creator_id
                ? (<TouchableOpacity
                    style={{
                      padding: 10
                    }}
                  >
                    <Text style={{ 
                    fontSize: 14,
                    color: '#666'
                    }}>删除</Text>
                  </TouchableOpacity>)
              : null
            }
          </View>
          <MindModal 
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

export default connect(mapStateToProps)(MindDetail);
