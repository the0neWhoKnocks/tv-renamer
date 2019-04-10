import React, { Component, Fragment } from 'react';
import { bool, func, number, string } from 'prop-types';
import SVG, {
  ICON__DELETE,
  ICON__FOLDER,
  ICON__REFRESH,
} from 'COMPONENTS/SVG';
import Toggle from 'COMPONENTS/Toggle';
import styles, {
  MODIFIER__EDITING_NAME,
  MODIFIER__PREVIEWING,
  MODIFIER__REFRESH,
  MODIFIER__SELECTED,
  MODIFIER__SKIPPED,
  MODIFIER__TOGGLE,
  MODIFIER__WARNING,
  ROOT_CLASS,
} from './styles';

class Renamable extends Component {
  constructor({
    folderSelected,
    selected,
  }) {
    super();
    
    this.state = {
      editingName: false,
      folderSelected,
      selected,
    };
    
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleFolderToggle = this.handleFolderToggle.bind(this);
    this.handleIdClick = this.handleIdClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleNameFocus = this.handleNameFocus.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { folderSelected, selected } = this.props;
    
    // ensure `selected` passed from parent takes priority
    if(
      selected !== prevProps.selected
      && this.state.selected !== selected
    ){
      this.setState({ selected });
    }
    if(
      folderSelected !== prevProps.folderSelected
      && this.state.folderSelected !== folderSelected
    ){
      this.setState({ folderSelected });
    }
  }
  
  handleDeleteClick(ev) {
    const { itemIndex, onDeleteClick } = this.props;
    
    onDeleteClick({
      filePath: ev.currentTarget.value,
      index: itemIndex,
    });
  }
  
  handleFolderToggle() {
    const { itemIndex, onFolderSelectChange } = this.props;
    
    onFolderSelectChange({
      folderSelected: !this.state.folderSelected,
      index: itemIndex,
    });
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
  
  handleUpdateClick(ev) {
    const {
      itemIndex,
      lookupName,
      onUpdateClick,
    } = this.props;
    
    onUpdateClick({
      id: +ev.currentTarget.value,
      index: itemIndex,
      lookupName,
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
      skipped,
    } = this.props;
    const {
      editingName,
      folderSelected,
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
    
    if(skipped){
      _newName = <span>Skipped</span>;
      newNameModifier = MODIFIER__SKIPPED;
    }
    
    return (
      <div
        className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}
        onKeyDown={this.handleKeyDown}
      >
        <Toggle 
          id={slug}
          className={`${ ROOT_CLASS }__item-toggle`}
          onToggle={this.handleToggle} 
          toggled={selected}
        />
        <div className={`${ ROOT_CLASS }__names`}>
          <div
            className={`${ ROOT_CLASS }__name`}
            data-index={itemIndex}
            data-id={idOverride}
          >
            {/*
              NOTE - Reasoning behind this layout https://stackoverflow.com/a/34445203/5156659.
              Basically I'm creating an "editable" mask, so that when webkit
              browsers detect an editable child, they select an empty invisible
              element. This layout is required to maintain the overlow ellipsis
              formatting for long names.
            */}
            <div className={`${ ROOT_CLASS }__ce-fix`}>
              <span
                contentEditable={selected}
                onBlur={this.handleNameBlur}
                onClick={this.handleNameClick}
                onFocus={this.handleNameFocus}
                ref={(ref) => { this.editableRef = ref; }}
                spellCheck="false"
                suppressContentEditableWarning
              >{name}</span>
              <span className={`${ ROOT_CLASS }__ce-fix-mask`} contentEditable suppressContentEditableWarning></span>
            </div>
            <span>{ext}</span>
            
            <button
              className={`${ ROOT_CLASS }__delete-btn`}
              onClick={this.handleDeleteClick}
              value={`${ path }/${ name }${ ext }`}
            >
              <SVG className={`${ ROOT_CLASS }__btn-icon`} icon={ICON__DELETE} />
            </button>
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
                  <nav className={`${ ROOT_CLASS }__nav`}>
                    <img src="/imgs/logo-tvdb.png" />
                    <button
                      className={`${ ROOT_CLASS }__nav-item`}
                      onClick={this.handleIdClick}
                      value={id}
                    >{id}</button>
                    {seriesURL && (
                      <a
                        className={`${ ROOT_CLASS }__nav-item`}
                        href={seriesURL}
                        rel="noopener noreferrer"
                        target="_blank"
                      >View Series</a>
                    )}
                    <button
                      className={`${ ROOT_CLASS }__nav-item ${ MODIFIER__REFRESH }`}
                      onClick={this.handleUpdateClick}
                      value={id}
                    >
                      <SVG className={`${ ROOT_CLASS }__btn-icon`} icon={ICON__REFRESH} />
                      Cache
                    </button>
                    <Toggle
                      id={`${ slug }_toggle`}
                      className={`${ ROOT_CLASS }__nav-item ${ MODIFIER__TOGGLE }`}
                      onToggle={this.handleFolderToggle}
                      toggled={folderSelected}
                    >  
                      <SVG className={`${ ROOT_CLASS }__btn-icon`} icon={ICON__FOLDER} />
                    </Toggle>
                  </nav>
                )}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

Renamable.propTypes = {
  error: string,
  ext: string,
  folderSelected: bool,
  id: number,
  idOverride: number,
  itemIndex: number,
  lookupName: string,
  name: string,
  newName: string,
  onIdClick: func,
  onDeleteClick: func,
  onFolderSelectChange: func,
  onLookupNameChange: func,
  onSelectChange: func,
  onUpdateClick: func,
  path: string,
  previewing: bool,
  searchURL: string,
  selected: bool,
  seriesURL: string,
  skipped: bool,
};

export default Renamable;
export {
  ROOT_CLASS,
};