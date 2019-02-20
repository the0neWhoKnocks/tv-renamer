import React, { Component, Fragment } from 'react';
import { bool, func, number, oneOfType, shape, string } from 'prop-types';
import {
  API__CONFIG_SAVE,
} from 'ROOT/conf.repo';
import fetch from 'UTILS/fetch';
import getRemainingJWTTime from 'UTILS/getRemainingJWTTime';
import styles, {
  MODIFIER__READ_ONLY,
  ROOT_CLASS,
} from './styles';

const formatTime = (timestamp) => new Date(timestamp).toLocaleString();

const Item = ({
  data,
  label,
  name,
  onChange,
  readOnly,
  value,
}) => {
  const dataAttrs = {};
  
  if(data){
    Object.keys(data).forEach((key) => {
      dataAttrs[`data-${ key }`] = data[key];
    });
  }
  
  return (
    <div 
      className={`${ ROOT_CLASS }__item ${ (readOnly) ? MODIFIER__READ_ONLY : '' }`}
      {...dataAttrs}
    >
      <label>{label}</label>
      <input
        defaultValue={value}
        name={name}
        onChange={onChange}
        readOnly={readOnly}
        type="text"
      />
    </div>
  );
};
Item.propTypes = {
  data: shape({}),
  label: string,
  name: string,
  onChange: func,
  readOnly: bool,
  value: oneOfType([
    number,
    string,
  ]),
};

class Config extends Component {
  constructor() {
    super();
    
    this.state = {
      saveDisabled: true,
    };
    
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }
  
  handleCloseClick() {
    this.props.onClose();
  }
  
  handleSaveClick() {
    const { onSaveComplete } = this.props;
    const data = {};
    [...this.configRef.querySelectorAll(`.${ ROOT_CLASS }__item input:not(:read-only)`)]
      .forEach(({ name, value }) => {
        data[name] = value;
      });
    
    fetch(API__CONFIG_SAVE, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
      .then((resp) => {
        onSaveComplete(resp);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  handleValueChange(ev) {
    const { saveDisabled } = this.state;
    const inputs = this.configRef.querySelectorAll(`.${ ROOT_CLASS }__item input:not(:read-only)`);
    let enableSave = false;
    
    // Check all editiable items to see if their values are different than
    // what was passed in.
    for(let i=0; i<inputs.length; i++){
      const { name, value } = inputs[i];
      
      if( this.props[name] !== value.trim() ){
        enableSave = true;
        break;
      }
    }
    
    if(saveDisabled && enableSave){
      this.setState({ saveDisabled: false });
    }
    else if(!saveDisabled && !enableSave){
      this.setState({ saveDisabled: true });
    }
  }
  
  render() {
    const {
      apiKey,
      jwt,
      jwtDate,
      userKey,
      userName,
    } = this.props;
    const {
      saveDisabled,
    } = this.state;
    
    return (
      <div
        className={`${ ROOT_CLASS } ${ styles }`}
        ref={(ref) => { this.configRef = ref; }}
      >
        <section>
          <h2>TVDB</h2>
          {!apiKey && (
            <div className={`${ ROOT_CLASS }__msg is--error`}>
              No credentials for theTVDB have been found. You&apos;ll need to
              obtain the below info from your TVDB account.
            </div>
          )}
          <Item
            label="API Key"
            name="apiKey"
            onChange={this.handleValueChange}
            value={apiKey}
          />
          <Item
            label="User Key"
            name="userKey"
            onChange={this.handleValueChange}
            value={userKey}
          />
          <Item
            label="User Name"
            name="userName"
            onChange={this.handleValueChange}
            value={userName}
          />
          {jwt && (
            <Fragment>
              <Item label="JWT" name="jwt" value={jwt} readOnly />
              <Item
                data={{
                  'remaining-time': getRemainingJWTTime(jwtDate),
                }}
                label="JWT Time"
                name="jwtDate"
                value={ formatTime(jwtDate) }
                readOnly
              />
            </Fragment>
          )}
        </section>
        <nav className={`${ ROOT_CLASS }__btm-nav`}>
          <button
            className={`${ ROOT_CLASS }__close-btn`}
            onClick={this.handleCloseClick}
          >Close</button>
          <button
            className={`${ ROOT_CLASS }__save-btn`}
            onClick={this.handleSaveClick}
            disabled={saveDisabled}
          >Save</button>
        </nav>
      </div>
    );
  }
}
Config.propTypes = {
  onClose: func,
  onSaveComplete: func,
  apiKey: string,
  jwt: string,
  jwtDate: number,
  userKey: string,
  userName: string,
};

export default Config;