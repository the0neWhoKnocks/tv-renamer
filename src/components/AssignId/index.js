import React, { Component, Fragment } from 'react';
import { func, number, string } from 'prop-types';
import Indicator from 'COMPONENTS/Indicator';
import {
  API__ASSIGN_ID,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__PROCCESSING,
  ROOT_CLASS,
} from './styles';

class AssignId extends Component {
  static normalizeId(id) {
    return (id === 0) ? '' : ''+id;
  }
  
  constructor({ id, name }) {
    super();
    
    this.state = {
      id: AssignId.normalizeId(id),
      idChanged: false,
      normalizedName: name.toLowerCase(),
      proccessing: false,
    };
    
    this.handleChoiceClick = this.handleChoiceClick.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleIdFocus = this.handleIdFocus.bind(this);
  }
  
  handleChoiceClick() {
    const { index, onAssignSuccess } = this.props;
    
    this.setState({ proccessing: true }, () => {
      const { id, normalizedName } = this.state;
      
      fetch(API__ASSIGN_ID, {
        method: 'PUT',
        body: JSON.stringify({ id, name: normalizedName }),
      })
        .then((idMappings) => {
          onAssignSuccess({ id, idMappings, index });
        })
        .catch((err) => {
          alert(err);
        });
    });
  }
  
  handleIdChange(ev) {
    const id = AssignId.normalizeId(ev.currentTarget.value);
    const idChanged = id !== AssignId.normalizeId(this.props.id);
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
              id <code>{id}</code>. If this is correct, click Confirm. If this
              isn&apos;t correct, change the id and click Assign.
            </Fragment>
          )}
        </div>
        <nav className={`${ ROOT_CLASS }__nav`}>
          <button
            className={`${ ROOT_CLASS }__confirm-btn`}
            onClick={this.handleChoiceClick}
            disabled={(proccessing || !id)}
          >Confirm</button>
          <button
            className={`${ ROOT_CLASS }__assign-btn`}
            onClick={this.handleChoiceClick}
            disabled={assignDisabled}
          >Assign</button>
          <Indicator visible={proccessing} />
        </nav>
      </div>
    );
  }
}

AssignId.propTypes = {
  id: number,
  index: number,
  name: string,
  onAssignSuccess: func,
  searchURL: string,
};

export default AssignId;