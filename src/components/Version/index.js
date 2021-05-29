import React, { Component } from 'react';
import { func } from 'prop-types';
import {
  API__RELEASES,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__CURRENT,
  MODIFIER__DATE,
  MODIFIER__LIST,
  MODIFIER__SCROLL_LIST,
  MODIFIER__STICKY,
  ROOT_CLASS,
} from './styles';

class Version extends Component {
  constructor() {
    super();
    
    this.state = {
      releases: [],
      selectedRelease: undefined,
      showList: false,
    };
    
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleUpdateCheckClick = this.handleUpdateCheckClick.bind(this);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
  }
  
  handleCloseClick() {
    this.props.onClose();
  }
  
  handleUpdateCheckClick() {
    this.setState({ showList: true }, () => {
      fetch(API__RELEASES)
        .then((releases) => {
          this.setState({ releases });
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }
  
  handleVersionSelect(ev) {
    const release = ev.currentTarget.dataset.release;
    
    this.setState({
      selectedRelease: (this.state.selectedRelease === release)
        ? undefined
        : release,
    });
  }
  
  render() {
    const {
      releases,
      showList,
    } = this.state;
    let updateBtnText = 'Check Releases';
    let updateBtnHandler = this.handleUpdateCheckClick;
    let rootModifier = '';
    
    if (showList) rootModifier += MODIFIER__LIST;
    if (releases.length) rootModifier += ` ${ MODIFIER__SCROLL_LIST }`;
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}>
        <div className={`${ ROOT_CLASS }__body`}>
          <section>
            <div>
              Current version:
              <div className={`${ ROOT_CLASS }__app-version`}>{global.appVersion}</div>
            </div>
          </section>
          <section className={`${ ROOT_CLASS }__releases`}>
            <table className={`${ ROOT_CLASS }__releases-list`}>
              <thead>
                <tr>
                  <th className={`${ ROOT_CLASS }__column-title ${ MODIFIER__STICKY }`}>Tag</th>
                  <th className={`${ ROOT_CLASS }__column-title ${ MODIFIER__STICKY }`}>Size</th>
                  <th className={`${ ROOT_CLASS }__column-title ${ MODIFIER__STICKY } ${ MODIFIER__DATE }`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {releases.map(({ date, name, size }) => (
                  <tr key={name} className={(name === global.appVersion) ? MODIFIER__CURRENT : ''}>
                    <td>{name}</td>
                    <td>{size}</td> 
                    <td className={MODIFIER__DATE}>{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <nav className={`${ ROOT_CLASS }__btm-nav`}>
            <button
              className={`${ ROOT_CLASS }__close-btn`}
              onClick={this.handleCloseClick}
            >Close</button>
            <button
              className={`${ ROOT_CLASS }__update-btn`}
              onClick={updateBtnHandler}
            >{updateBtnText}</button>
          </nav>
        </div>
      </div>
    );
  }
}

Version.propTypes = {
  onClose: func,
};

export default Version;