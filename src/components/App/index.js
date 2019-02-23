import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import Modal from 'COMPONENTS/Modal';
import {
  API__CONFIG,
  API__FILES_LIST,
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
      files: [],
      loaded: false,
      renamedFiles: [],
      showConfig: false,
    };
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
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
          state.showConfig = true;
        }
        
        this.setState(state, () => {
          this.getFilesList();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  getFilesList() {
    fetch(API__FILES_LIST)
      .then((files) => {
        this.setState({ files });
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
    this.setState({ showConfig: false });
  }
  
  handleConfigSave(config) {
    this.setState({
      config,
      showConfig: false,
    });
  }
  
  handleOpenConfig() {
    this.setState({ showConfig: true });
  }
  
  render() {
    const {
      files,
      loaded,
      renamedFiles,
      showConfig,
    } = this.state;
    
    if(!loaded) return <div>Loading</div>;
    
    return (
      <div className={`app ${ styles }`}>
        <nav className="app__nav">
          <button onClick={this.handleOpenConfig}>
            ☰ Config
          </button>
        </nav>
        <div className="app__body">
          <section className="app__section">
            <h2 className="app__section-title">Awaiting Rename</h2>
            <div className={`app__section-items ${ (files.length) ? 'has--items' : '' }`}>
              {files.map(
                ({ dir, ext, name }, ndx) => (
                  <div
                    key={ndx}
                    className="app__renamable"
                    data-dir={dir}
                  >
                    <span
                      contentEditable="true"
                      suppressContentEditableWarning
                    >{name}</span>
                    <span>{ext}</span>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="app__section">
            <h2 className="app__section-title">Renamed</h2>
            <div className={`app__section-items ${ (renamedFiles.length) ? 'has--items' : '' }`}>
              {renamedFiles && (<div />)}
            </div>
          </section>
        </div>
        {showConfig && (
          <Modal>
            <Config
              onClose={this.handleCloseConfig}
              onSaveComplete={this.handleConfigSave}
              {...this.state.config}
            />
          </Modal>
        )}
      </div>
    );
  }
}

export default App;