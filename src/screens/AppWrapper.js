import React, { Component } from 'react';
import { AppRegistry, StyleSheet, NavigationExperimental,
  Animated, View, ActivityIndicator } from 'react-native';
const {
  CardStack: NavigationCardStack,
  Transitioner: Transitioner,
  StateUtils: NavigationStateUtils,
  } = NavigationExperimental;
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NavigationBar from 'react-native-navigation-bar';
import * as lo from 'lodash';


const NavigationBarHeight = 44;
class AppWrapper extends Component {
  constructor(props, ...varargs) {
    super(props, ...varargs);
    this.state = {
      downloadIcon: null
    };
    Ionicons.getImageSource('ios-download-outline', 30, '#fff')
      .then(downloadIcon => this.setState({ downloadIcon }));
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isInitialized && !this.state.navigationState) {
      const navigationState = {
        index: 0, // Starts with first route focused.
        routes: [{
          key: lo.uniqueId('Route-'),
          screen: nextProps.rootView.screen,
          title: nextProps.rootModel.title,
          component: nextProps.componentBuilder[nextProps.rootView.screen]
        }]
      };
      this.setState({ navigationState });
    }
  }

  push = (nextScreenProps) => {
    console.log('push', nextScreenProps)
    // Push a new route, which in our case is an object with a key value.
    const route = {
      key: lo.uniqueId('Route-'),
      ...nextScreenProps,
      component: this.props.componentBuilder[nextScreenProps.screen]
    };
    // Use the push reducer provided by NavigationStateUtils
    this._onNavigationChange(NavigationStateUtils.push(this.state.navigationState, route));
  };

  pop = (nextScreenProps) => {
    console.log('pop', nextScreenProps)
    // Pop the current route using the pop reducer.
    this._onNavigationChange(NavigationStateUtils.pop(this.state.navigationState));
  };

  _onNavigationChange(navigationState) {
    // NavigationStateUtils gives you back the same `navigationState` if nothing
    // has changed. We will only update state if it has changed.
    if (this.state.navigationState !== navigationState) {
      // Always use setState() when setting a new state!
      this.setState({navigationState});
    }
  }

  _getAnimatedStyle(transitionProps) {
    const {
      layout,
      position,
      scene,
      } = transitionProps;

    const {
      index,
      } = scene;

    const inputRange = [index - 1, index, index + 1];
    const width = layout.initWidth;
    const translateX = position.interpolate({
      inputRange,
      outputRange: ([width, 0, -10]),
  });

    return {
      transform: [
        { translateX },
      ],
    };
  }

  _render(transitionProps) {
    console.log('transitionProps', transitionProps)
    const InternalComponent = transitionProps.scene.route.component();

    return (
      <Animated.View
        style={[styles.scene, this._getAnimatedStyle(transitionProps)]}>
        <NavigationBar
          title={ transitionProps.scene.route.title }
          height={ NavigationBarHeight }
          titleColor={ '#fff' }
          backgroundColor={ '#149be0' }
          onLeftButtonPress={ undefined }
          rightButtonIcon={ this.state.downloadIcon }
          rightButtonTitleColor={ '#fff' }
          onRightButtonPress={ undefined } />
        <InternalComponent navigator={ this }/>
      </Animated.View>
    );
  }

  render() {
    if (!this.props.isInitialized) {
      return ( <ActivityIndicator animating={ this.props.isInitialized } style={ styles.centering } size="large" /> );
    }

    return (
      <Transitioner navigationState={ this.state.navigationState }
                    render={ this._render.bind(this) } />
    );
  }
}

function mapStateToProps(state) {
  return {
    isInitialized: state.app.isInitialized,
    rootView: state.app.rootView,
    rootModel: state.app.rootModel
  };
}
export default connect(mapStateToProps)(AppWrapper);

const styles = StyleSheet.create({
  centering: { alignItems: 'center', justifyContent: 'center', padding: 8, height: 80 },
  contentContainer: {
    top: NavigationBarHeight
  },
  scene: {
    paddingTop: NavigationBarHeight,
    backgroundColor: '#E9E9EF',
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    top: 0,
  }
});