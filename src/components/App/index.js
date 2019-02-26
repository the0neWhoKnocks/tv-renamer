import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import Modal from 'COMPONENTS/Modal';
import Renamable, {
  ROOT_CLASS as RENAMABLE_ROOT_CLASS,
} from 'COMPONENTS/Renamable';
import {
  API__CONFIG,
  API__FILES_LIST,
  API__JWT,
  API__PREVIEW_RENAME,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import getRemainingJWTTime from 'UTILS/getRemainingJWTTime';
import styles from './styles';

class App extends Component {
  constructor() {
    super();
    
    this.state = {
      config: undefined,
      files: [],
      loaded: false,
      previewItems: [],
      renamedFiles: [],
      showConfig: false,
    };
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);
    this.handlePreviewRename = this.handlePreviewRename.bind(this);
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
      
      // user just configured settings, so make initial files list call
      if(
        prevState.config
        && !prevState.config.jwt
        && this.state.config
        && this.state.config.jwt
      ){
        this.getFilesList();
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
          if(!state.showConfig) this.getFilesList();
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
  
  handlePreviewRename() {
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }__name`);
    const names = [...items].map((itemEl) => {
      
      const matches = itemEl.innerText.match(/^([a-z'.-]+\b(?:\d{3,4})?)\.(s(\d{2})e(\d{2}))?/i);
      
      return (matches)
        ? {
          episode: matches[4] && +matches[4],
          name: matches[1] && matches[1].replace(/\./g, ' '),
          season: matches[3] && +matches[3],
        }
        : {};
    });
    
    fetch(API__PREVIEW_RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((previewItems) => {
        this.setState({ previewItems });
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  handleOpenConfig() {
    this.setState({ showConfig: true });
  }
  
  render() {
    const {
      config,
      files,
      loaded,
      previewItems,
      renamedFiles,
      showConfig,
    } = this.state;
    let configProps = {
      onClose: this.handleCloseConfig,
      onSaveComplete: this.handleConfigSave,
    };
    let previewing = false;
    
    if(!loaded) return <div>Loading</div>;
    
    if(config) configProps = { ...configProps, ...config };
    else if(showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
    if(previewItems.length) previewing = true;
    
    return (
      <div className={`app ${ styles }`}>
        <nav className="app__nav">
          <button onClick={this.handleOpenConfig}>
            ☰ Config
          </button>
        </nav>
        <div className="app__body">
          <section className="app__section">
            <div className="app__section-title">
              <h2>Awaiting Rename</h2>
              <nav>
                <button onClick={this.handlePreviewRename}>Preview</button>
                <button>Rename</button>
              </nav>
            </div>
            <div
              className={`app__section-items ${ (files.length) ? 'has--items' : '' }`}
              ref={(ref) => { this.filesRef = ref; }}
            >
              {files.map(
                ({ dir, ext, name }, ndx) => {
                  return (
                    <Renamable
                      key={name}
                      ext={ext}
                      name={name}
                      newName={previewItems[ndx]}
                      path={dir}
                      previewing={previewing}
                    />
                  );
                }
              )}
            </div>
          </section>
          <section className="app__section">
            <div className="app__section-title">
              <h2 className="app__section-title">Renamed</h2>
            </div>
            <div className={`app__section-items ${ (renamedFiles.length) ? 'has--items' : '' }`}>
              {renamedFiles && (<div />)}
            </div>
          </section>
        </div>
        {showConfig && (
          <Modal>
            <Config {...configProps} />
          </Modal>
        )}
      </div>
    );
  }
}

export default App;