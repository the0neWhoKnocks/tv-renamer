import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import Modal from 'COMPONENTS/Modal';
import Renamable, {
  ROOT_CLASS as RENAMABLE_ROOT_CLASS,
} from 'COMPONENTS/Renamable';
import Toggle from 'COMPONENTS/Toggle';
import Version from 'COMPONENTS/Version';
import {
  API__CONFIG,
  API__FILES_LIST,
  API__JWT,
  API__PREVIEW_RENAME,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import getRemainingJWTTime from 'UTILS/getRemainingJWTTime';
import styles, {
  MODIFIER__HAS_ITEMS,
  MODIFIER__PREVIEWING,
  ROOT_CLASS,
} from './styles';

class App extends Component {
  static getPreviewItem(index, items) {
    return items.find((item) => +item.index === index);
  }
  
  constructor() {
    super();
    
    this.state = {
      config: undefined,
      files: [],
      loaded: false,
      previewItems: [],
      renamedFiles: [],
      selectAll: true,
      showConfig: false,
      showVersion: false,
      useGlobalToggle: true,
    };
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);
    this.handleCloseVersion = this.handleCloseVersion.bind(this);
    this.handleGlobalToggle = this.handleGlobalToggle.bind(this);
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
    this.handlePreviewRename = this.handlePreviewRename.bind(this);
    this.handleVersionClick = this.handleVersionClick.bind(this);
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
  
  handleCloseVersion() {
    this.setState({ showVersion: false });
  }
  
  handleConfigSave(config) {
    this.setState({
      config,
      showConfig: false,
    });
  }
  
  handleGlobalToggle() {
    this.setState({
      selectAll: !this.state.selectAll,
      useGlobalToggle: true,
    });
  }
  
  handlePreviewRename() {
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }.is--selected .${ RENAMABLE_ROOT_CLASS }__name`);
    const names = [...items].map((itemEl) => {
      const name = itemEl.innerText;
      const matches = name.match(/^([a-z'.-]+\b(?:\d{3,4})?)\.(s(\d{2})e(\d{2}))?/i);
      const nameData = {
        index: itemEl.dataset.index,
        name,
      };
      
      return (matches)
        ? {
          ...nameData,
          episode: matches[4] && +matches[4],
          name: matches[1] && matches[1].replace(/\./g, ' '),
          season: matches[3] && +matches[3],
        }
        : nameData;
    });
    
    fetch(API__PREVIEW_RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((previewItems) => {
        this.setState({
          previewItems,
          useGlobalToggle: false,
        });
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  handleOpenConfig() {
    this.setState({ showConfig: true });
  }
  
  handleVersionClick() {
    this.setState({ showVersion: true });
  }
  
  render() {
    const {
      config,
      files,
      loaded,
      previewItems,
      renamedFiles,
      selectAll,
      showConfig,
      showVersion,
      useGlobalToggle,
    } = this.state;
    const btnPronoun = (selectAll) ? 'All' : 'Selected';
    const globalTogglePronoun = (selectAll) ? 'None' : 'All';
    const versionProps = {
      onClose: this.handleCloseVersion,
    };
    let configProps = {
      onClose: this.handleCloseConfig,
      onSaveComplete: this.handleConfigSave,
    };
    let previewing = false;
    let rootModifier = '';
    
    if(!loaded) return <div>Loading</div>;
    
    if(config) configProps = { ...configProps, ...config };
    else if(showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
    if(previewItems.length) previewing = true;
    
    if(previewing) rootModifier += ` ${ MODIFIER__PREVIEWING }`;
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}>
        <nav className={`${ ROOT_CLASS }__nav`}>
          <button onClick={this.handleVersionClick}>
            {global.appVersion}
          </button>
          <button onClick={this.handleOpenConfig}>
            ☰ Config
          </button>
        </nav>
        <div className={`${ ROOT_CLASS }__body`}>
          <section className={`${ ROOT_CLASS }__section`}>
            <div className={`${ ROOT_CLASS }__section-title`}>
              <h2>Awaiting Rename</h2>
            </div>
            <nav className={`${ ROOT_CLASS }__items-nav`}>
              <Toggle
                className={`${ ROOT_CLASS }__global-toggle`}
                id="itemSelectToggle"
                onToggle={this.handleGlobalToggle}
                toggled={selectAll}
              >Select {globalTogglePronoun}</Toggle>
              <div className={`${ ROOT_CLASS }__items-nav-btns-wrapper`}>
                <button onClick={this.handlePreviewRename}>Preview</button>
                <button disabled={!previewing}>Rename {btnPronoun}</button>
              </div>
            </nav>
            <div
              className={`${ ROOT_CLASS }__section-items ${ (files.length) ? MODIFIER__HAS_ITEMS : '' }`}
              ref={(ref) => { this.filesRef = ref; }}
            >
              {files.map(
                ({ dir, ext, name }, ndx) => {
                  const previewItem = App.getPreviewItem(ndx, previewItems);
                  let selected = selectAll;
                  let newName;
                  
                  if(previewItem){
                    newName = (previewItem.error) ? previewItem : previewItem.name;
                  }
                  
                  if(
                    // if an item is in error state, deselect it
                    previewing && typeof newName !== 'string'
                    // but only after a preview has come through, otherwise
                    // allow for the global toggle to control it
                    && !useGlobalToggle
                  ){
                    selected = false;
                  }
                  
                  return (
                    <Renamable
                      key={name}
                      ext={ext}
                      itemIndex={ndx}
                      name={name}
                      newName={newName}
                      path={dir}
                      previewing={previewing}
                      selected={selected}
                    />
                  );
                }
              )}
            </div>
          </section>
          {!!renamedFiles.length && (
            <section className={`${ ROOT_CLASS }__section`}>
              <div className={`${ ROOT_CLASS }__section-title`}>
                <h2>Renamed</h2>
              </div>
              <div className={`${ ROOT_CLASS }__section-items ${ (renamedFiles.length) ? 'has--items' : '' }`}>
                {renamedFiles && (<div />)}
              </div>
            </section>
          )}
        </div>
        {showConfig && (
          <Modal>
            <Config {...configProps} />
          </Modal>
        )}
        {showVersion && (
          <Modal onMaskClick={this.handleCloseVersion}>
            <Version {...versionProps} />
          </Modal>
        )}
      </div>
    );
  }
}

export default App;