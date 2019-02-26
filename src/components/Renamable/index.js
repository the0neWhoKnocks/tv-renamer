import React, { Component, Fragment } from 'react';
import { bool, oneOfType, shape, string } from 'prop-types';
import styles, {
  MODIFIER__EDITING_NAME,
  MODIFIER__PREVIEWING,
  MODIFIER__WARNING,
  ROOT_CLASS,
} from './styles';

class Renamable extends Component {
  constructor() {
    super();
    
    this.state = {
      editingName: false,
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);
    this.handleNameFocus = this.handleNameFocus.bind(this);
  }
  
  handleKeyDown(ev) {
    switch(ev.which){
      case 13: // ENTER
        ev.preventDefault();
        window.getSelection().removeAllRanges();
        ev.target.blur();
        break;
    }
  }
  
  handleNameBlur() {
    this.setState({ editingName: false });
  }
  
  handleNameFocus() {
    this.setState({ editingName: true });
  }
  
  render() {
    const {
      ext,
      name,
      newName,
      path,
      previewing,
    } = this.props;
    const {
      editingName,
    } = this.state;
    let rootModifier = '';
    let newNameModifier = '';
    let _newName = (typeof newName === 'string')
      ? `${ newName }${ ext }`
      : '';
    
    if(editingName) rootModifier = MODIFIER__EDITING_NAME;
    if(previewing) rootModifier += ` ${ MODIFIER__PREVIEWING }`;
    
    if(previewing && typeof newName !== 'string'){
      _newName = (
        <Fragment>
          <span>No Match Found</span>
          {(typeof newName === 'object' && newName !== null) && (
            <Fragment>
              &nbsp;-&nbsp;
              <span>{newName.error}</span>
              {newName.searchURL && (
                <Fragment>
                  &nbsp;
                  <a href={newName.searchURL}>Search</a>
                </Fragment>
              )}
              {newName.seriesURL && (
                <Fragment>
                  &nbsp;
                  <a href={newName.seriesURL}>Series</a>
                </Fragment>
              )}
            </Fragment>
          )}
        </Fragment>
      );
      newNameModifier = MODIFIER__WARNING;
    }
    
    return (
      <div
        className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}
        data-path={path}
        onKeyDown={this.handleKeyDown}
      >
        <div className={`${ ROOT_CLASS }__name`}>
          <span
            contentEditable="true"
            onBlur={this.handleNameBlur}
            onFocus={this.handleNameFocus}
            spellCheck="false"
            suppressContentEditableWarning
          >{name}</span>
          <span>{ext}</span>
        </div>
        {previewing && (
          <div 
            className={`${ ROOT_CLASS }__new-name ${ newNameModifier }`}
          >{_newName}</div>
        )}
      </div>
    );
  }
}

Renamable.propTypes = {
  ext: string,
  name: string,
  newName: oneOfType([
    string,
    shape({
      
    }),
  ]),
  path: string,
  previewing: bool,
};

export default Renamable;
export {
  ROOT_CLASS,
};