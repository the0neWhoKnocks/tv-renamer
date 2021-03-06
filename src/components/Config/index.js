import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import ConfigItem, {
  ROOT_CLASS as ITEM_ROOT_CLASS,
} from './components/ConfigItem';
import FolderPicker from './components/FolderPicker';
import {
  API__CONFIG_SAVE,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  ROOT_CLASS,
} from './styles';

const IS_FIREFOX = window.navigator.userAgent.includes('Firefox/');
const READ_ONLY = (IS_FIREFOX) ? '-moz-read-only' : 'read-only';

class Config extends Component {
  constructor() {
    super();
    
    this.state = {
      closeDisabled: false,
      saveDisabled: true,
    };
    
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }
  
  componentDidMount() {
    this.handleValueChange();
  }
  
  handleCloseClick() {
    this.props.onClose();
  }
  
  handleSaveClick() {
    const { onSaveComplete } = this.props;
    const data = {};
    [...this.configRef.querySelectorAll(`.${ ITEM_ROOT_CLASS } input:not(:${ READ_ONLY })`)]
      .forEach(({ name, value }) => {
        data[name] = value;
      });
    
    fetch(API__CONFIG_SAVE, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
      .then((resp) => {
        onSaveComplete(resp);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  handleValueChange() {
    const {
      closeDisabled,
      saveDisabled,
    } = this.state;
    const inputs = this.configRef.querySelectorAll(`.${ ITEM_ROOT_CLASS } input:not(:${ READ_ONLY })`);
    const state = {};
    let enableSave = false;
    let missingRequired = false;
    
    // Check all editiable items to see if their values are different than
    // what was passed in.
    for (let i=0; i<inputs.length; i++) {
      const { name, required, value } = inputs[i];
      const inputProp = this.props[name];
      const parsedValue = value.trim();
      
      // missing required items
      if ( required && parsedValue === '' ) missingRequired = true;
      if (
        // the previously set value has changed
        ( inputProp && inputProp !== parsedValue )
        // OR - there was no initial value on load, but the user has entered one
        || ( !inputProp && parsedValue !== '' )
      ) enableSave = true;
    }
    
    // disable Save if required items are missing
    if ( missingRequired ) enableSave = false;
    
    // turn Save on
    if ( saveDisabled && enableSave ) state.saveDisabled = false;
    // turn Save off
    else if ( !saveDisabled && !enableSave ) state.saveDisabled = true;
    
    // turn Close off
    if ( !closeDisabled && missingRequired ) state.closeDisabled = true;
    // turn Close on
    else if ( closeDisabled && !missingRequired ) state.closeDisabled = false;
    
    if ( Object.keys(state).length ) this.setState(state);
  }
  
  render() {
    const {
      fanarttvAPIKey,
      hideCloseBtn,
      outputFolder,
      sourceFolder,
      tmdbAPIKey,
    } = this.props;
    const {
      closeDisabled,
      saveDisabled,
    } = this.state;
    
    return (
      <div
        className={`${ ROOT_CLASS } ${ styles }`}
        ref={(ref) => { this.configRef = ref; }}
      >
        <div className={`${ ROOT_CLASS }__body`}>
          <section>
            <h2>theMovieDB</h2>
            {!tmdbAPIKey && (
              <div className={`${ ROOT_CLASS }__msg is--error`}>
                No credentials for TMDB have been found. You&apos;ll need to
                obtain the below info from your TMDB account.
              </div>
            )}
            <ConfigItem
              label="API Key"
              name="tmdbAPIKey"
              onChange={this.handleValueChange}
              required
              value={tmdbAPIKey}
            />
          </section>
          <section>
            <h2>fanart.tv</h2>
            {!fanarttvAPIKey && (
              <div className={`${ ROOT_CLASS }__msg is--error`}>
                No credentials for fannart.tv have been found. You&apos;ll need to
                obtain the below info from your fannart.tv account.
              </div>
            )}
            <ConfigItem
              label="API Key"
              name="fanarttvAPIKey"
              onChange={this.handleValueChange}
              required
              value={fanarttvAPIKey}
            />
          </section>
          <section>
            <h2>Folders</h2>
            <FolderPicker
              label="Source"
              name="sourceFolder"
              onChange={this.handleValueChange}
              required
              value={sourceFolder}
            />
            <FolderPicker
              label="Output"
              name="outputFolder"
              onChange={this.handleValueChange}
              required
              value={outputFolder}
            />
          </section>
          <nav className={`${ ROOT_CLASS }__btm-nav`}>
            {!hideCloseBtn && (
              <button
                className={`${ ROOT_CLASS }__close-btn`}
                onClick={this.handleCloseClick}
                disabled={closeDisabled}
              >Close</button>
            )}
            <button
              className={`${ ROOT_CLASS }__save-btn`}
              onClick={this.handleSaveClick}
              disabled={saveDisabled}
            >Save</button>
          </nav>
        </div>
      </div>
    );
  }
}

Config.propTypes = {
  fanarttvAPIKey: string,
  hideCloseBtn: bool,
  onClose: func,
  onSaveComplete: func,
  outputFolder: string,
  sourceFolder: string,
  tmdbAPIKey: string,
};

export default Config;