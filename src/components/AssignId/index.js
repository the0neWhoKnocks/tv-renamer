import React, { Component, Fragment } from 'react';
import { func, number, string } from 'prop-types';
import Indicator from 'COMPONENTS/Indicator';
import {
  API__ASSIGN_ID,
  API__SERIES_MATCHES,
  TMDB__URL__QUERY,
  TMDB__TOKEN__SERIES_QUERY,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__INACTIVE,
  MODIFIER__PROCCESSING,
  ROOT_CLASS,
} from './styles';

const matchCache = {};

class AssignId extends Component {
  static normalizeId(id) {
    return (id === 0) ? '' : ''+id;
  }
  
  static genSearchURL(name) {
    return TMDB__URL__QUERY.replace(TMDB__TOKEN__SERIES_QUERY, encodeURIComponent(name));
  }
  
  constructor({ id, name }) {
    super();
    
    const normalizedName = name.toLowerCase();
    this.searchInputRef = React.createRef();
    this.originalId = AssignId.normalizeId(id);
    
    this.state = {
      id: this.originalId,
      idChanged: false,
      matches: [],
      normalizedName,
      proccessing: false,
      query: normalizedName,
      searching: false,
      searchURL: AssignId.genSearchURL(name),
    };
    
    this.handleChoiceClick = this.handleChoiceClick.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleIdFocus = this.handleIdFocus.bind(this);
    this.handleMatchClick = this.handleMatchClick.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
  }
  
  componentDidMount() {
    this.getMatchingSeries();
  }
  
  getMatchingSeries() {
    const { query: seriesName = '' } = this.state;
    
    if(matchCache[seriesName]){
      this.setState({ matches: matchCache[seriesName] });
    }
    else{
      this.setState({ searching: true }, () => {
        fetch(API__SERIES_MATCHES, { params: { seriesName } })
          .then((matches) => {
            matchCache[seriesName] = matches;
            this.setState({ matches, searching: false });
          })
          .catch((err) => {
            alert(err);
          });
      });
    }
  }
  
  handleChoiceClick() {
    const { index, onAssignSuccess } = this.props;
    
    this.setState({ proccessing: true }, () => {
      const { id, normalizedName } = this.state;
      
      fetch(API__ASSIGN_ID, {
        method: 'PUT',
        body: JSON.stringify({
          assignedName: this.assignedName, // equivelant to nameWithYear
          id,
          name: normalizedName,
        }),
      })
        .then((idMappings) => {
          onAssignSuccess({
            assignedName: this.assignedName,
            id: +id,
            idMappings,
            index,
            originalId: +this.originalId,
          });
        })
        .catch((err) => {
          alert(err);
        });
    });
  }
  
  updateID(id) {
    const _id = AssignId.normalizeId(id);
    const idChanged = _id !== AssignId.normalizeId(this.props.id);
    const state = {};
    
    if(_id !== this.state.id) state.id = _id;
    if(idChanged !== this.state.idChanged) state.idChanged = idChanged;
    
    if(Object.keys(state).length) this.setState(state);
  }
  
  handleIdChange(ev) {
    this.updateID(ev.currentTarget.value);
  }
  
  handleIdFocus(ev) {
    ev.target.select();
  }
  
  handleMatchClick(ev) {
    const { id, name } = ev.currentTarget.dataset;
    this.updateID(id);
    this.assignedName = name;
  }
  
  handleSearchClick(ev) {
    ev.preventDefault();
    
    const newQuery = this.searchInputRef.current.value;
    
    if(newQuery && newQuery !== this.state.query){
      this.setState({ query: newQuery }, this.getMatchingSeries);
    }
  }
  
  render() {
    const {
      id,
      idChanged,
      matches,
      normalizedName,
      proccessing,
      searching,
      searchURL,
    } = this.state;
    const textID = id || '_';
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
        <div className={`${ ROOT_CLASS }__search`}>
          <form className={`${ ROOT_CLASS }__search-bar`} onSubmit={this.handleSearchClick}>
            <input type="text" defaultValue={normalizedName} ref={this.searchInputRef} />
            <button onClick={this.handleSearchClick}>Search</button>
          </form>
          {!matches.length && (
            <div className={`${ ROOT_CLASS }__no-results`}>
              {searching && (
                <Fragment>
                  Searching for &quot;<span>{this.searchInputRef.current.value}</span>&quot;
                </Fragment>
              )}
              {!searching && (
                <Fragment>
                  No matches for &quot;<span>{this.searchInputRef.current && this.searchInputRef.current.value}</span>&quot;
                </Fragment>
              )}
            </div>
          )}
          {!!matches.length && (
            <div className={`${ ROOT_CLASS }__matches`}>
              {matches.map(({ id, name, overview, thumbnail }) => {
                return (
                  <div
                    key={id}
                    className={`${ ROOT_CLASS }__match`}
                    data-id={id}
                    data-name={name}
                    title={`Select series ID ${ id }`}
                    onClick={this.handleMatchClick}
                  >
                    {thumbnail
                      ? <img className={`${ ROOT_CLASS }__match-img`} src={thumbnail} alt={name} />
                      : <div className={`${ ROOT_CLASS }__match-img`}></div>
                    }
                    <div className={`${ ROOT_CLASS }__match-copy`}>
                      <div className={`${ ROOT_CLASS }__match-title`}>{name}</div>
                      <div className={`${ ROOT_CLASS }__match-desc`}>{overview}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          {searchURL && (
            <a
              className={`${ ROOT_CLASS }__search-link`}
              href={searchURL}
              rel="noopener noreferrer"
              target="_blank"
            >Click to Manually Search on TMDB</a>
          )}
        </div>
        <div className={`${ ROOT_CLASS }__help-text ${ (!id) ? MODIFIER__INACTIVE : '' }`}>
          {idChanged && (
            <Fragment>
              Any matches for <code>{normalizedName}</code> will use TMDB
              id <code>{textID}</code> after you click Assign.
            </Fragment>
          )}
          {!idChanged && (
            <Fragment>
              Any matches for <code>{normalizedName}</code> are using TMDB
              id <code>{textID}</code>. If this is correct, click Confirm. If this
              isn&apos;t correct, change the id and click Assign.
            </Fragment>
          )}
        </div>
        <nav className={`${ ROOT_CLASS }__nav`}>
          <button
            className={`${ ROOT_CLASS }__confirm-btn`}
            onClick={this.handleChoiceClick}
            disabled={(proccessing || !id || idChanged)}
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
};

export default AssignId;
