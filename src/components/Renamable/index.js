import React, { Component, Fragment } from 'react';
import { bool, func, number, oneOfType, string } from 'prop-types';
import SVG, {
  ICON__DELETE,
  ICON__FOLDER,
  ICON__REFRESH,
  ICON__THUMBNAIL,
  ICON__TMDB,
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
    this.handlePaste = this.handlePaste.bind(this);
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
    } = this.props;
    
    onIdClick({
      id: +ev.currentTarget.value,
      index: itemIndex,
      lookupName,
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
    
    // reset scroll position, or else you may be left with a bunch of white space
    ev.currentTarget.parentNode.scrollLeft = 0;
    
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
  
  handlePaste(ev) {
    ev.preventDefault();
    const text = ev.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
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
      cacheKey,
      episodeNdxs,
      epThumb,
      error,
      ext,
      id,
      idOverride,
      itemIndex,
      lookupName,
      name,
      newName,
      path,
      previewing,
      seasonNumber,
      seasonOrder,
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
    
    const RenamableNav = () => {
      const seriesID = id || '';
      const idBtnLabel = seriesID || 'Assign';
      
      if(!lookupName) return null;
      
      return (
        <nav className={`${ ROOT_CLASS }__nav`}>
          <SVG className={`${ ROOT_CLASS }__tmdb-icon`} icon={ICON__TMDB} />
          <button
            className={`${ ROOT_CLASS }__nav-item for--series-id`}
            onClick={this.handleIdClick}
            value={seriesID}
          >{idBtnLabel}</button>
          {seriesURL && (
            <a
              className={`${ ROOT_CLASS }__nav-item`}
              href={seriesURL}
              rel="noopener noreferrer"
              target="_blank"
            >View Series</a>
          )}
          {!!id && (
            <Fragment>
              <button
                className={`${ ROOT_CLASS }__nav-item ${ MODIFIER__REFRESH }`}
                onClick={this.handleUpdateClick}
                value={seriesID}
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
            </Fragment>
          )}
        </nav>
      );
    };
    
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
          <div className={`${ ROOT_CLASS }__name`}>
            {/*
              NOTE - Reasoning behind this layout https://stackoverflow.com/a/34445203/5156659.
              Basically I'm creating an "editable" mask, so that when webkit
              browsers detect an editable child, they select an empty invisible
              element. This layout is required to maintain the overlow ellipsis
              formatting for long names.
            */}
            <div
              className={`${ ROOT_CLASS }__ce-fix`}
              data-index={itemIndex}
              data-id={idOverride}
            >
              <span
                contentEditable={selected}
                onBlur={this.handleNameBlur}
                onClick={this.handleNameClick}
                onFocus={this.handleNameFocus}
                onPaste={this.handlePaste}
                ref={(ref) => { this.editableRef = ref; }}
                spellCheck="false"
                suppressContentEditableWarning
              >{name}</span>
              <span className={`${ ROOT_CLASS }__ce-fix-mask`} contentEditable suppressContentEditableWarning></span>
            </div>
          
            <span className={`${ ROOT_CLASS }__name-ext`}>{ext}</span>
            
            <button
              className={`${ ROOT_CLASS }__delete-btn`}
              title="Delete file"
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
                data-cache-key={cacheKey}
                data-episode-ndxs={episodeNdxs}
                data-index={itemIndex}
                data-new-name={`${ newName }${ ext }`}
                data-old-path={`${ path }/${ name }${ ext }`}
                data-season-number={seasonNumber}
                data-season-order={seasonOrder}
              >
                <div className={`${ ROOT_CLASS }__new-name-text ${ newNameModifier }`}>
                  {!!epThumb && (
                    <a href={epThumb} target="_blank" rel="noopener noreferrer">
                      <SVG className={`${ ROOT_CLASS }__new-name-thumbnail`} icon={ICON__THUMBNAIL} />
                    </a>
                  )}
                  {_newName}
                </div>
                <RenamableNav />
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

Renamable.propTypes = {
  cacheKey: string,
  episodeNdxs: string,
  epThumb: string,
  error: string,
  ext: string,
  folderSelected: bool,
  id: oneOfType([
    number,
    string,
  ]),
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
  seasonNumber: number,
  seasonOrder: string,
  selected: bool,
  seriesURL: string,
  skipped: bool,
};

export default Renamable;
export {
  ROOT_CLASS,
};