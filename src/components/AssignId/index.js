import React, { Component } from 'react';
import { number, string } from 'prop-types';
import styles, {
  ROOT_CLASS,
} from './styles';

class AssignId extends Component {
  constructor({ id, name }) {
    super();
    
    this.state = {
      id,
      idChanged: false,
      normalizedName: name.toLowerCase(),
    };
    
    this.handleAssignClick = this.handleAssignClick.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleIdFocus = this.handleIdFocus.bind(this);
  }
  
  handleAssignClick(ev) {
    
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
      seriesURL,
    } = this.props;
    const {
      id,
      idChanged,
      normalizedName,
    } = this.state;
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles }`}>
        <div>
          <code>{normalizedName}</code>&nbsp;=&nbsp;
          <input 
            className={`${ ROOT_CLASS }__id-input`}
            type="text" 
            value={id} 
            onChange={this.handleIdChange} 
            onFocus={this.handleIdFocus} 
          />
        </div>
        <a href={searchURL}>Search</a>
        &nbsp;
        <a href={seriesURL}>Series</a>
        <div>
          Any matches for <code>{normalizedName}</code> will use TVDB
          id <code>{id}</code> once you click Assign.
        </div>
        <button
          onClick={this.handleAssignClick}
          disabled={!idChanged}
        >Assign</button>
      </div>
    );
  }
}

AssignId.propTypes = {
  id: number,
  name: string,
  searchURL: string,
  seriesURL: string,
};

export default AssignId;