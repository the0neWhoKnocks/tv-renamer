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
      <input type="text" name={name} defaultValue={value} readOnly={readOnly} />
    </div>
  );
};
Item.propTypes = {
  data: shape({}),
  label: string,
  name: string,
  readOnly: bool,
  value: oneOfType([
    number,
    string,
  ]),
};

class Config extends Component {
  constructor() {
    super();
    
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
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
  
  render() {
    const {
      apiKey,
      jwt,
      jwtDate,
      userKey,
      userName,
    } = this.props;
    
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
          <Item label="API Key" name="apiKey" value={apiKey} />
          <Item label="User Key" name="userKey" value={userKey} />
          <Item label="User Name" name="userName" value={userName} />
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
          <button onClick={this.handleCloseClick}>Close</button>
          <button onClick={this.handleSaveClick}>Save</button>
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