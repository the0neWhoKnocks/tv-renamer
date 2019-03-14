import React, { Component, Fragment } from 'react';
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
  API__IDS,
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
  MODIFIER__LOGS_OPEN,
  MODIFIER__RENAME,
  ROOT_CLASS,
} from './styles';

export const NAME_REGEX = /^([a-z1-9'.-]+\b(?:\d{3,4})?)\.(s(\d{2})e(\d{2}))?/i;
const MULTI_EPS_REGEX = /(?:e(\d{2}))/gi;

class App extends Component {
  static getPreviewItem(index, items) {
    return items.find((item) => +item.index === index);
  }
  
  static parseLookupName(name) {
    return name.toLowerCase().replace(/\./g, ' ');
  }
  
  static transformIdMappings(idMappings) {
    const map = {};
    const warnings = [];
    
    Object.keys(idMappings).forEach((id) => {
      idMappings[id].forEach((name) => {
        if(map[name]) warnings.push(name);
        map[name] = id;
      });
    });
    
    if(warnings.length) alert(`Warning: Duplicate ID mappings found for: ${ warnings.join('\n') }`);
    
    return map;
  }
  
  static buildLookupName(idMappings, name) {
    const data = {};
    const nameMatch = name.match(NAME_REGEX) || [];
    
    if(nameMatch[1]){
      data.lookupName = App.parseLookupName(nameMatch[1]);
      
      if(idMappings[data.lookupName]){
        data.idOverride = +idMappings[data.lookupName];
      }
    }
    
    return data;
  }
  
  static transformItemData({
    files,
    idMappings,
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
        ...App.buildLookupName(idMappings, name),
      };
      const previewItem = App.getPreviewItem(ndx, previewItems);
      
      if(previewItem){
        data.error = previewItem.error;
        data.id = previewItem.id;
        data.newName = previewItem.name;
        data.searchURL = previewItem.searchURL;
        data.seriesURL = previewItem.seriesURL;
        
        if(!useGlobalToggle && !data.error) data.selected = true;
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
      idMappings: {},
      loaded: false,
      logs: [],
      logsOpen: false,
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
    
    this.handleAssignIdSuccess = this.handleAssignIdSuccess.bind(this);
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleFileSelectChange = this.handleFileSelectChange.bind(this);
    this.handleGlobalToggle = this.handleGlobalToggle.bind(this);
    this.handleIdOverrideClick = this.handleIdOverrideClick.bind(this);
    this.handleLogsToggle = this.handleLogsToggle.bind(this);
    this.handleLookupNameChange = this.handleLookupNameChange.bind(this);
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
  
  buildPreviewData(itemEl) {
    const name = itemEl.innerText;
    const itemData = itemEl.dataset;
    const matches = name.match(NAME_REGEX);
    const epMatches = name.match(MULTI_EPS_REGEX) || [];
    const episodes = epMatches.map((ep) => +ep.toLowerCase().replace('e', ''));
    const nameData = {
      id: +itemData.id,
      index: itemData.index,
      name,
    };
    
    if(isNaN(nameData.id)) delete nameData.id;
    
    return (matches)
      ? {
        ...nameData,
        episode: matches[4] && +matches[4],
        episodes: episodes,
        name: matches[1] && App.parseLookupName(matches[1]),
        season: matches[3] && +matches[3],
      }
      : nameData;
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
          if(!state.showConfig){
            this.getIDs().then(() => {
              this.getFilesList();
            });
          }
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
          idMappings,
          previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        } = this.state;
        const transformedItems = App.transformItemData({
          files,
          idMappings,
          previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        });
        
        this.setState({
          files: transformedItems.files,
          selectionCount: transformedItems.files.length,
        });
      });
  }
  
  getIDs() {
    return new Promise((resolve, reject) => {
      fetch(API__IDS)
        .then((idMappings) => {
          this.setState(
            { idMappings: App.transformIdMappings(idMappings) },
            () => resolve()
          );
        })
        .catch((err) => {
          reject(err);
          alert(err);
        });
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
  
  handleAssignIdSuccess({ id, idMappings, index }) {
    const el = document.querySelector(`.${ RENAMABLE_ROOT_CLASS }__name[data-index="${ index }"]`);
    const itemData = this.buildPreviewData(el);
    itemData.id = id;
    
    // Request new preview for just this item since the user chose a specific
    // TVDB id.
    this.previewRename([itemData], (_previewItems) => {
      this.setState({
        idMappings: App.transformIdMappings(idMappings),
        showAssignId: false,
      });
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
      allSelected: true,
      files,
      selectAll,
      selectionCount: (selectAll) ? files.length : 0,
      useGlobalToggle: true,
    });
  }
  
  handleFileSelectChange({ index, selected }) {
    let allSelected = true;
    let selectionCount = 0;
    const files = this.state.files.map((file, ndx) => {
      const _file = { ...file };
      
      if(ndx === index) _file.selected = selected;
      if(!_file.selected) allSelected = false;
      else selectionCount++;
      
      return _file;
    });
    
    this.setState({
      allSelected,
      files,
      selectAll: allSelected,
      selectionCount,
      useGlobalToggle: false,
    });
  }
  
  handleIdOverrideClick({ id, index, lookupName, searchURL }) {
    this.setState({
      currentId: id,
      currentIndex: index,
      currentName: lookupName,
      currentSearchURL: searchURL,
      showAssignId: true,
    });
  }
  
  handleLogsToggle() {
    this.setState({ logsOpen: !this.state.logsOpen });
  }
  
  handleLookupNameChange({ index, name }) {
    const files = [...this.state.files];
    const file = {
      ...files[index],
      ...App.buildLookupName(this.state.idMappings, name),
    };
    files[index] = file;
    
    this.setState({ files });
  }
  
  handleModalClose(stateProp) {
    return () => {
      this.setState({ [stateProp]: false });
    };
  }
  
  handlePreviewRename() {
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }.is--selected .${ RENAMABLE_ROOT_CLASS }__name`);
    const names = [...items].map(this.buildPreviewData);
    
    this.previewRename(names);
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
        let allSelected = true;
        let selectionCount = 0;
        
        for(let i=0; i<files.length; i++){
          const log = logs[i];
        
          if(!log || log && log.error){
            const currFile = files[i];
            
            updatedFiles.push({
              ...currFile,
              index: updatedFiles.length,
            });
            updatedPreviewItems.push({
              ...previewItems[i],
              index: updatedPreviewItems.length,
            });
            
            if(currFile.selected) selectionCount++;
            if(!currFile.selected) allSelected = false;
            
            if(log && log.error){
              console.error(log.error);
              errors++;
            }  
          }
          else{ successful++; }
        }
        
        this.setState({
          allSelected,
          files: updatedFiles,
          logs: [
            // ...this.state.logs, // TODO - mabye uncomment to append to all logs
            ...Object.keys(logs).map((key) => logs[key]),
          ],
          logsOpen: true,
          previewItems: updatedPreviewItems,
          renameCount: successful,
          renameErrorCount: errors,
          selectAll: !!selectionCount,
          selectionCount,
        });
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  handleVersionClick() {
    this.setState({ showVersion: true });
  }
  
  previewRename(names, cb) {
    fetch(API__PREVIEW_RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((previewItems) => {
        const {
          files,
          idMappings,
          previewItems: previousItems,
          selectAll,
        } = this.state;
        const previewing = !!previewItems.length;
        const useGlobalToggle = false;
        
        // if there are current preview items, but they weren't submitted with
        // the current Preview session, maintain the old results.
        let _previewItems = [];
        previewItems.forEach((item) => {
          _previewItems[+item.index] = item;
        });
        
        if(previousItems){
          previousItems.forEach((item) => {
            const ndx = +item.index;
            if(!_previewItems[ndx]) _previewItems[ndx] = item;
          });
        }
        
        const transformedItems = App.transformItemData({
          files,
          idMappings,
          previewItems: _previewItems,
          previewing,
          selectAll,
          useGlobalToggle,
        });
        
        this.setState({
          allSelected: transformedItems.allSelected,
          files: transformedItems.files,
          previewing,
          previewItems: _previewItems,
          selectAll: !!transformedItems.selectionCount,
          selectionCount: transformedItems.selectionCount,
          useGlobalToggle,
        }, () => {
          if(cb) cb(_previewItems);
        });
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  render() {
    const {
      allSelected,
      config,
      currentId,
      currentIndex,
      currentName,
      currentSearchURL,
      files,
      loaded,
      logs,
      logsOpen,
      previewing,
      previewItems,
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
      index: currentIndex,
      name: currentName,
      onAssignSuccess: this.handleAssignIdSuccess,
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
    
    if(
      // previewing at least one item is selected
      previewing && selectionCount
      // and none of the selected items have errors
      && !previewItems.filter(({ error, index }) => files[index].selected && error).length
    ) rootModifier += ` ${ MODIFIER__RENAME }`;
    
    if(logs.length){
      rootModifier += ` ${ MODIFIER__LOGS }`;
      
      if(logsOpen) rootModifier += ` ${ MODIFIER__LOGS_OPEN }`;
    }
    
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
                  disabled={selectionCount === 0}
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
                  onLookupNameChange={this.handleLookupNameChange}
                  onSelectChange={this.handleFileSelectChange}
                  path={fileData.dir}
                  previewing={previewing}
                />
              ))}
            </div>
          </section>
          {!!logs.length && (
            <section className={`${ ROOT_CLASS }__section`}>
              <div className={`${ ROOT_CLASS }__section-title`}>
                <h2>Logs</h2>
                <nav className={`${ ROOT_CLASS }__logs-nav`}>
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
                  <Toggle
                    id="logsToggle"
                    onToggle={this.handleLogsToggle}
                    toggled={logsOpen}
                  >
                    {logsOpen && <Fragment>&#x23F7;</Fragment>}
                    {!logsOpen && <Fragment>&#x23F6;</Fragment>}
                  </Toggle>
                </nav>
              </div>
              {logsOpen && (
                <div className={`${ ROOT_CLASS }__section-items ${ (logs.length) ? 'has--items' : '' }`}>
                  {logs.map((log, ndx) => <LogItem key={ndx} {...log} />)}
                  <div
                    className={`${ ROOT_CLASS }__logs-btm`}
                    ref={this.logEndRef}
                  />
                </div>
              )}
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