import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity, FlatList } from 'react-native'
import { get } from 'app/component/request'
import Back from 'app/component/Back'
import { Empty, Footer } from 'app/component/ListLoad'
import globalStyles from 'app/component/globalStyles'
import { bold } from 'ansi-colors';

let noDataTips = ''

const styleMap = {
  'color': { 
    name: 'color',
    type: 'string',
    value: '*'
  },
  'font-size': {
    name: 'fontSize',
    type: 'number',
    min: 10,
    value: '*'
  },
  'font-style': {
    name: 'fontStyle',
    type: 'string',
    value: ['normal', 'italic']
  },
  'font-weight': {
    name: 'fontWeight',
    type: 'string',
    value: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  },
  'line-height': {
    name: 'lineHeight',
    type: 'number',
    min: 22,
    value: '*'
  },
  'text-align': {
    name: 'textAlign',
    type: 'string',
    value: ['auto', 'left', 'right', 'center', 'justify']
  }, 
  'text-decoration': {
    name: 'textDecorationLine',
    type: 'string',
    value: ['none', 'underline', 'line-through', 'underline line-through']
  }
}

export default class ClassicDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      classic: null,
      refreshing: false,
      sections: [],
      loading: true,
      noDataTips,
      page: 1
    }
  }

  getStyle(style) {
    let result = null
    try {
      result = JSON
        .parse('{' + 
          style.replace(/([^:]+):([^:]+);/g, 
          (match, name, value) => {
            let key = styleMap[name.trim()]
            if (key) {
              return [
                '"' + key.name + '"',
                key.value.indexOf(value.trim()) !== -1 
                  ? (key.type === 'number' 
                    ? Math.max(
                        parseFloat(value.trim()) || 0, 
                        key.min || 0
                      )
                    : '"' + value.trim() + '"')
                  : key.value[0]
              ].join(':') + ','
            } else {
              return ''
            }
          }).slice(0, -1) + '}')
    } catch (err) {
      console.log(err)
    }
    return result
  }

  decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
    }
    return encodedString.replace(translate_re, (match, entity) => {
      return translate[entity]
    }).replace(/&#(\d+);/gi, (match, numStr) => {
      let num = parseInt(numStr, 10)
      return String.fromCharCode(num)
    })
  }

  getSpanNode(text) {
    let tags = text.match(/<span\s+style="[^"]*">|<span>|<\/span>/g) || []
    let contents = text.split(/<span\s+style="[^"]*">|<span>|<\/span>/)
    let curNode = {
      nodes: [],
      style: {
        color: '#333333',
        fontSize: 16,
        lineHeight: 28
      },
      parent: null
    }
    let result = curNode
    for (let i = 0; i < tags.length + contents.length; i++) {
      let item = (i & 1) == 1 ? tags[(i - 1) / 2] : contents[i / 2]
      if (/<span\s+style="([^"]*)">|<span>/.test(item)) {
        // console.log(this.getStyle(RegExp.$1))
        if (curNode && curNode.nodes) {
          let node = {
            name: 'span',
            nodes: [],
            style: this.getStyle(RegExp.$1),
            parent: curNode
          }
          curNode.nodes.push(node)
          curNode = node
        }
      } else if (/<\/span>/.test(item)) {
        if (curNode && curNode.parent) {
          let temp = curNode
          curNode = curNode.parent
          temp.parent = null
        }
      } else {
        if ((item && item !== '') && (curNode && curNode.nodes)) {
          let node = {
            name: 'text',
            content: this.decodeEntities(item.replace(/<br\s*\/?>/g, ''))
          }
          curNode.nodes.push(node)
        }
      }
    }
    return result.nodes
  }

  getPNode(text) {
    let arr = text.split(/<\/?p>/)
    let nodes = []
    for (let i = 0; i < arr.length; i++) {
      let node = arr[i]
      if (node !== '') {
        nodes.push({
          name: 'p',
          nodes: this.getSpanNode(node)
        })
      }
    }
    return nodes
  }

  renderText(nodes) {
    return nodes.map((n, i) => {
      if (n.name === 'text') {
        return n.content
      } else if (n.name === 'span') {
        return (
          <Text 
            key={i} 
            style={n.style}
          >
            {n.nodes && n.nodes.length 
              ? this.renderText(n.nodes) 
              : null}
          </Text>
        )
      }
    })
  }
  
  renderRichText(text) {
    let nodes = this.getPNode(text)
    console.log(nodes)
    let elements = nodes.map((n, i) => {
      if (n.name === 'p') {
        return (<View key={i}><Text style={{
          color: '#333333',
          fontSize: 16,
          lineHeight: 28
        }}>{
          n.nodes && n.nodes.length
            ? this.renderText(n.nodes)
            : null}</Text></View>)
      }
    })
    return elements
  }

  layoutMoreData(data) {
    let { 
      success, 
      pageInfo,
      sections = [] 
    } = data
    if (success) {
      this.setState({
        page: pageInfo.nextPage || 0,
        sections: [...this.state.sections, ...sections]
      })
    }
  }

  async loadMoreData() {
    const { page, loading, refreshing, classic } =  this.state
    let data = await get(`classic/${classic._id}/sections`, {
      perPage: 20,
      page
    })
    if (loading) {
      this.setState({
        loading: false
      }, () => {
        data && this.layoutMoreData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        sections: []
      }, () => {
        data && this.layoutMoreData(data)
      })
    }
  }

  refresh = () => {
    this.setState({
      page: 1,
      refreshing: true
    }, () => {
      this.loadData()
    })
  }

  loadMore = () => {
    const { page, loading } = this.state
    if (!page || loading) return
    this.setState({
      loading: true 
    }, () => {
      this.loadMoreData()
    })
  }

  layoutData(data) {
    let { success, classic, sections = [], pageInfo } = data
    if (success) {
      this.setState({
        classic,
        page: pageInfo.nextPage || 0,
        sections,
      })
    }
  }
  
  async loadData() {
    const classicId = this.props.navigation.getParam('itemId')
    const { loading, refreshing } =  this.state
    let data = await get(`classic/${classicId}`)
    if (loading) {
      this.setState({
        loading: false
      }, () => {
        data && this.layoutData(data)
      })
    }
    if (refreshing) {
      this.setState({
        refreshing: false,
        sections: []
      }, () => {
        data && this.layoutData(data)
      })
    }
  }

  async componentWillMount() {
    this.loadData()
  }

  render() {
    let { 
      classic, 
      sections,
      refreshing, 
      loading, 
      noDataTips, 
      page 
    } = this.state

    return (
      <View style={{ flex: 1 }}>
        <Back navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{
              flex: 1,
              padding: 10
            }}>
              <Text
                style={{
                  fontSize: 20,
                  lineHeight: 32,
                  textAlign: 'center'
                }}
              >{classic && classic.title || ''}</Text>
            </View>
            <View style={{
              marginTop: 10,
              backgroundColor: '#f1f1f1',
              borderRadius: 4,
              padding: 10,
              marginHorizontal: 10
            }}>
              <Text style={{
                fontSize: 14,
                color: '#999',
                lineHeight: 24,
              }}>{classic && classic.summary || ''}</Text>
            </View>
            <View style={{
              flex: 1,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingBottom: 20
            }}>
              {this.renderRichText(classic && classic.content || '')}
            </View>
            <View style={{
              paddingHorizontal: 10,
            }}>
              <Text style={{
                fontWeight: 'bold',
                fontSize: 16
              }}>目录</Text>
            </View>
            <FlatList
              contentContainerStyle={{
                padding: 10
              }}
              data={sections}
              refreshing={refreshing}
              onRefresh={this.refresh}
              onEndReached={this.loadMore}
              onEndReachedThreshold={100}
              renderItem={({item}) => {
                return (
                  <View style={{
                    paddingTop: 15,
                    paddingBottom: 10,
                  }}>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('ClassicSection', {
                        itemId: item._id
                      })}
                    >
                      <Text style={{ 
                        fontSize: 16,
                        color: '#333',
                        lineHeight: 24
                      }}>{item.title}</Text>
                    </TouchableOpacity>
                  </View>
                )
              }}
              ListEmptyComponent={<Empty 
                loading={loading}
                noDataTips={noDataTips}
              />}
              ListFooterComponent={<Footer 
                data={sections} 
                onLoadMore={this.loadMore} 
                loading={loading}
                page={page}
                noDataTips={noDataTips}
              />}
              ItemSeparatorComponent={() => <View style={globalStyles.separator} />}
              keyExtractor={(item) => (item._id)}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
          </ScrollView>
        </View>
      </View>
    )
  }
}
