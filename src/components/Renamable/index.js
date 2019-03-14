import React, { Component, Fragment } from 'react';
import { bool, func, number, string } from 'prop-types';
import Toggle from 'COMPONENTS/Toggle';
import styles, {
  MODIFIER__EDITING_NAME,
  MODIFIER__PREVIEWING,
  MODIFIER__SELECTED,
  MODIFIER__WARNING,
  ROOT_CLASS,
} from './styles';

class Renamable extends Component {
  constructor({
    selected,
  }) {
    super();
    
    this.state = {
      editingName: false,
      selected,
    };
    
    this.handleIdClick = this.handleIdClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleNameFocus = this.handleNameFocus.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.props;
    
    // ensure `selected` passed from parent takes priority
    if(
      selected !== prevProps.selected
      && this.state.selected !== selected
    ){
      this.setState({ selected });
    }
  }
  
  handleNameClick(ev) {
    // Trigger an item selection, if unselected, and a user clicked in the
    // editable area. Theoretically they're updating the name to do another
    // search, so this should save a click.
    if(!this.state.selected){
      this.handleToggle();
      
      this.waitTimer = window.setInterval(() => {
        if(this.state.selected){
          clearInterval(this.waitTimer);
          this.handleNameFocus();
          this.editableRef.focus();
        }
      }, 20);
    }
  }
  
  handleIdClick(ev) {
    const {
      itemIndex,
      lookupName,
      onIdClick,
      searchURL,
    } = this.props;
    
    onIdClick({
      id: +ev.currentTarget.value,
      index: itemIndex,
      lookupName,
      searchURL,
    });
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
  
  handleNameBlur(ev) {
    const { itemIndex, onLookupNameChange } = this.props;
    const name = ev.currentTarget.innerText;
    
    this.setState({ editingName: false }, () => {
      onLookupNameChange({
        index: itemIndex,
        name,
      });
    });
  }
  
  handleNameFocus() {
    this.setState({ editingName: true });
  }
  
  handleToggle() {
    const { itemIndex, onSelectChange } = this.props;
    
    onSelectChange({
      index: itemIndex,
      selected: !this.state.selected,
    });
  }
  
  render() {
    const {
      error,
      ext,
      id,
      idOverride,
      itemIndex,
      name,
      newName,
      path,
      previewing,
      seriesURL,
    } = this.props;
    const {
      editingName,
      selected,
    } = this.state;
    const slug = name.toLowerCase().replace(/[.'\s]/gi, '');
    let rootModifier = '';
    let newNameModifier = '';
    let _newName = `${ newName }${ ext }`;
    
    if(editingName) rootModifier = MODIFIER__EDITING_NAME;
    if(previewing) rootModifier += ` ${ MODIFIER__PREVIEWING }`;
    if(selected) rootModifier += ` ${ MODIFIER__SELECTED }`;
    
    if(error){
      _newName = (
        <Fragment>
          <span>No Exact Match Found</span>
          &nbsp;-&nbsp;
          <span>{error}.</span>
        </Fragment>
      );
      newNameModifier = MODIFIER__WARNING;
    }
    
    return (
      <div
        className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}
        onKeyDown={this.handleKeyDown}
      >
        <Toggle id={slug} onToggle={this.handleToggle} toggled={selected} />
        <div
          className={`${ ROOT_CLASS }__name`}
          data-index={itemIndex}
          data-id={idOverride}
        >
          <span
            contentEditable={selected}
            onBlur={this.handleNameBlur}
            onClick={this.handleNameClick}
            onFocus={this.handleNameFocus}
            ref={(ref) => { this.editableRef = ref; }}
            spellCheck="false"
            suppressContentEditableWarning
          >{name}</span>
          <span>{ext}</span>
        </div>
        {previewing && (
          <Fragment>
            <div 
              className={`${ ROOT_CLASS }__new-name ${ newNameModifier }`}
              data-index={itemIndex}
              data-new-name={`${ newName }${ ext }`}
              data-old-path={`${ path }/${ name }${ ext }`}
            >
              {_newName}
              {id && (
                <nav className={`${ ROOT_CLASS }__tvdb-nav`}>
                  <img src="/imgs/logo-tvdb.png" />
                  <button
                    className={`${ ROOT_CLASS }__tvdb-nav-item`}
                    onClick={this.handleIdClick}
                    value={id}
                  >{id}</button>
                  {seriesURL && (
                    <a
                      className={`${ ROOT_CLASS }__tvdb-nav-item`}
                      href={seriesURL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >View Series</a>
                  )}
                </nav>
              )}
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

Renamable.propTypes = {
  error: string,
  ext: string,
  id: number,
  idOverride: number,
  itemIndex: number,
  lookupName: string,
  name: string,
  newName: string,
  onIdClick: func,
  onLookupNameChange: func,
  onSelectChange: func,
  path: string,
  previewing: bool,
  searchURL: string,
  selected: bool,
  seriesURL: string,
};

export default Renamable;
export {
  ROOT_CLASS,
};