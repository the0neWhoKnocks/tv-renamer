import React, { Component } from 'react';
import { string } from 'prop-types';
import styles, {
  MODIFIER__EDITING_NAME,
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
    } = this.props;
    const {
      editingName,
    } = this.state;
    const rootModifier = (editingName) ? MODIFIER__EDITING_NAME : '';
    
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
          {newName && (
            <div className={`${ ROOT_CLASS }__new-name`}>{newName}{ext}</div>
          )}
        </div>
      </div>
    );
  }
}

Renamable.propTypes = {
  ext: string,
  name: string,
  newName: string,
  path: string,
};

export default Renamable;
export {
  ROOT_CLASS,
};