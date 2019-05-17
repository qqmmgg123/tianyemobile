import React from "react";
import { View, Dimensions, Text } from "react-native";
import { toast } from 'app/Toast'
import FlatList from "app/HorizontalList/FlatList" 

import PropTypes from "prop-types";

const { width, height } = Dimensions.get("window");

class Swiper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrSwipeData: this.props.swipeData,
      currentSelectIndex: this.props.currentSelectIndex < this.props.swipeData.length ?
        this.props.currentSelectIndex :
        this.props.swipeData.length - 1,
      childViewHeight: height,
    };

    this.viewabilityConfig = {
      viewAreaCoveragePercentThreshold: 50
    };
  }

  scrollToPrevious = () => {
    if (this.swiper) {
      let newIndex = this.state.currentSelectIndex - 1
      this.swiper.scrollToIndex({
        animated: true,
        index: newIndex,
      })
      toast('没有更多了~')
    }
  }

  componentDidMount = () => {
    if (this.swiper) {
      this.swiper.scrollToIndex({
        animated: false,
        index: this.state.currentSelectIndex,
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    let newSwipeData = nextProps.swipeData
    , { swipeData } = this.props
    if (newSwipeData.length !== swipeData.length) {
      let { needBack } = nextProps
      this.setState({
        arrSwipeData: nextProps.swipeData
      }, () => {
        if (needBack) {
          this.scrollToPrevious()
        }
      })
    }
  }

  onViewableItemsChanged = ({
    viewableItems,
    changed
  }) => {
    if (viewableItems && viewableItems.length > 0) {
      let currentIndex = viewableItems[0].index
      this.props.onScreenChange(currentIndex);
      this.setState({
        currentSelectIndex: currentIndex,
      })
      let { arrSwipeData } = this.state
      if (currentIndex === arrSwipeData.length - 1) {
        console.log('到底了...')
        this.props.onPageEnded()
      }
      let that = this
    }
  };

  getItemLayout = (data, index) => ({
    length: this.props.containerWidth,
    offset: this.props.containerWidth * index,
    index,
  });

  onViewLayout = event => {
    let contentHeight = event.nativeEvent.layout.height;
    this.setState({
      childViewHeight: contentHeight
    });
  };

  // Render Methods.

  renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          {
            width: this.props.containerWidth,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: this.state.arrSwipeData[index],
          },
        ]}
        onLayout={this.onViewLayout}
      >
        {this.props.renderSwipeItem ? this.props.renderSwipeItem(item, index) : <Text>{index}</Text>}
      </View>
    );
  };

  render() {
    let { arrSwipeData } = this.state

    return (
      <View style={[this.props.style, { width: this.props.containerWidth }]}>
        <FlatList
          ref={flatList => {
            this.swiper = flatList;
          }}
          scrollEnabled={true}
          backgroundColor={this.props.backgroundColor}
          data={arrSwipeData}
          extraData={this.state}
          keyExtractor={(item) => (item._id)}
          renderItem={this.renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
          getItemLayout={this.getItemLayout}
          refreshing={this.props.refreshing}
          onRefresh={this.props.onRefresh}
          horizontal
          directionalLockEnabled
          pagingEnabled
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
}

Swiper.propTypes = {
  swipeData: PropTypes.array.isRequired,
  renderSwipeItem: PropTypes.func.isRequired,
  currentSelectIndex: PropTypes.number,
  containerWidth: PropTypes.number,
  style: PropTypes.object,
  onScreenChange: PropTypes.func,
  backgroundColor: PropTypes.string,
};

Swiper.defaultProps = {
  swipeData: ["green", "yellow", "red", "pink", "blue"],
  currentSelectIndex: 0,
  containerWidth: width,
  style: { flex: 1, backgroundColor: "white" },
  onScreenChange: () => {},
  backgroundColor: "white",
};

export default Swiper;
