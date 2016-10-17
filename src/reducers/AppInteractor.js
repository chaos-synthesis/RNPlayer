import lo from 'lodash';
import Immutable from 'seamless-immutable';
import RNFetch from 'react-native-fetch-blob';
const FS = RNFetch.fs;

import DataFlow from './DataFlow';

export default class AppInteractor {
  state = {
    isInitialized: false,
    rootView: 'SimpleListView'
  };

  // action, called first
  onInit(...args) {
    return this.state.merge({isInitialized:false});
  }

  // async action, called after 'on...'
  async init(...args) {
    const plugins = {};

    // load default plugins
    plugins['ex_ua'] = {
      'models': require('./../plugins/ex.ua/models.json'),
      'flow': require('./../plugins/ex.ua/flow.json'),
      'dynamic': true
    };
    plugins['downloads'] = {
      'models': require('./../plugins/downloads/models.json'),
      'flow': require('./../plugins/downloads/flow.json'),
      'dynamic': true
    };
    plugins['theming'] = {
      'models': require('./../plugins/theming/models.json'),
      'flow': require('./../plugins/theming/flow.json'),
      'dynamic': false
    };
    plugins['playground'] = {
      'models': require('./../plugins/playground/models.json'),
      'flow': require('./../plugins/playground/flow.json'),
      'dynamic': false
    };

    //const plugins = FS.ls(FS.dirs.ApplicationDir+ '/').then(r => log(r)).catch(e=>log(e));

    this.dispatch(['themesManager:init']);

    return plugins;
  };

  // first cb
  onInitSuccess(pluginsJsonDescription) {
    return this.state.merge({ isInitialized: true });
  }

  // next called
  initSuccess(pluginsJsonDescription) {
    const staticInteractors = lo(pluginsJsonDescription).pickBy({dynamic: false}).reduce((accum, desc, name) => {
      const pluginName = name+'Plugin';
      accum[pluginName] = DataFlow.buildFromJson(pluginName, desc.models, desc.flow);
      return accum;
    }, {});

    const dynPluginNames = [];
    const dynInteractors = lo(pluginsJsonDescription).pickBy({dynamic: true}).reduce((accum, desc, name) => {
      dynPluginNames.push(name);
      const pluginName = name+'Plugin';
      accum[pluginName] = DataFlow.buildFromJson(pluginName, desc.models, desc.flow);
      return accum;
    }, {});

    this.dispatch(['plugins:register', staticInteractors, dynInteractors]);
    this.dispatch(['playground:init', dynInteractors]);
  }

  onInitError(e) {
    log('onInitError', e)
    return this.state;
  }

  initError(e) {
    log('initError', e)

  }
}
