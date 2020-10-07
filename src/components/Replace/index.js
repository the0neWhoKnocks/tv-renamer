import React, { Component } from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import { API__REPLACE } from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, { ROOT_CLASS } from './styles';

class Replace extends Component {
  static LabeledInput({ label, onInput }) {
    return (
      <div className={`${ ROOT_CLASS }__labeled-input`}>
        <label>{label}</label>
        <input type="text" onInput={onInput} spellCheck="false" />
      </div>
    );
  }
  
  constructor() {
    super();
    
    this.state = {
      matchPattern: '',
      replacePattern: '',
    };
    
    this.handleMatchInput = this.handleMatchInput.bind(this);
    this.handleReplaceInput = this.handleReplaceInput.bind(this);
    this.handleRenameClick = this.handleRenameClick.bind(this);
  }
  
  debounceInput(cb) {
    if(this.inputDebounce) clearTimeout(this.inputDebounce);
    this.inputDebounce = setTimeout(cb, 300);
  }
  
  handleMatchInput(ev) {
    const val = ev.currentTarget.value;
    this.debounceInput(() => {
      try {
        const pattern = new RegExp(val);
        this.setState({ matchPattern: pattern });
      }catch(err){ /**/ }
    });
  }
  
  handleReplaceInput(ev) {
    const val = ev.currentTarget.value;
    this.debounceInput(() => {
      this.replacedNames = [];
      this.setState({ replacePattern: val });
    });
  }
  
  handleRenameClick() {
    const files = [];
    this.replacedNames.forEach((newName, ndx) => {
      if(newName){
        const { dir, ext, name } = this.props.files[ndx];
        files.push({ ext, filePath: dir, newName, oldName: name });
      }
    });
    
    fetch(API__REPLACE, {
      method: 'POST',
      body: JSON.stringify({ files }),
    })
      .then(() => { window.location.reload(); })
      .catch((err) => { alert(err); });
  }
  
  render() {
    const { files, onCancel } = this.props;
    const { matchPattern, replacePattern } = this.state;
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles }`}>
        <Replace.LabeledInput label="Match:" onInput={this.handleMatchInput} />
        <Replace.LabeledInput label="Replace:" onInput={this.handleReplaceInput} />
        <div className={`${ ROOT_CLASS }__table`}>
          <div className={`${ ROOT_CLASS }__table-head`}>
            <div className={`${ ROOT_CLASS }__table-row`}>
              <div className={`${ ROOT_CLASS }__table-data`}>Filename</div>
              <div className={`${ ROOT_CLASS }__table-data`}>Renamed</div>
            </div>
          </div>
          <div className={`${ ROOT_CLASS }__table-body`}>
            {files.map(({ dir, ext, name }, fileNdx) => {
              const origFilename = `${ name }${ ext }`;
              let currentName = origFilename;
              let newName = origFilename;
              
              if(matchPattern){
                const matches = currentName.match(matchPattern);
                
                if(matches){
                  const [match, ...groups] = matches;
                  currentName = currentName.replace(match, `<mark>${ match.trim() }</mark>`);
                  
                  if(groups && replacePattern){
                    newName = replacePattern;
                    groups.forEach((group, groupNdx) => {
                      newName = newName.replace(new RegExp(`\\$${ groupNdx+1 }`, 'g'), group);
                    });
                    this.replacedNames[fileNdx] = newName.trim();
                    newName = `<mark>${ newName.trim() }</mark>${ ext }`;
                  }
                }
              }
              
              return (
                <div
                  key={fileNdx}
                  className={`${ ROOT_CLASS }__table-row`}
                  data-dir={dir}
                >
                  <div
                    className={`${ ROOT_CLASS }__table-data`}
                    dangerouslySetInnerHTML={{ __html: currentName }}
                  />
                  <div
                    className={`${ ROOT_CLASS }__table-data`}
                    dangerouslySetInnerHTML={{ __html: newName }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <nav className={`${ ROOT_CLASS }__btm-nav`}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={this.handleRenameClick}>Rename</button>
        </nav>
      </div>
    );
  }
}

Replace.defaultProps = {
  files: [],
};
Replace.propTypes = {
  files: arrayOf(shape({
    dir: string,
    ext: string,
    name: string,
  })),
  onCancel: func,
};

export default Replace;
