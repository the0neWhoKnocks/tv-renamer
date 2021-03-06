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
import SVG, { ICON__FOLDER } from 'COMPONENTS/SVG';
import Toggle from 'COMPONENTS/Toggle';
import Version from 'COMPONENTS/Version';
import {
  API__CONFIG,
  API__FILES_LIST,
  API__IDS,
  API__LOGS,
  API__PREVIEW_RENAME,
  API__RENAME,
  WS__MSG_TYPE__RENAME_STATUS,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import pad from 'UTILS/pad';
import styles, {
  MODIFIER__HAS_ITEMS,
  MODIFIER__INDICATOR,
  MODIFIER__LOGS,
  MODIFIER__LOGS_OPEN,
  MODIFIER__VISIBLE,
  MODIFIER__RENAME,
  ROOT_CLASS,
} from './styles';

/**
 * Ignore beginning of string if it starts with text in brackets
 * (?:\\[.*\\] )?
 * Capture everything up until it finds an episode schema or a year
 * (?<name>(?:(?!s\\d{2}e\\d{2}|\\(\\d{4}\\)).)*)
 * Capture the year, if one exists
 * (?:\\((?<year>\\d{4})\\))?
 */
const SERIES_PATTERN = '(?:\\[.*\\] )?(?<name>(?:(?!s\\d{2}e\\d{2}|\\(\\d{4}\\)).)*)(?:\\((?<year>\\d{4})\\))?';
const SERIES_NAME_REGEX = new RegExp(`^${ SERIES_PATTERN }`, 'i');
export const NAME_REGEX = new RegExp(`^${ SERIES_PATTERN }(?:\\.|\\s)?(?:\\s-\\s)?s(?<season>\\d{2})e(?<episode>\\d{2,3})`, 'i');
// name.s01e01-s01e02.ext
// name.s01e01e02.ext
// name.s01e01-episode1.title-s01e02-episode2.title.ext
// name.s01e01-e02-e03.ext
// name.s01e01-s01e02-s01e03.ext
const MULTI_EPS_REGEX = /(?:s\d{2}|(?:^-|))(?:e(\d{2,3}))/gi;

class App extends Component {
  static getPreviewItem(index, items) {
    // `items` will sometimes have `empty` items, so ensure an item exists
    // before any checks occur.
    return items.find((item) => item && +item.index === index);
  }
  
  static parseLookupName(name, year) {
    const parsedName = name.toLowerCase()
      .replace(/\./g, ' ')
      .replace(/ -/g, '')
      .trim();
    const seriesYear = (year && +year) ? ` (${ year })` : '';
    
    return {
      name: parsedName,
      nameWithYear: `${ parsedName }${ seriesYear }`,
    };
  }
  
  static renamableFilter({ error, index, selected, skipped }) {
    return selected && (error || skipped);
  }
  
  static transformIdMappings(idMappings) {
    const map = {};
    const warnings = [];
    
    Object.keys(idMappings).forEach((id) => {
      idMappings[id].forEach((name) => {
        if (map[name]) warnings.push(name);
        map[name] = id;
      });
    });
    
    if (warnings.length) alert(`Warning: Duplicate ID mappings found for: ${ warnings.join('\n') }`);
    
    return map;
  }
  
  static buildLookupName(idMappings, name) {
    const data = {};
    const nameMatch = name.match(NAME_REGEX) || [];
    
    if (nameMatch[1]) {
      const lookupNames = App.parseLookupName(nameMatch[1], nameMatch[2]);
      data.lookupName = lookupNames.nameWithYear;
      
      if (idMappings[data.lookupName]) {
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
    
    files.forEach(({ dir, ext, folderSelected, idOverride, lookupName, name }, ndx) => {
      const lookupNameData = App.buildLookupName(idMappings, name);
      
      // There's a case where a User could have renamed a file in the GUI, which
      // then sets the `lookupName`, but then the lookup names tries to get rebuilt
      // before a Preview, and base that info on the original file name, not the
      // updated one. This ensures that if a lookup name was generated due to
      // User input, and no data was generated just now, use the fallback.
      if (!lookupNameData.lookupName && lookupName) {
        lookupNameData.lookupName = lookupName;
      }
      
      const data = {
        dir, ext, folderSelected, idOverride, lookupName, name,
        newName: undefined,
        selected: selectAll,
        ...lookupNameData,
      };
      const previewItem = App.getPreviewItem(ndx, previewItems);
      
      if (previewItem) {
        data.cacheKey = previewItem.cacheKey;
        data.episodeNdxs = previewItem.episodeNdxs;
        data.epThumb = previewItem.epThumb;
        data.error = previewItem.error;
        data.id = previewItem.id;
        data.newName = previewItem.name;
        data.seasonNumber = previewItem.seasonNumber;
        data.seasonOrder = previewItem.seasonOrder;
        data.seriesURL = previewItem.seriesURL;
        
        if (!useGlobalToggle && !data.error) data.selected = true;
      }
      
      if (
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
      ) {
        data.selected = false;
        transformed.allSelected = false;
        
        // if there's no previewItem and no error, the user most likely skipped
        // an item before any previews have occurred (since there's no previously
        // saved error state for the item).
        if (!data.error) {
          data.skipped = true;
        }
      }
      
      if (data.selected) transformed.selectionCount++;
      
      if (folderSelected === undefined) data.folderSelected = true;
      
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
      dvdPreviewRequested: false,
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
      renameStatusLogs: [],
      searchAndReplaceFiles: [],
      selectAll: true,
      selectionCount: 0,
      showAssignId: false,
      showConfig: false,
      showDeleteConfirmation: false,
      showReplace: false,
      showVersion: false,
      useGlobalToggle: true,
      visible: false,
    };
    
    this.comps = {};
    this.modalCloseFuncs = {};
    
    this.logEndRef = React.createRef();
    
    this.createModalCloseHandler = this.createModalCloseHandler.bind(this);
    this.handleAllFoldersClick = this.handleAllFoldersClick.bind(this);
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
    this.handleOpenConfig = this.handleOpenConfig.bind(this);
    this.handlePreviewRename = this.handlePreviewRename.bind(this);
    this.handleRename = this.handleRename.bind(this);
    this.handleReplaceClick = this.handleReplaceClick.bind(this);
    this.handleVersionClick = this.handleVersionClick.bind(this);
  }
  
  componentDidMount() {
    this.createModalCloseHandler('showAssignId');
    this.createModalCloseHandler('showConfig');
    this.createModalCloseHandler('showDeleteConfirmation');
    this.createModalCloseHandler('showVersion');
    this.createModalCloseHandler('showReplace');
    
    this.checkCredentials()
      .then(() => {
        this.setState({ visible: true });
      })
      .catch((err) => { console.log(err); });
    
    // TODO - maybe re-enable this. For now, just displaying the logs from the
    // current renaming operation.
    // this.checkLogs();
  }
  
  connectToSocket() {
    return new Promise((resolve, reject) => {
      const WS_URL = location.origin.replace(/^http(s)?/, 'ws$1');
      const socket = new WebSocket(WS_URL);
      const socketAPI = {
        connected: false,
        disconnect() {
          socket.close();
        },
        emit(type, data = {}) {
          socket.send(JSON.stringify({ data, type }));
        },
        listeners: {},
        off(type, cb) {
          for (let i = socketAPI.listeners[type].length - 1; i >= 0; i--) {
            const handler = socketAPI.listeners[type][i];
            if (handler === cb) {
              socketAPI.listeners[type].splice(i, 1);
            }
          }
        },
        on(type, cb) {
          if (!socketAPI.listeners[type]) socketAPI.listeners[type] = [];
          socketAPI.listeners[type].push(cb);
        },
      };

      socket.onopen = function onWSOpen() {
        socket.onmessage = function onWSMsg({ data: msgData }) {
          const { data, type } = JSON.parse(msgData);
          
          // console.log(`Message from Server: "${ type }"`, data);
          
          if (socketAPI.listeners[type]) {
            socketAPI.listeners[type].forEach(cb => { cb(data); });
          }
        };
        
        console.log('Client Socket connected to Server');

        socketAPI.connected = true;
        resolve(socketAPI);
      };

      socket.onerror = function onWSError(ev) {
        let err = 'An unknown error has occurred with your WebSocket';

        if (
          !socketAPI.connected
          && ev.currentTarget.readyState === WebSocket.CLOSED
        ) err = `WebSocket error, could not connect to ${ WS_URL }`;
        
        reject(err);
      };
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (this.state.config) {
      // user just configured settings, so make initial files list call
      if (
        prevState.config
        && !prevState.config.tmdbAPIKey
        && this.state.config
        && this.state.config.tmdbAPIKey
      ) {
        this.getFilesList();
      }
    }
    
    if (this.logEndRef.current && prevState.logs.length !== this.state.logs.length) {
      const el = this.logEndRef.current;
      const elParent = el.parentNode;
      // If scroll is zero (first load), set to end of pane. else, scroll smoothly
      if (elParent.scrollTop === 0) {
        // TODO - maybe have it scroll to the first error (if there is one)
        elParent.scrollTo(0, elParent.scrollHeight);
      }
      else el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  buildPreviewData(itemEl, { nameOverride } = {}) {
    const name = itemEl.innerText.replace(/\n/g, '');
    const itemData = itemEl.dataset;
    const matches = name.match(NAME_REGEX);
    const epMatches = name
      // remove any tokens within square brackets
      .replace(/\[[\w\d]+\]/g, '')
      // extract all episode data
      .match(MULTI_EPS_REGEX) || [];
    const episodes = [];
    const nameData = {
      id: +itemData.id,
      index: itemData.index,
      name,
      nameWithYear: name,
    };
    
    epMatches.forEach((ep) => {
      const _ep = ep.match(new RegExp(MULTI_EPS_REGEX.source, 'i'));
      if (_ep) episodes.push(+_ep[1]);
    });
    
    if (isNaN(nameData.id)) delete nameData.id;
    
    if (matches) {
      if (nameOverride) {
        const overrideMatches = nameOverride.match(SERIES_NAME_REGEX);
        matches[1] = overrideMatches[1] || matches[1];
        matches[2] = overrideMatches[2] || matches[2];
      }
      
      const lookupName = matches[1] && App.parseLookupName(matches[1], matches[2]);
      
      return {
        ...nameData,
        ...lookupName,
        episode: matches[4] && +matches[4],
        episodes: episodes,
        season: matches[3] && +matches[3],
        year: matches[2],
      };
    }
    
    return nameData;
  }
  
  checkCredentials() {
    const state = { loaded: true };
    
    return fetch(API__CONFIG)
      .then((config) => new Promise((resolve) => {
        if (Object.keys(config).length) state.config = config;
        else state.showConfig = true;
        
        this.setState(state, () => {
          if (!state.showConfig) {
            Promise.all([
              this.getIDs(), 
              this.getFilesList(),
            ])
              .then(() => {
                resolve();
              });
          }
          else resolve();
        });
      }))
      .catch((err) => {
        console.error(err);
        alert(err);
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
  
  handleAllFoldersClick(ev) {
    const { files: _files } = this.state;
    let allFoldersSelected = true;
    
    for (let i=0; i<_files.length; i++) {
      if (!_files[i].folderSelected) {
        allFoldersSelected = false;
        break;
      }
    }
    
    const files = _files.map((file, ndx) => {
      return { ...file, folderSelected: !allFoldersSelected };
    });
    
    this.setState({ files });
  }
  
  handleAssignIdSuccess({ assignedName, id, idMappings, index, originalId }) {
    const { lookupName } = this.state.files[index];
    const newlyAssigned = this.state.files
      .reduce((arr, { id: _id, lookupName: _lookupName }, ndx) => {
        if (
          _lookupName === lookupName
          && (
            (
              // A best-guess id is assigned on Preview, so that can be used if a User
              // confirmed the id. If a new id was assigned, map against the old 
              // best-guess id and the newly assigned one.
              (id === originalId && _id === id)
              || _id === originalId
            )
            || (
              // In scenarios where nothing could be determined, but a User has assigned an ID
              id !== undefined
              && originalId === 0
            )
          )
        ) {
          const el = document.querySelector(`.${ RENAMABLE_ROOT_CLASS }__name .${ RENAMABLE_ROOT_CLASS }__ce-fix[data-index="${ ndx }"]`);
          const overrides = {};
          
          if (assignedName) {
            overrides.nameOverride = assignedName;
          }
          
          const itemData = this.buildPreviewData(el, overrides);
          itemData.id = id;
          
          arr.push(itemData);
        }
        
        return arr;
      }, []);
    
    // Request new preview for files with matching id
    this.setState({
      idMappings: App.transformIdMappings(idMappings),
    }, () => {
      this.previewRename(newlyAssigned, () => {
        this.setState({ showAssignId: false });
      });
    });
  }
  
  handleCacheUpdateClick({ id, index, lookupName }) {
    const el = document.querySelector(`.${ RENAMABLE_ROOT_CLASS }__name .${ RENAMABLE_ROOT_CLASS }__ce-fix[data-index="${ index }"]`);
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
    if (_previewItems.length) _previewItems.splice(index, 1);
    
    for (let i=0; i<_files.length; i++) {
      const currFile = _files[i];
      
      updatedFiles.push({
        ...currFile,
        index: updatedFiles.length,
      });
      
      if (_previewItems.length) {
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
      if (ndx === index) _file = { ...file, folderSelected };
      return _file;
    });
    
    this.setState({ files });
  }
  
  handleFileSelectChange({ index, selected }) {
    let allSelected = true;
    let selectionCount = 0;
    const files = this.state.files.map((file, ndx) => {
      let _file = file;
      
      if (ndx === index) _file = { ...file, selected };
      if (!_file.selected) allSelected = false;
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
  
  createModalCloseHandler(stateProp) {
    if (!this.modalCloseFuncs[stateProp]) this.modalCloseFuncs[stateProp] = () => {
      this.setState({ [stateProp]: false });
    };
  }
  
  handlePreviewRename(ev) {
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }.is--selected .${ RENAMABLE_ROOT_CLASS }__name .${ RENAMABLE_ROOT_CLASS }__ce-fix`);
    const names = [...items].map(this.buildPreviewData);
    const useDVDOrder = ev.currentTarget.getAttribute('for').includes('dvd');
    
    if (useDVDOrder) {
      names.forEach((data, ndx) => {
        names[ndx].useDVDOrder = true;
      });
    }
    
    this.previewRename(names, undefined, useDVDOrder);
  }
  
  handleOpenConfig() {
    this.setState({ showConfig: true });
  }
  
  async handleRename() {
    const { files, previewItems } = this.state;
    const items = document.querySelectorAll(`.${ RENAMABLE_ROOT_CLASS }.is--selected .${ RENAMABLE_ROOT_CLASS }__new-name`);
    const names = [...items].map((itemEl) => {
      const itemData = itemEl.dataset;
      const index = itemData.index;
      
      return {
        cacheKey: itemData.cacheKey,
        episodeNdxs: itemData.episodeNdxs.split('|'),
        index,
        moveToFolder: (files[index].folderSelected)
          ? previewItems[index].seriesName
          : undefined,
        newName: itemData.newName,
        oldPath: itemData.oldPath,
        seasonNumber: itemData.seasonNumber,
        seasonOrder: itemData.seasonOrder,
      };
    });
    
    // show indicator
    this.setState({ renameRequested: true });
    
    let socketAPI;
    try {
      let logNdx = 1;
      socketAPI = await this.connectToSocket();
      socketAPI.on(WS__MSG_TYPE__RENAME_STATUS, (data) => {
        this.setState({ renameStatusLogs: [`[${ pad(logNdx, '000') }] ${ data.log }`, ...this.state.renameStatusLogs] });
        logNdx++;
      });
    }
    catch (err) { console.log(err); }
    
    fetch(API__RENAME, {
      method: 'POST',
      body: JSON.stringify({ names }),
    })
      .then((logs) => {  
        if (socketAPI) socketAPI.disconnect();
        
        // remove renamed items from lists
        const updatedFiles = [];
        const updatedPreviewItems = [];
        let errors = 0;
        let successful = 0;
        let allSelected = true;
        let selectionCount = 0;
        
        for (let i=0; i<files.length; i++) {
          const log = logs[i];
        
          if (!log || log && log.error) {
            const currFile = files[i];
            
            updatedFiles.push({
              ...currFile,
              index: updatedFiles.length,
            });
            updatedPreviewItems.push({
              ...previewItems[i],
              index: updatedPreviewItems.length,
            });
            
            if (currFile.selected) selectionCount++;
            if (!currFile.selected) allSelected = false;
            
            if (log && log.error) {
              console.error(log.error);
              errors++;
            }  
          }
          else successful++;
        }
        
        this.setState({
          allSelected,
          files: updatedFiles,
          logs: [
            // ...this.state.logs, // TODO - maybe uncomment to append to all logs
            ...Object.keys(logs).map((key) => logs[key]),
          ],
          logsOpen: true,
          previewItems: updatedPreviewItems,
          renameCount: successful,
          renameErrorCount: errors,
          renameRequested: false,
          renameStatusLogs: [],
          selectAll: !!selectionCount,
          selectionCount,
        });
      })
      .catch((err) => {
        this.resetIndicatorOnError();
        alert(err);
      });
  }
  
  handleReplaceClick() {
    const { files } = this.state;
    const newState = {
      searchAndReplaceFiles: files.filter(({ selected }) => selected),
      showReplace: true,
    };
    
    if (this.comps.Replace) this.setState(newState);
    else {
      import(
        /* webpackChunkName: "Replace" */
        'COMPONENTS/Replace'
      )
        .then(({ default: Replace }) => {
          this.comps.Replace = Replace;
          this.setState(newState);
        })
        .catch(error => 'An error occurred while loading the component');
    }
  }
  
  handleVersionClick() {
    this.setState({ showVersion: true });
  }
  
  resetIndicatorOnError() {
    window.clearTimeout(this.previewRequestTimer);
    const newState = {};
    
    if (this.state.dvdPreviewRequested) newState.dvdPreviewRequested = false;
    else if (this.state.previewRequested) newState.previewRequested = false;
    else if (this.state.renameRequested) newState.renameRequested = false;
    
    if (Object.keys(newState).length) this.setState(newState);
  }
  
  previewRename(names, cb, useDVDOrder) {
    // show indicator if request is taking too long
    this.previewRequestTimer = setTimeout(() => {
      delete this.previewRequestTimer;
      this.setState({
        dvdPreviewRequested: useDVDOrder,
        previewRequested: !useDVDOrder,
      });
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
        
        if (previousItems) {
          previousItems.forEach((item) => {
            const ndx = +item.index;
            if (!_previewItems[ndx]) _previewItems[ndx] = item;
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
          dvdPreviewRequested: false,
          files: transformedItems.files,
          previewing,
          previewItems: _previewItems,
          previewRequested: false,
          selectAll: !!transformedItems.selectionCount,
          selectionCount: transformedItems.selectionCount,
          useGlobalToggle,
        }, () => {
          if (cb) cb(_previewItems);
        });
      })
      .catch((err) => {
        this.resetIndicatorOnError();
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
      deletionIndex,
      deletionPath,
      dvdPreviewRequested,
      files,
      loaded,
      logs,
      logsOpen,
      previewing,
      previewRequested,
      renameCount,
      renameErrorCount,
      renameRequested,
      renameStatusLogs,
      searchAndReplaceFiles,
      selectAll,
      selectionCount,
      showAssignId,
      showConfig,
      showDeleteConfirmation,
      showReplace,
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
      onClose: this.modalCloseFuncs.showDeleteConfirmation,
      onDeleteSuccess: this.handleFileDeletion,
    };
    const versionProps = {
      onClose: this.modalCloseFuncs.showVersion,
    };
    const replaceProps = {
      files: searchAndReplaceFiles,
      onCancel: this.modalCloseFuncs.showReplace,
    };
    let configProps = {
      onClose: this.modalCloseFuncs.showConfig,
      onSaveComplete: this.handleConfigSave,
    };
    let rootModifier = '';
    
    if (!loaded) return null;
    
    if (config) configProps = { ...configProps, ...config };
    else if (showConfig) {
      configProps.hideCloseBtn = true;
      delete configProps.onClose;
    }
    
    if (
      // previewing at least one item that is selected
      previewing && selectionCount
      // and none of the selected items have errors or were skipped
      && !files.filter(App.renamableFilter).length
    ) rootModifier += ` ${ MODIFIER__RENAME }`;
    
    if (logs.length) {
      rootModifier += ` ${ MODIFIER__LOGS }`;
      
      if (logsOpen) rootModifier += ` ${ MODIFIER__LOGS_OPEN }`;
    }
    
    if (visible) rootModifier += ` ${ MODIFIER__VISIBLE }`;
    
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
                  disabled={!previewing}
                  onClick={this.handleAllFoldersClick}
                  htmlFor="folders"
                >
                  <SVG icon={ICON__FOLDER} />
                </button>
                <button
                  disabled={selectionCount === 0}
                  onClick={this.handleReplaceClick}
                  htmlFor="replace"
                >
                  Replace
                </button>
                <button
                  className={`${ (dvdPreviewRequested) ? MODIFIER__INDICATOR : '' }`}
                  disabled={selectionCount === 0}
                  onClick={this.handlePreviewRename}
                  htmlFor="dvdPreview"
                >
                  DVD Preview
                  <Indicator visible={dvdPreviewRequested} />
                </button>
                <button
                  className={`${ (previewRequested) ? MODIFIER__INDICATOR : '' }`}
                  disabled={selectionCount === 0}
                  onClick={this.handlePreviewRename}
                  htmlFor="preview"
                >
                  Preview
                  <Indicator visible={previewRequested} />
                </button>
                <button
                  className={`${ (renameRequested) ? MODIFIER__INDICATOR : '' }`}
                  disabled={!previewing}
                  onClick={this.handleRename}
                  htmlFor="rename"
                >
                  Rename {btnPronoun}
                  <Indicator visible={renameRequested} />
                </button>
              </div>
            </nav>
            {!!renameStatusLogs.length && (
              <div className={`${ ROOT_CLASS }__rename-status-logs`}>
                {renameStatusLogs.join('\n')}
              </div>
            )}
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
          onMaskClick={this.modalCloseFuncs.showAssignId}
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
        
        {!!this.comps.Replace && (
          <Modal
            onMaskClick={replaceProps.onCancel}
            visible={showReplace}
          >
            <this.comps.Replace {...replaceProps} />
          </Modal>
        )}
      </div>
    );
  }
}

export default App;