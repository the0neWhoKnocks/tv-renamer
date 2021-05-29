import React, { Component } from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import {
  API__REPLACE,
  STORAGE_KEY,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__CLEAR_BTN_VISIBLE,
  ROOT_CLASS,
} from './styles'; 

const NDX_TOKEN = '#';
const NDX_TOKEN_REGEX = new RegExp(`\\[${ NDX_TOKEN }([-+]\\d+)?\\]`, 'g');

class Replace extends Component {
  static LabeledInput({ buttons = [], inputRef, label, onChange, onClearClick, onInput, value }) {
    const clearBtnVisible = !!(onClearClick && value);
    const inputWrapperModifier = clearBtnVisible ? MODIFIER__CLEAR_BTN_VISIBLE : '';
    
    return (
      <div className={`${ ROOT_CLASS }__labeled-input`}>
        <label>{label}</label>
        <div className={`${ ROOT_CLASS }__input-wrapper ${ inputWrapperModifier }`}>
          <input
            ref={inputRef}
            type="text"
            onChange={onChange}
            onInput={onInput}
            spellCheck="false"
            value={value}
          />
          {clearBtnVisible && (
            <button type="button" title="Click to clear input value" onClick={onClearClick}>X</button>
          )}
        </div>
        {buttons.map(({ data, label, onClick }) => {
          const dataAtts = {};
          if (data) Object.keys(data).forEach((key) => {
            dataAtts[`data-${ key.toLowerCase() }`] = data[key];
          });
          return (
            <button key={label} className={`${ ROOT_CLASS }__helper-btn`} onClick={onClick} {...dataAtts}>{label}</button>
          );
        })}
      </div>
    );
  }
  
  static getStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  }
  
  static setStorage(data) {
    const currData = Replace.getStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...currData,
      ...data,
    }));
  }
  
  constructor() {
    super();
    
    const { matchInputValue, replaceInputValue } = Replace.getStorage();
    
    this.state = {
      matchInputValue: matchInputValue || '',
      matchPattern: matchInputValue ? new RegExp(matchInputValue) : '',
      replaceInputValue: replaceInputValue || '',
      replacePattern: replaceInputValue || '',
    };
    this.replacedNames = [];
    
    this.handleClearMatchInput = this.handleClearMatchInput.bind(this);
    this.handleClearReplaceInput = this.handleClearReplaceInput.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMatchInput = this.handleMatchInput.bind(this);
    this.handleRenameClick = this.handleRenameClick.bind(this);
    this.handleReplaceInput = this.handleReplaceInput.bind(this);
    this.handleReplaceInputTextUpdate = this.handleReplaceInputTextUpdate.bind(this);
    
    this.matchInput = React.createRef();
    this.replaceInput = React.createRef();
    
    this.matchInputChangeHandler = this.handleInputChange('matchInputValue');
    this.replaceInputChangeHandler = this.handleInputChange('replaceInputValue');
    
    this.matchBtns = [{
      label: '(\\d)',
      onClick: () => {
        const input = this.matchInput.current;
        const startText = input.value.substr(0, input.selectionStart);
        const endText = input.value.substr(input.selectionEnd, input.value.length);
        const newValStart = `${ startText }(\\d{2})`;
        const matchInputValue = `${ newValStart }${ endText }`;
        const newCursorPos = newValStart.length;
        
        this.setState({
          matchInputValue,
          matchPattern: new RegExp(matchInputValue),
        }, () => {
          input.focus();
          input.selectionStart = newCursorPos;
          input.selectionEnd = newCursorPos;
        });
      },
    }];
    this.replaceBtns = [{
      data: { for: 'ndx', token: `[${ NDX_TOKEN }+1]` },
      label: `[${ NDX_TOKEN }]`,
      onClick: this.handleReplaceInputTextUpdate,
    }];
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.matchInputValue !== this.state.matchInputValue) {
      Replace.setStorage({
        matchInputValue: this.state.matchInputValue,
      });
    }
    else if (prevState.replaceInputValue !== this.state.replaceInputValue) {
      Replace.setStorage({
        replaceInputValue: this.state.replaceInputValue,
      });
    }
  }
  
  handleInputChange(stateProp) {
    return (ev) => {
      this.setState({ [stateProp]: ev.target.value });
    };
  }
    
  handleMatchInput(ev) {
    const val = ev.currentTarget.value;
    
    try {
      const pattern = val ? new RegExp(val) : '';
      this.setState({ matchPattern: pattern });
    }
    catch (err) {
      // something wrong with the RegEx, so just use the text
      this.setState({ matchPattern: val });
    }
  }
  
  handleClearMatchInput() {
    this.setState({ matchInputValue: '', matchPattern: '' });
  }
  
  handleClearReplaceInput() {
    this.setState({ replaceInputValue: '', replacePattern: '' });
  }
  
  handleReplaceInput(ev) {
    const val = ev.currentTarget.value;
    this.setState({ replacePattern: val });
  }
  
  handleRenameClick() {
    const files = [];
    this.replacedNames.forEach((newName, ndx) => {
      if (newName) {
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
  
  handleReplaceInputTextUpdate(ev) {
    const input = this.replaceInput.current;
    const startText = input.value.substr(0, input.selectionStart);
    const endText = input.value.substr(input.selectionEnd, input.value.length);
    const newValStart = `${ startText }${ ev.currentTarget.dataset.token }`;
    const replaceInputValue = `${ newValStart }${ endText }`;
    const newCursorPos = newValStart.length;
    
    this.setState({
      replaceInputValue,
      replacePattern: replaceInputValue,
    }, () => {
      input.focus();
      input.selectionStart = newCursorPos;
      input.selectionEnd = newCursorPos;
    });
  }
  
  render() {
    const { files, onCancel } = this.props;
    const {
      matchInputValue,
      matchPattern,
      replaceInputValue,
      replacePattern,
    } = this.state;
    const matchRegEx = (matchPattern && matchPattern instanceof(RegExp))
      ? matchPattern : '';
    
    let extraReplaceBtns = [];
    if (matchRegEx) {
      const groups = matchRegEx.source.match(/((?<!\\)\([^)]+\))/g);
      if (groups) {
        extraReplaceBtns = groups.map((_, ndx) => {
          const num = ndx + 1;
          return {
            data: { token: `$${ num }` },
            label: `$${ num }`,
            onClick: this.handleReplaceInputTextUpdate,
          };
        });
      }
    }
    const replaceBtns = [...extraReplaceBtns, ...this.replaceBtns];
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles }`}>
        <Replace.LabeledInput
          buttons={this.matchBtns}
          inputRef={this.matchInput}
          label="Match:"
          onChange={this.matchInputChangeHandler}
          onClearClick={this.handleClearMatchInput}
          onInput={this.handleMatchInput}
          value={matchInputValue}
        />
        <Replace.LabeledInput
          buttons={replaceBtns}
          inputRef={this.replaceInput}
          label="Replace:"
          onChange={this.replaceInputChangeHandler}
          onClearClick={this.handleClearReplaceInput}
          onInput={this.handleReplaceInput}
          value={replaceInputValue}
        />
        <div className={`${ ROOT_CLASS }__help-section`}>
          The [{NDX_TOKEN}] button allows for adding a dynamic value based on
          the current file&apos;s index. If you just want the index, add <code>[{NDX_TOKEN}]</code>.
          If you need the index plus or minus five for example, add <code>[{NDX_TOKEN}+5]</code>,
          or <code>[{NDX_TOKEN}-5]</code>. You can also pad a number with something
          like <code>[{NDX_TOKEN}+00]</code> or <code>[{NDX_TOKEN}+05]</code>.
        </div>
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
              let newName = name;
              
              if (matchRegEx) {
                const matches = currentName.match(matchRegEx);
                
                if (matches) {
                  // NOTE - `groups` is a prototype prop on a RegEx match, but
                  // spreading to `groups` actually just gives me the indexed
                  // capture group values.
                  const [match, ...groups] = matches;
                  
                  if (groups) {
                    const { index: matchNdx } = matches;
                    const groupParts = [];
                    const startChunk = currentName.substr(0, matchNdx);
                    let endChunk = currentName
                      .substr(matchNdx, currentName.length)
                      .replace(match, `<mark>${ match.trim() }</mark>`);
                    let currEndChunk = endChunk;
                    
                    groups.forEach((g, ndx) => {
                      if (g) {
                        const replacement = `<mark data-ndx="${ ndx }">${ g.trim() }</mark>`;
                        const startNdx = currEndChunk.indexOf(g);
                        groupParts.push(currEndChunk.substr(0, startNdx) + replacement);
                        currEndChunk = currEndChunk.substr(startNdx + g.length, currEndChunk.length);
                      }
                    });
                    if (groupParts.length) endChunk = `${ groupParts.join('') }${ currEndChunk }`;
                    
                    currentName = `${ startChunk }${ endChunk }`;
                  }
                  
                  if (groups) {
                    let pattern = replacePattern;
                    if (NDX_TOKEN_REGEX.test(pattern)) {
                      (pattern.match(NDX_TOKEN_REGEX) || []).forEach((m) => {
                        const [, strNum = '0'] = m.match(NDX_TOKEN_REGEX.source) || [];
                        const num = +strNum;
                        const normalizedStrNum = strNum.replace(/^[-+]/, '');
                        const paddedNum = String(fileNdx + 1 + num).padStart(normalizedStrNum.length, normalizedStrNum);
                        
                        pattern = pattern.replace(m, paddedNum);
                      });
                    }
                    
                    newName = newName.replace(match, pattern);
                    
                    groups.forEach((group, groupNdx) => {
                      newName = newName.replace(new RegExp(`\\$${ groupNdx+1 }`, 'g'), group);
                    });
                    
                    this.replacedNames[fileNdx] = newName.trim();
                    newName = `<mark>${ newName.trim() }</mark>`;
                  }
                }
              }
              newName += ext;
              
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
