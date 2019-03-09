import React, { Component } from 'react';
import { func, string } from 'prop-types';
import {
  API__FOLDER_LIST,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__NOT_READABLE,
  MODIFIER__NOT_WRITABLE,
  ROOT_CLASS,
} from './styles';

class FolderDisplay extends Component {
  constructor({ current }) {
    super();
    
    this.state = {
      current,
      folders: [],
      separator: '/',
    };
    
    this.handleClose = this.handleClose.bind(this);
    this.handleFolderClick = this.handleFolderClick.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
  }
  
  componentDidMount() {
    this.getFolders(this.state.current);
  }
  
  getFolders(path) {
    const queryParam = (path) ? `?path=${ encodeURIComponent(path) }` : '';
    fetch(`${ API__FOLDER_LIST }${ queryParam }`)
      .then((resp) => {
        this.setState(resp);
      })
      .catch((err) => {
        alert(err);
      });
  }
  
  handleClose(selectedFolder) {
    this.props.onClose(selectedFolder);
  }
  
  handleFolderClick(ev) {
    const path = ev.currentTarget.dataset.path;
    this.getFolders(path);
  }
  
  handleFolderSelect(ev) {
    this.props.onSelect(ev.currentTarget.dataset.path);
  }
  
  render() {
    const {
      current,
      folders,
      separator,
    } = this.state;
    const pathItems = (current === separator)
      ? [''] // when root is `/` it splits to ['', '']
      : current.split(separator);
    let breadcrumbPath = [];
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles }`}>
        <div className={`${ ROOT_CLASS }__body`}>
          <div className={`${ ROOT_CLASS }__breadcrumbs`}>
            {pathItems.map((folder, ndx) => {
              breadcrumbPath.push(folder);
              
              return (
                <button
                  key={`${ folder }_${ ndx }`}
                  className={`${ ROOT_CLASS }__breadcrumb-btn`}
                  data-path={breadcrumbPath.join(separator) || separator}
                  onClick={this.handleFolderClick}
                >{folder || separator}</button>
              );
            })}
          </div>
          <div className={`${ ROOT_CLASS }__folders`}>
            {folders.map(({ name, path, readable, writable }, ndx) => {
              const btnModifier = (!readable) ? MODIFIER__NOT_READABLE : '';
              const selectModifier = (!writable) ? MODIFIER__NOT_WRITABLE : '';
              
              return (
                <div
                  key={name}
                  className={`${ ROOT_CLASS }__folder`}
                >
                  <button
                    className={`${ ROOT_CLASS }__folder-btn ${ btnModifier }`}
                    data-path={path}
                    disabled={!readable}
                    onClick={this.handleFolderClick}
                  >{name}</button>
                  <button
                    className={`${ ROOT_CLASS }__folder-select-btn ${ selectModifier }`}
                    data-path={path}
                    disabled={!writable}
                    onClick={this.handleFolderSelect}
                  >Choose</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

FolderDisplay.defaultProps = {
  current: '',
};
FolderDisplay.propTypes = {
  current: string,
  onClose: func,
  onSelect: func,
};

export default FolderDisplay;