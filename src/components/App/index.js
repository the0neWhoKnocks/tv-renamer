import React, { Component } from 'react';
import AssignId from 'COMPONENTS/AssignId';
import Config from 'COMPONENTS/Config';
import DeleteConfirmation from 'COMPONENTS/DeleteConfirmation';
import Indicator from 'COMPONENTS/Indicator';
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
  MODIFIER__INDICATOR,
  MODIFIER__LOGS,
  MODIFIER__LOGS_OPEN,
  MODIFIER__VISIBLE,
  MODIFIER__RENAME,
  ROOT_CLASS,
} from './styles';

export const NAME_REGEX = /^([a-z1-9'.\-&\s]+\b(?:\d{3,4})?)(?:\.|\s)?s(\d{2})e(\d{2})/i;
const MULTI_EPS_REGEX = /(?:s\d{2}|-)(?:e(\d{2}))/gi;

class App extends Component {
  static getPreviewItem(index, items) {
    // `items` will sometimes have `empty` items, so ensure an item exists
    // before any checks occur.
    return items.find((item) => item && +item.index === index);
  }
  
  static parseLookupName(name) {
    return name.toLowerCase().replace(/\./g, ' ').trim();
  }
  
  static renamableFilter({ error, index, selected, skipped }) {
    return selected && (error || skipped);
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
    
    files.forEach(({ dir, ext, idOverride, lookupName, name }, ndx) => {
      const data = {
        dir, ext, idOverride, lookupName, name,
        newName: undefined,
        selected: selectAll,
        ...App.buildLookupName(idMappings, name),
      };
      const previewItem = App.getPreviewItem(ndx, previewItems);
      
      if(previewItem){
        data.error = previewItem.error;
        data.id = previewItem.id;
        data.newName = previewItem.name;
        data.seriesURL = previewItem.seriesURL;
        
        if(!useGlobalToggle && !data.error) data.selected = true;
      }
      
      if(
        previewing && (
          // IF an item is in error state, deselect it
          data.error
          // OR nothing was sent to preview (assume it's already deselected)
          || !previewItem
          // OR an item came back (to preserve index order) but most likely skipped (no name passed)
          || previewItem && !previewItem.name
        )
        // but only after a preview has come through, otherwise
        // allow for the global toggle to control it
        && !useGlobalToggle
      ){
        data.selected = false;
        transformed.allSelected = false;
        
        // if there's no previewItem and no error, the user most likely skipped
        // an item before any previews have occurred (since there's no previously
        // saved error state for the item).
        if(!data.error){
          data.skipped = true;
        }
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
      deletionIndex: undefined,
      deletionPath: undefined,
      files: [],
      idMappings: {},
      loaded: false,
      logs: [],
      logsOpen: false,
      previewItems: [],
      previewing: false,
      previewRequested: false,
      renameCount: 0,
      renameErrorCount: 0,
      renameRequested: false,
      selectAll: true,
      selectionCount: 0,
      showAssignId: false,
      showConfig: false,
      showDeleteConfirmation: false,
      showVersion: false,
      useGlobalToggle: true,
      visible: false,
    };
    
    this.logEndRef = React.createRef();
    
    this.handleAssignIdSuccess = this.handleAssignIdSuccess.bind(this);
    this.handleCacheUpdateClick = this.handleCacheUpdateClick.bind(this);
    this.handleConfigSave = this.handleConfigSave.bind(this);
    this.handleFileDeleteClick = this.handleFileDeleteClick.bind(this);
    this.handleFileDeletion = this.handleFileDeletion.bind(this);
    this.handleFileFolderToggle = this.handleFileFolderToggle.bind(this);
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
    
    setTimeout(() => {
      this.setState({ visible: true });
    }, 300);
    
    // TODO - maybe re-enable this. For now, just displaying the logs from the
    // current renaming operation.
    // this.checkLogs();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(this.state.config){
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
    const name = itemEl.innerText.replace(/\n/g, '');
    const itemData = itemEl.dataset;
    const matches = name.match(NAME_REGEX);
    const epMatches = name.match(MULTI_EPS_REGEX) || [];
    const episodes = [];
    const nameData = {
      id: +itemData.id,
      index: itemData.index,
      name,
    };
    
    epMatches.forEach((ep) => {
      const _ep = ep.match(new RegExp(MULTI_EPS_REGEX.source, 'i'));
      if(_ep) episodes.push(+_ep[1]);
    });
    
    if(isNaN(nameData.id)) delete nameData.id;
    
    return (matches)
      ? {
        ...nameData,
        episode: matches[3] && +matches[3],
        episodes: episodes,
        name: matches[1] && App.parseLookupName(matches[1]),
        season: matches[2] && +matches[2],
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
            this.checkJWT()
              .then(() => { this.getIDs(); })
              .then(() => { this.getFilesList(); });
          }
        });
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  }
  
  checkJWT() {
    return new Promise((resolve, reject) => {
      if(
        // JWT doesn't exist
        !this.state.config.jwt
        // OR - there's a JWT, but it's older than 24 hours (or about to expire)
        || (
          this.state.config.jwt
          && getRemainingJWTTime(this.state.config.jwtDate) <= 1
        )
      ) {
        this.setJWT()
          .then(() => { resolve(); })
          .catch((err) => { reject(err); });
      }
      else{
        resolve();
      }
    });
  }
  
  checkLogs() {
    fetch(API__LOGS)
      .then((logs) => {
        this.setState({ logs });
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  }
  
  getFilesList() {
    return fetch(API__FILES_LIST)
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
      })
      .catch((err) => {
        console.error(err);
        alert(err);
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
  
  setJWT() {
    const { apiKey, userKey, userName } = this.state.config;
    
    return fetch(API__JWT, {
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
  
  handleCacheUpdateClick({ id, index, lookupName }) {
    const el = document.querySelector(`.${ RENAMABLE_ROOT_CLASS }__name[data-index="${ index }"]`);
    const itemData = this.buildPreviewData(el);
    itemData.id = id;
    itemData.updateCache = true;
    
    // Request new updated preview for just this item.
    this.previewRename([itemData]);
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
  
  handleFileDeleteClick({ filePath, index }) {
    const { sourceFolder } = this.state.config;
    
    this.setState({
      // Make file relative to source
      deletionIndex: index,
      deletionPath: filePath.replace(`${ sourceFolder }/`, ''),
      showDeleteConfirmation: true,
    });
  }
  
  handleFileDeletion({ filePath, index }) {
    // remove deleted item from lists
    const { files, previewItems, selectionCount } = this.state;
    const _files = [...files];
    const _previewItems = [...previewItems];
    const updatedFiles = [];
    const updatedPreviewItems = [];
    
    _files.splice(index, 1);
    if(_previewItems.length) _previewItems.splice(index, 1);
    
    for(let i=0; i<_files.length; i++){
      const currFile = _files[i];
      
      updatedFiles.push({
        ...currFile,
        index: updatedFiles.length,
      });
      
      if(_previewItems.length){
        updatedPreviewItems.push({
          ..._previewItems[i],
          index: updatedPreviewItems.length,
        });
      }
    }
    
    this.setState({
      files: updatedFiles,
      previewItems: updatedPreviewItems,
      selectionCount: (selectionCount) ? selectionCount - 1 : selectionCount,
      showDeleteConfirmation: false,
    });
  }
  
  handleFileFolderToggle({ folderSelected, index }) {
    const files = this.state.files.map((file, ndx) => {
      let _file = file;
      if(ndx === index) _file = { ...file, folderSelected };
      return _file;
    });
    
    this.setState({ files });
  }
  
  handleFileSelectChange({ index, selected }) {
    let allSelected = true;
    let selectionCount = 0;
    const files = this.state.files.map((file, ndx) => {
      let _file = file;
      
      if(ndx === index) _file = { ...file, selected };
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
  
  handleIdOverrideClick({ id, index, lookupName }) {
    this.setState({
      currentId: id,
      currentIndex: index,
      currentName: lookupName,
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
    const names = [...items].map((itemEl) => {
      const itemData = itemEl.dataset;
      const index = itemData.index;
      
      return {
        index,
        moveToFolder: (files[index].folderSelected)
          ? previewItems[index].seriesName
          : undefined,
        newName: itemData.newName,
        oldPath: itemData.oldPath,
      };
    });
    
    // show indicator if request is taking too long
    this.renameRequestTimer = setTimeout(() => {
      delete this.renameRequestTimer;
      this.setState({ renameRequested: true });
    }, 300);
    
    fetch(API__RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((logs) => {
        clearTimeout(this.renameRequestTimer);
        
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
          renameRequested: false,
          selectAll: !!selectionCount,
          selectionCount,
        });
      })
      .catch((err) => {
        alert(err);
        this.setState({ renameRequested: false });
      });
  }
  
  handleVersionClick() {
    this.setState({ showVersion: true });
  }
  
  previewRename(names, cb) {
    // show indicator if request is taking too long
    this.previewRequestTimer = setTimeout(() => {
      delete this.previewRequestTimer;
      this.setState({ previewRequested: true });
    }, 300);
    
    fetch(API__PREVIEW_RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((previewItems) => {
        clearTimeout(this.previewRequestTimer);
        
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
          previewRequested: false,
          selectAll: !!transformedItems.selectionCount,
          selectionCount: transformedItems.selectionCount,
          useGlobalToggle,
        }, () => {
          if(cb) cb(_previewItems);
        });
      })
      .catch((err) => {
        alert(err);
        this.setState({ previewRequested: false });
      });
  }
  
  render() {
    const {
      allSelected,
      config,
      currentId,
      currentIndex,
      currentName,
      deletionIndex,
      deletionPath,
      files,
      loaded,
      logs,
      logsOpen,
      previewing,
      previewRequested,
      renameCount,
      renameErrorCount,
      renameRequested,
      selectAll,
      selectionCount,
      showAssignId,
      showConfig,
      showDeleteConfirmation,
      showVersion,
      visible,
    } = this.state;
    const btnPronoun = (allSelected) ? 'All' : 'Selected';
    const globalTogglePronoun = (selectAll) ? 'None' : 'All';
    const assignProps = {
      id: currentId,
      index: currentIndex,
      name: currentName,
      onAssignSuccess: this.handleAssignIdSuccess,
    };
    const deleteProps = {
      filePath: deletionPath,
      index: deletionIndex,
      onClose: this.handleModalClose('showDeleteConfirmation'),
      onDeleteSuccess: this.handleFileDeletion,
    };
    const versionProps = {
      onClose: this.handleModalClose('showVersion'),
    };
    let configProps = {
      onClose: this.handleModalClose('showConfig'),
      onSaveComplete: this.handleConfigSave,
    };
    let rootModifier = '';
    
    if(!loaded) return null;
    
    if(config) configProps = { ...configProps, ...config };
    else if(showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
    if(
      // previewing at least one item that is selected
      previewing && selectionCount
      // and none of the selected items have errors or were skipped
      && !files.filter(App.renamableFilter).length
    ) rootModifier += ` ${ MODIFIER__RENAME }`;
    
    if(logs.length){
      rootModifier += ` ${ MODIFIER__LOGS }`;
      
      if(logsOpen) rootModifier += ` ${ MODIFIER__LOGS_OPEN }`;
    }
    
    if(visible){
      rootModifier += ` ${ MODIFIER__VISIBLE }`;
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
                  className={`${ (previewRequested) ? MODIFIER__INDICATOR : '' }`}
                  disabled={selectionCount === 0}
                  onClick={this.handlePreviewRename}
                >
                  Preview
                  <Indicator visible={previewRequested} />
                </button>
                <button
                  className={`${ (renameRequested) ? MODIFIER__INDICATOR : '' }`}
                  disabled={!previewing}
                  onClick={this.handleRename}
                >
                  Rename {btnPronoun}
                  <Indicator visible={renameRequested} />
                </button>
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
                  onDeleteClick={this.handleFileDeleteClick}
                  onFolderSelectChange={this.handleFileFolderToggle}
                  onIdClick={this.handleIdOverrideClick}
                  onLookupNameChange={this.handleLookupNameChange}
                  onSelectChange={this.handleFileSelectChange}
                  onUpdateClick={this.handleCacheUpdateClick}
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
                    <div className={`${ ROOT_CLASS }__logs-arrow ${ (logsOpen) ? 'is--down' : 'is--up' }`} />
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
        
        <Modal
          onMaskClick={deleteProps.onClose}
          visible={showDeleteConfirmation}
        >
          <DeleteConfirmation {...deleteProps} />
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