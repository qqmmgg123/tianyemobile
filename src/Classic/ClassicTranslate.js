import React, { Component } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { get } from 'app/component/request'
import Back from 'app/component/Back'

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

export default class ClassicSection extends Component {

  constructor(props) {
    super(props)
    this.state = {
      translate: null
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

  async componentWillMount() {
    const translateId = this.props.navigation.getParam('itemId')
    let data = await get(`translate/${translateId}`)
    let { success, translate } = data
    if (success) {
      this.setState({
        translate
      })
    }
  }

  render() {
    let { translate } = this.state

    return (
      <View style={{ flex: 1 }}>
        <Back 
          navigation={this.props.navigation} 
          rightButton={{
            name: '引用',
            // onPress: () => this.props.navigation.navigate('ClassicTranslate')
          }}
        />
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
              >{translate && translate.title || ''}</Text>
            </View>
            <View style={{
              flex: 1,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingBottom: 20
            }}>
              {this.renderRichText(translate && translate.content || '')}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
}
