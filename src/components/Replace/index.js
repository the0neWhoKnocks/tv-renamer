import React, { Component } from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import { API__REPLACE } from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, { ROOT_CLASS } from './styles';

class Replace extends Component {
  static LabeledInput({ buttons = [], inputRef, label, onChange, onInput, value }) {
    return (
      <div className={`${ ROOT_CLASS }__labeled-input`}>
        <label>{label}</label>
        <input
          ref={inputRef}
          type="text"
          onChange={onChange}
          onInput={onInput}
          spellCheck="false"
          value={value}
        />
        {buttons.map(({ data, label, onClick }) => {
          const dataAtts = {};
          if(data) Object.keys(data).forEach((key) => {
            dataAtts[`data-${ key.toLowerCase() }`] = data[key];
          });
          return (
            <button key={label} onClick={onClick} {...dataAtts}>{label}</button>
          );
        })}
      </div>
    );
  }
  
  constructor() {
    super();
    
    this.state = {
      matchInputValue: '',
      matchPattern: '',
      replaceInputValue: '',
      replacePattern: '',
    };
    this.replacedNames = [];
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMatchInput = this.handleMatchInput.bind(this);
    this.handleRenameClick = this.handleRenameClick.bind(this);
    this.handleReplaceInput = this.handleReplaceInput.bind(this);
    this.handleReplaceInputTextUpdate = this.handleReplaceInputTextUpdate.bind(this);
    
    this.matchInput = React.createRef();
    this.replaceInput = React.createRef();
    
    this.matchBtns = [
      {
        label: '(\\d)',
        onClick: () => {
          const input = this.matchInput.current;
          const startText = input.value.substr(0, input.selectionStart);
          const endText = input.value.substr(input.selectionEnd, input.value.length);
          const matchInputValue = `${ startText }(\\d{2})${ endText }`;
          
          this.setState({
            matchInputValue,
            matchPattern: new RegExp(matchInputValue),
          });
        },
      },
    ];
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
    catch(err){
      // something wrong with the RegEx, so just use the text
      this.setState({ matchPattern: val });
    }
  }
  
  handleReplaceInput(ev) {
    const val = ev.currentTarget.value;
    this.setState({ replacePattern: val });
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
  
  handleReplaceInputTextUpdate(ev) {
    const input = this.replaceInput.current;
    const startText = input.value.substr(0, input.selectionStart);
    const endText = input.value.substr(input.selectionEnd, input.value.length);
    const replaceInputValue = `${ startText }$${ ev.currentTarget.dataset.num }${ endText }`;
    
    this.setState({
      replaceInputValue,
      replacePattern: replaceInputValue,
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
    let replaceBtns = [];
    
    if(matchRegEx){
      const groups = matchRegEx.source.match(/((?<!\\)\([^)]+\))/g);
      if(groups) replaceBtns = groups.map((_, ndx) => {
        const num = ndx + 1;
        return {
          data: { num },
          label: `$${ num }`,
          onClick: this.handleReplaceInputTextUpdate,
        };
      });
    }
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles }`}>
        <Replace.LabeledInput
          buttons={this.matchBtns}
          inputRef={this.matchInput}
          label="Match:"
          onChange={this.handleInputChange('matchInputValue')}
          onInput={this.handleMatchInput}
          value={matchInputValue}
        />
        <Replace.LabeledInput
          buttons={replaceBtns}
          inputRef={this.replaceInput}
          label="Replace:"
          onChange={this.handleInputChange('replaceInputValue')}
          onInput={this.handleReplaceInput}
          value={replaceInputValue}
        />
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
              
              if(matchRegEx){
                const matches = currentName.match(matchRegEx);
                
                if(matches){
                  const [match, ...groups] = matches;
                  
                  if(groups){
                    currentName = currentName.replace(match, `<mark>${ match.trim() }</mark>`);
                    groups.forEach((g, ndx) => {
                      if(g){
                        currentName = currentName.replace(g, `<mark data-ndx="${ ndx }">${ g.trim() }</mark>`);
                      }
                    });
                  }
                  
                  if(groups){
                    newName = newName.replace(match, replacePattern);
                    
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
