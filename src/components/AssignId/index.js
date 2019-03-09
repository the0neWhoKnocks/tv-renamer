import React, { Component, Fragment } from 'react';
import { number, string } from 'prop-types';
import styles, {
  MODIFIER__PROCCESSING,
  ROOT_CLASS,
} from './styles';

class AssignId extends Component {
  constructor({ id, name }) {
    super();
    
    this.state = {
      id,
      idChanged: false,
      normalizedName: name.toLowerCase(),
      proccessing: false,
    };
    
    this.handleAssignClick = this.handleAssignClick.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleIdFocus = this.handleIdFocus.bind(this);
  }
  
  handleAssignClick(ev) {
    this.setState({ proccessing: true }, () => {
      
    });
  }
  
  handleIdChange(ev) {
    const id = +ev.currentTarget.value;
    const idChanged = id !== this.props.id;
    const state = {};
    
    if(id !== this.state.id) state.id = id;
    if(idChanged !== this.state.idChanged) state.idChanged = idChanged;
    
    if(Object.keys(state).length) this.setState(state);
  }
  
  handleIdFocus(ev) {
    ev.target.select();
  }
  
  render() {
    const {
      searchURL,
    } = this.props;
    const {
      id,
      idChanged,
      normalizedName,
      proccessing,
    } = this.state;
    let rootModifier = '';
    let assignDisabled = !idChanged;
    
    if(proccessing){
      rootModifier = MODIFIER__PROCCESSING;
      assignDisabled = true;
    }
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}>
        <div className={`${ ROOT_CLASS }__id-row`}>
          <code
            className={`${ ROOT_CLASS }__show-name`}
          >{normalizedName}</code>&nbsp;=&nbsp;
          <input 
            className={`${ ROOT_CLASS }__id-input`}
            type="text" 
            value={id} 
            onChange={this.handleIdChange} 
            onFocus={this.handleIdFocus}
            disabled={proccessing}
          />
        </div>
        <div>
          {searchURL && (
            <a
              className={`${ ROOT_CLASS }__search-link`}
              href={searchURL}
              rel="noopener noreferrer"
              target="_blank"
            >Search</a>
          )}
        </div>
        <div>
          {idChanged && (
            <Fragment>
              Any matches for <code>{normalizedName}</code> will use the TVDB
              id <code>{id}</code> after you click Assign.
            </Fragment>
          )}
          {!idChanged && (
            <Fragment>
              Any matches for <code>{normalizedName}</code> are using the TVDB
              id <code>{id}</code>. If this isn&apos;t correct, change the id
              and click Assign.
            </Fragment>
          )}
        </div>
        <button
          className={`${ ROOT_CLASS }__apply-btn`}
          onClick={this.handleAssignClick}
          disabled={assignDisabled}
        >
          Assign
          <div className={`${ ROOT_CLASS }__apply-btn-indicator`}><div /></div>
        </button>
      </div>
    );
  }
}

AssignId.propTypes = {
  id: number,
  name: string,
  searchURL: string,
};

export default AssignId;