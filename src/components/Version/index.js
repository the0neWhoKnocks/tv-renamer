import React, { Component } from 'react';
import { func } from 'prop-types';
import Toggle from 'COMPONENTS/Toggle';
import {
  GIT_API__RELEASES,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__LIST,
  MODIFIER__SCROLL_LIST,
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
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.handleUpdateCheckClick = this.handleUpdateCheckClick.bind(this);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
  }
  
  componentDidMount() {
    
  }
  
  handleCloseClick() {
    this.props.onClose();
  }
  
  handleUpdateClick() {
    alert(`Update to ${ this.state.selectedRelease }`);
  }
  
  handleUpdateCheckClick() {
    this.setState({ showList: true }, () => {
      fetch(GIT_API__RELEASES)
        .then((resp) => {
          this.setState({
            releases: resp.map((rel) => rel.name),
          });
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
      selectedRelease,
      showList,
    } = this.state;
    let updateBtnText = 'Check for Updates';
    let updateBtnHandler = this.handleUpdateCheckClick;
    let rootModifier = '';
    
    if(showList) rootModifier += MODIFIER__LIST;
    if(releases.length) rootModifier += ` ${ MODIFIER__SCROLL_LIST }`;
    
    if(selectedRelease) {
      updateBtnText = 'Update';
      updateBtnHandler = this.handleUpdateClick;
    }
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}>
        <div className={`${ ROOT_CLASS }__body`}>
          <section>
            <div>
              Current version: {global.appVersion}
            </div>
          </section>
          <section className={`${ ROOT_CLASS }__releases`}>
            <div className={`${ ROOT_CLASS }__releases-list`}>
              {releases.map((release) => (
                <Toggle
                  key={release}
                  data={{
                    'data-release': release,
                  }}
                  disabled={release === global.appVersion}
                  id={`release_${ release.replace(/\./g, '') }`}
                  onToggle={this.handleVersionSelect}
                  toggled={release === selectedRelease}
                >{release}</Toggle>
              ))}
            </div>
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