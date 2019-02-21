import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { func, string } from 'prop-types';
import {
  API__FOLDER_LIST,
} from 'ROOT/conf.repo';
import fetch from 'UTILS/fetch';
import styles, { ROOT_CLASS } from './styles';

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
    this.getFolders();
  }
  
  getFolders(path) {
    const queryParam = (path) ? `?path=${ encodeURIComponent(path) }` : '';
    fetch(`${ API__FOLDER_LIST }${ queryParam }`)
      .then((resp) => {
        this.setState(resp);
      })
      .catch((err) => {
        console.error(err);
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
    const pathItems = current.split(separator);
    let breadcrumbPath = [];
    
    return createPortal(
      (
        <div className={`${ ROOT_CLASS } ${ styles }`}>
          <button
            className={`${ ROOT_CLASS }__mask`}
            onClick={this.handleClose}
          />
          <div className={`${ ROOT_CLASS }__body`}>
            <div className={`${ ROOT_CLASS }__breadcrumbs`}>
              {pathItems.map((folder, ndx) => {
                breadcrumbPath.push(folder);
                
                return (
                  <button
                    key={`${ folder }_${ ndx }`}
                    className={`${ ROOT_CLASS }__breadcrumb-btn`}
                    data-path={breadcrumbPath.join(separator)}
                    onClick={this.handleFolderClick}
                  >{folder || separator}</button>
                );
              })}
            </div>
            <div className={`${ ROOT_CLASS }__folders`}>
              {folders.map((folderPath, ndx) => {
                const path = `${ current }${ separator }${ folderPath }`;
                return (
                  <div
                    key={folderPath}
                    className={`${ ROOT_CLASS }__folder`}
                  >
                    <button
                      className={`${ ROOT_CLASS }__folder-btn`}
                      data-path={path}
                      onClick={this.handleFolderClick}
                    >{folderPath}</button>
                    <button
                      className={`${ ROOT_CLASS }__folder-select-btn`}
                      data-path={path}
                      onClick={this.handleFolderSelect}
                    >Ok</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
      document.querySelector('#portal'),
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