import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import {
  API__CONFIG,
  API__JWT,
} from 'ROOT/conf.repo';
import fetch from 'UTILS/fetch';
import getRemainingJWTTime from 'UTILS/getRemainingJWTTime';
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
  
  componentDidUpdate(prevProps, prevState) {
    if(this.state.config){
      if(
        // JWT doesn't exist
        !this.state.config.jwt
        // OR - there's a JWT, but it's older than 24 hours (or about to expire)
        || (
          this.state.config.jwt
          && getRemainingJWTTime(this.state.config.jwtDate) <= 1
        )
      ) {
        this.getJWT();
      }
    }
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
  
  getJWT() {
    const { apiKey, userKey, userName } = this.state.config;
    
    fetch(API__JWT, {
      method: 'POST',
      body: JSON.stringify({
        apiKey,
        userKey,
        userName,
      }),
    })
      .then((config) => {
        this.setState({ config });
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