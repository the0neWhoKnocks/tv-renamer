import React, { Component } from 'react';
import AssignId from 'COMPONENTS/AssignId';
import Config from 'COMPONENTS/Config';
import LogItem from 'COMPONENTS/LogItem';
import Modal from 'COMPONENTS/Modal';
import OverlayScreen from 'COMPONENTS/OverlayScreen';
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
  MODIFIER__LOGS,
  MODIFIER__RENAME,
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
      selectionCount: 0, 
    };
    
    files.forEach(({ dir, ext, name }, ndx) => {
      const data = {
        dir, ext, name,
        newName: undefined,
        selected: selectAll,
      };
      const previewItem = App.getPreviewItem(ndx, previewItems);
      
      if(previewItem){
        data.error = previewItem.error;
        data.id = previewItem.id;
        data.newName = previewItem.name;
        data.searchURL = previewItem.searchURL;
        data.seriesURL = previewItem.seriesURL;
      }
      
      if(
        previewing && (
          // IF an item is in error state, deselect it
          data.error
          // OR nothing was sent to preview (assume it's already deselected)
          || !previewItem
        )
        // but only after a preview has come through, otherwise
        // allow for the global toggle to control it
        && !useGlobalToggle
      ){
        data.selected = false;
        transformed.allSelected = false;
      }
      
      if(data.selected) transformed.selectionCount++;
      
      transformed.files.push(data);
    });
    
    return transformed;
  }
  
  constructor() {
    super();
    
    this.state = {
      allSelected: true,
      config: undefined,
      files: [],
      loaded: false,
      logs: [],
      previewItems: [],
      previewing: false,
      renameCount: 0,
      renameErrorCount: 0,
      selectAll: true,
      selectionCount: 0,
      showAssignId: false,
      showConfig: false,
      showVersion: false,
      useGlobalToggle: true,
    };
    
    this.logEndRef = React.createRef();
    
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleGlobalToggle = this.handleGlobalToggle.bind(this);
    this.handleIdOverrideClick = this.handleIdOverrideClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
    this.handlePreviewRename = this.handlePreviewRename.bind(this);
    this.handleRename = this.handleRename.bind(this);
    this.handleVersionClick = this.handleVersionClick.bind(this);
  }
  
  componentDidMount() {
    this.checkCredentials();
    
    // TODO - maybe re-enable this. For now, just displaying the logs from the
    // current renaming operation.
    // this.checkLogs();
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
      const el = this.logEndRef.current;
      const elParent = el.parentNode;
      // If scroll is zero (first load), set to end of pane. else, scroll smoothly
      if(elParent.scrollTop === 0) {
        // TODO - maybe have it scroll to the first error (if there is one)
        elParent.scrollTo(0, elParent.scrollHeight);
      }
      else{
        el.scrollIntoView({ behavior: 'smooth' });
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
        const {
          previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        } = this.state;
        const transformedItems = App.transformItemData({
          files,
          previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        });
        
        this.setState({ files: transformedItems.files });
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
  
  handleConfigSave(config) {
    this.setState({
      config,
      showConfig: false,
    });
  }
  
  handleGlobalToggle() {
    const selectAll = !this.state.selectAll;
    const files = this.state.files.map((file) => ({
      ...file,
      selected: selectAll,
    }));
    
    this.setState({
      files,
      selectAll,
      useGlobalToggle: true,
    });
  }
  
  handleIdOverrideClick({ id, newName, searchURL }) {
    this.setState({
      currentId: id,
      currentName: newName,
      currentSearchURL: searchURL,
      showAssignId: true,
    });
  }
  
  handleModalClose(stateProp) {
    return () => {
      this.setState({ [stateProp]: false });
    };
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
        const { files, selectAll } = this.state;
        const previewing = !!previewItems.length;
        const useGlobalToggle = false;
        const transformedItems = App.transformItemData({
          files,
          previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        });
        
        this.setState({
          allSelected: transformedItems.allSelected,
          files: transformedItems.files,
          previewing,
          previewItems,
          selectAll: !!transformedItems.selectionCount,
          selectionCount: transformedItems.selectionCount,
          useGlobalToggle,
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
    // TODO - filter out preview items that currently have an error
    const names = [...items].map((itemEl) => {
      const itemData = itemEl.dataset;
      
      return {
        index: itemData.index,
        newName: itemData.newName,
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
        let errors = 0;
        let successful = 0;
        
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
            
            if(log && log.error){
              console.error(log.error);
              errors++;
            }  
          }
          else{ successful++; }
        }
        
        this.setState({
          files: updatedFiles,
          logs: [
            // ...this.state.logs, // TODO - mabye uncomment to append to all logs
            ...Object.keys(logs).map((key) => logs[key]),
          ],
          previewItems: updatedPreviewItems,
          renameCount: successful,
          renameErrorCount: errors,
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
      allSelected,
      config,
      currentId,
      currentName,
      currentSearchURL,
      files,
      loaded,
      logs,
      previewing,
      renameCount,
      renameErrorCount,
      selectAll,
      selectionCount,
      showAssignId,
      showConfig,
      showVersion,
    } = this.state;
    const btnPronoun = (allSelected) ? 'All' : 'Selected';
    const globalTogglePronoun = (selectAll) ? 'None' : 'All';
    const assignProps = {
      id: currentId,
      name: currentName,
      searchURL: currentSearchURL,
    };
    const versionProps = {
      onClose: this.handleModalClose('showVersion'),
    };
    let configProps = {
      onClose: this.handleModalClose('showConfig'),
      onSaveComplete: this.handleConfigSave,
    };
    let rootModifier = '';
    
    if(!loaded) return <div>Loading</div>;
    
    if(config) configProps = { ...configProps, ...config };
    else if(showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
    if(previewing && selectionCount) rootModifier += ` ${ MODIFIER__RENAME }`;
    if(logs.length) rootModifier += ` ${ MODIFIER__LOGS }`;
    
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
              {files.map((fileData, ndx) => (
                <Renamable
                  key={fileData.name}
                  {...fileData}
                  itemIndex={ndx}
                  onIdClick={this.handleIdOverrideClick}
                  path={fileData.dir}
                  previewing={previewing}
                />
              ))}
            </div>
          </section>
          {!!logs.length && (
            <section className={`${ ROOT_CLASS }__section`}>
              <div className={`${ ROOT_CLASS }__section-title`}>
                <h2>Renamed</h2>
                <div className={`${ ROOT_CLASS }__stats`}>
                  {!!renameCount && (
                    <div className={`${ ROOT_CLASS }__stats-count is--good`}>
                      <span>{renameCount}</span>/{logs.length}
                    </div>
                  )}
                  {!!renameErrorCount && (
                    <div className={`${ ROOT_CLASS }__stats-count is--bad`}>
                      <span>{renameErrorCount}</span>/{logs.length}
                    </div>
                  )}
                </div>
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
        
        <Modal
          onMaskClick={this.handleModalClose('showAssignId')}
          visible={showAssignId}
        >
          <AssignId {...assignProps} />
        </Modal>
        
        <OverlayScreen visible={showConfig}>
          <Config {...configProps} />
        </OverlayScreen>
        
        <Modal
          onMaskClick={versionProps.onClose}
          visible={showVersion}
        >
          <Version {...versionProps} />
        </Modal>
      </div>
    );
  }
}

export default App;