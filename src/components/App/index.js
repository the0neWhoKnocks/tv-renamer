import React, { Component } from 'react';
import Config from 'COMPONENTS/Config';
import LogItem from 'COMPONENTS/LogItem';
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
  API__LOGS,
  API__PREVIEW_RENAME,
  API__RENAME,
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
  
  static transformItemData({
    files,
    previewItems,
    previewing,
    selectAll,
    useGlobalToggle,
  }) {
    const transformed = {
      allSelected: selectAll,
      files: [],
    };
    
    files.forEach(({ dir, ext, name }, ndx) => {
      const data = {
        dir, ext, name,
        newName: undefined,
        selected: selectAll,
      };
      const previewItem = App.getPreviewItem(ndx, previewItems);
      
      if(previewItem){
        data.newName = (previewItem.error) ? previewItem : previewItem.name;
      }
      
      if(
        // if an item is in error state, deselect it
        previewing && typeof data.newName !== 'string'
        // but only after a preview has come through, otherwise
        // allow for the global toggle to control it
        && !useGlobalToggle
      ){
        data.selected = false;
        transformed.allSelected = false;
      }
      
      transformed.files.push(data);
    });
    
    return transformed;
  }
  
  constructor() {
    super();
    
    this.state = {
      config: undefined,
      files: [],
      loaded: false,
      logs: [],
      previewItems: [],
      selectAll: true,
      showConfig: false,
      showVersion: false,
      useGlobalToggle: true,
    };
    
    this.logEndRef = React.createRef();
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleCloseConfig = this.handleCloseConfig.bind(this);
    this.handleCloseVersion = this.handleCloseVersion.bind(this);
    this.handleGlobalToggle = this.handleGlobalToggle.bind(this);
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
    this.handlePreviewRename = this.handlePreviewRename.bind(this);
    this.handleRename = this.handleRename.bind(this);
    this.handleVersionClick = this.handleVersionClick.bind(this);
  }
  
  componentDidMount() {
    this.checkCredentials();
    this.checkLogs();
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
    
    if(this.logEndRef.current && prevState.logs.length !== this.state.logs.length){
      // TODO - if scroll is zero (first load), set to end of pane. else, scroll smoothly
      setTimeout(() => {
        this.logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 300);
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
  
  checkLogs() {
    fetch(API__LOGS)
      .then((logs) => {
        this.setState({ logs });
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
  
  handleRename() {
    const { files, previewItems } = this.state;
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }.is--selected .${ RENAMABLE_ROOT_CLASS }__new-name`);
    const names = [...items].map((itemEl) => {
      const itemData = itemEl.dataset;
      
      return {
        index: itemData.index,
        newName: itemEl.innerText,
        oldPath: itemData.oldPath,
      };
    });
    
    fetch(API__RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((logs) => {
        // remove renamed items from lists
        const updatedFiles = [];
        const updatedPreviewItems = [];
        
        for(let i=0; i<files.length; i++){
          const log = logs[i];
        
          if(!log || log && log.error){
            updatedFiles.push({
              ...files[i],
              index: updatedFiles.length,
            });
            updatedPreviewItems.push({
              ...previewItems[i],
              index: updatedPreviewItems.length,
            });
            if(log && log.error) console.error(log.error);
          }
          else{
            // TODO - maybe add successful logs to Renamed section
          }
        }
        
        this.setState({
          files: updatedFiles,
          // TODO - maybe limit the number of logs here, like what's happening on the server
          logs: [
            ...this.state.logs,
            ...Object.keys(logs).map((key) => logs[key]),
          ],
          previewItems: updatedPreviewItems,
        });
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  handleVersionClick() {
    this.setState({ showVersion: true });
  }
  
  render() {
    const {
      config,
      files,
      loaded,
      logs,
      previewItems,
      selectAll,
      showConfig,
      showVersion,
      useGlobalToggle,
    } = this.state;
    const previewing = !!previewItems.length;
    const transformedItems = App.transformItemData({
      files,
      previewItems,
      previewing,
      selectAll,
      useGlobalToggle,
    });
    const btnPronoun = (transformedItems.allSelected) ? 'All' : 'Selected';
    const globalTogglePronoun = (selectAll) ? 'None' : 'All';
    const versionProps = {
      onClose: this.handleCloseVersion,
    };
    let configProps = {
      onClose: this.handleCloseConfig,
      onSaveComplete: this.handleConfigSave,
    };
    let rootModifier = '';
    
    if(!loaded) return <div>Loading</div>;
    
    if(config) configProps = { ...configProps, ...config };
    else if(showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
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
                <button
                  onClick={this.handlePreviewRename}
                >Preview</button>
                <button
                  disabled={!previewing}
                  onClick={this.handleRename}
                >Rename {btnPronoun}</button>
              </div>
            </nav>
            <div
              className={`${ ROOT_CLASS }__section-items ${ (files.length) ? MODIFIER__HAS_ITEMS : '' }`}
              ref={(ref) => { this.filesRef = ref; }}
            >
              {transformedItems.files.map(
                ({ dir, ext, name, newName, selected }, ndx) => (
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
                )
              )}
            </div>
          </section>
          {!!logs.length && (
            <section className={`${ ROOT_CLASS }__section`}>
              <div className={`${ ROOT_CLASS }__section-title`}>
                <h2>Renamed</h2>
              </div>
              <div className={`${ ROOT_CLASS }__section-items ${ (logs.length) ? 'has--items' : '' }`}>
                {logs.map((log, ndx) => <LogItem key={ndx} {...log} />)}
                <div
                  className={`${ ROOT_CLASS }__logs-btm`}
                  ref={this.logEndRef}
                />
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