import React, { Component, Fragment } from 'react';
import { bool, oneOfType, shape, string } from 'prop-types';
import Toggle from 'COMPONENTS/Toggle';
import styles, {
  MODIFIER__EDITING_NAME,
  MODIFIER__PREVIEWING,
  MODIFIER__SELECTED,
  MODIFIER__WARNING,
  ROOT_CLASS,
} from './styles';

class Renamable extends Component {
  constructor() {
    super();
    
    this.state = {
      editingName: false,
      selected: true,
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);
    this.handleNameFocus = this.handleNameFocus.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
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
  
  handleToggle() {
    this.setState({ selected: !this.state.selected });
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
      selected,
    } = this.state;
    const slug = name.toLowerCase().replace(/[.'\s]/gi, '');
    let rootModifier = '';
    let newNameModifier = '';
    let _newName = (typeof newName === 'string')
      ? `${ newName }${ ext }`
      : '';
    
    if(editingName) rootModifier = MODIFIER__EDITING_NAME;
    if(previewing) rootModifier += ` ${ MODIFIER__PREVIEWING }`;
    if(selected) rootModifier += ` ${ MODIFIER__SELECTED }`;
    
    if(previewing && typeof newName !== 'string'){
      _newName = (
        <Fragment>
          <span>No Exact Match Found</span>
          {(typeof newName === 'object' && newName !== null) && (
            <Fragment>
              &nbsp;-&nbsp;
              <span>{newName.error}.</span>
              {(newName.searchURL || newName.seriesURL) && (
                <div>
                  {newName.searchURL && (
                    <a
                      href={newName.searchURL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >View Search</a>
                  )}
                  {newName.seriesURL && (
                    <a
                      href={newName.seriesURL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >View Series</a>
                  )}
                </div>
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
        <Toggle id={slug} onToggle={this.handleToggle} toggled={selected} />
        <div className={`${ ROOT_CLASS }__name`}>
          <span
            contentEditable={selected}
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