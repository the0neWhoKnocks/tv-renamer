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
    
    this.originalId = AssignId.normalizeId(id);
    
    this.state = {
      id: this.originalId,
      idChanged: false,
      matches: [],
      normalizedName: name.toLowerCase(),
      proccessing: false,
      searchURL: AssignId.genSearchURL(name),
    };
    
    this.handleChoiceClick = this.handleChoiceClick.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleIdFocus = this.handleIdFocus.bind(this);
    this.handleMatchClick = this.handleMatchClick.bind(this);
  }
  
  componentDidMount() {
    this.getMatchingSeries();
  }
  
  getMatchingSeries() {
    const seriesName = this.props.name;
    
    if(matchCache[seriesName]){
      this.setState({ matches: matchCache[seriesName] });
    }
    else{
      fetch(API__SERIES_MATCHES, { params: { seriesName } })
        .then((matches) => {
          matchCache[seriesName] = matches;
          this.setState({ matches });
        })
        .catch((err) => {
          alert(err);
        });
    }
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
          onAssignSuccess({
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
    this.updateID(ev.currentTarget.dataset.id);
  }
  
  render() {
    const {
      id,
      idChanged,
      matches,
      normalizedName,
      proccessing,
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
        {!!matches.length && (
          <div className={`${ ROOT_CLASS }__matches`}>
            {matches.map(({ id, name, overview, thumbnail, year }) => {
              const nameAndYear = `${ name } (${ year })`;
              return (
                <div
                  key={id}
                  className={`${ ROOT_CLASS }__match`}
                  data-id={id}
                  title={`Select series ID ${ id }`}
                  onClick={this.handleMatchClick}
                >
                  {thumbnail
                    ? <img className={`${ ROOT_CLASS }__match-img`} src={thumbnail} alt={nameAndYear} />
                    : <div className={`${ ROOT_CLASS }__match-img`}></div>
                  }
                  <div className={`${ ROOT_CLASS }__match-copy`}>
                    <div className={`${ ROOT_CLASS }__match-title`}>{nameAndYear}</div>
                    <div className={`${ ROOT_CLASS }__match-desc`}>{overview}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
