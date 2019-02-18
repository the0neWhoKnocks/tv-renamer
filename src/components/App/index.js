import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import {
  API__CONFIG,
} from 'ROOT/conf.repo';
import fetch from 'UTILS/fetch';
import styles from './styles';

class App extends Component {
  constructor() {
    super();
    
    this.state = {
      config: {},
      loaded: false,
      overlay: null,
    };
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
    
    this.overlays = {
      config: () => (
        <Config
          onClose={this.handleCloseConfig}
          onSaveComplete={this.handleConfigSave}
          {...this.state.config}
        />
      ),
    };
  }
  
  componentDidMount() {
    this.checkCredentials();
  }
  
  checkCredentials() {
    const state = { loaded: true };
    
    fetch(API__CONFIG)
      .then((config) => {
        if(Object.keys(config).length){
          state.config = config;
        }
        else{
          state.overlay = this.overlays.config();
        }
        
        this.setState(state);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  handleCloseConfig() {
    this.setState({ overlay: null });
  }
  
  handleConfigSave(config) {
    this.setState({
      config,
      overlay: null,
    });
  }
  
  handleOpenConfig() {
    this.setState({ overlay: this.overlays.config() });
  }
  
  render() {
    const {
      loaded,
      overlay,
    } = this.state;
    const overlayModifier = (overlay) ? 'is--visible' : '';
    
    if(!loaded) return <div>Loading</div>;
    
    return (
      <div className={`app ${ styles }`}>
        <nav className="app__nav">
          <button onClick={this.handleOpenConfig}>Config</button>
        </nav>
        <div className="app__body"></div>
        <div className={`app__overlay ${ overlayModifier }`}>{overlay}</div>
      </div>
    );
  }
}

export default App;