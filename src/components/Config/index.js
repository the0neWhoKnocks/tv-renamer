import React, { Component } from 'react';
import { func, string } from 'prop-types';
import {
  API__CONFIG_SAVE,
} from 'ROOT/conf.repo';
import fetch from 'UTILS/fetch';
import styles from './styles';

const Item = ({
  label,
  name,
  value,
}) => (
  <div className="config__item">
    <label>{label}</label>
    <input type="text" name={name} defaultValue={value} />
  </div>
);
Item.propTypes = {
  label: string,
  name: string,
  value: string,
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
    [...this.configRef.querySelectorAll('.config__item input')]
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
      userKey,
      userName,
    } = this.props;
    
    return (
      <div
        className={`config ${ styles }`}
        ref={(ref) => { this.configRef = ref; }}
      >
        <section>
          <h2>TVDB</h2>
          {!apiKey && (
            <div className="config__msg is--error">
              No credentials for theTVDB have been found. You&apos;ll need to
              obtain the below info from your TVDB account.
            </div>
          )}
          <Item label="API Key" name="apiKey" value={apiKey} />
          <Item label="User Key" name="userKey" value={userKey} />
          <Item label="User Name" name="userName" value={userName} />
        </section>
        <nav className="config__btm-nav">
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
  userKey: string,
  userName: string,
};

export default Config;