import React, { Component, Fragment } from 'react';
import { bool, func, string } from 'prop-types';
import FolderDisplay from '../FolderDisplay';
import ConfigItem from '../ConfigItem';
import styles, {
  ROOT_CLASS,
} from './styles';

class FolderPicker extends Component {
  constructor({
    value,
  }) {
    super();
    
    this.state = {
      showFolderDisplay: false,
      value,
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.handleDisplayClose = this.handleDisplayClose.bind(this);
    this.handleFolderSelection = this.handleFolderSelection.bind(this);
  }
  
  handleClick(ev) {
    this.setState({
      showFolderDisplay: true,
    });
  }
  
  handleDisplayClose() {
    this.setState({
      showFolderDisplay: false,
    });
  }
  
  handleFolderSelection(value) {
    this.setState({
      showFolderDisplay: false,
      value,
    }, () => {
      this.props.onChange();
    });
  }
  
  render() {
    const {
      label,
      name,
      required,
    } = this.props;
    const {
      showFolderDisplay,
      value,
    } = this.state;
    
    return (
      <Fragment>
        <div
          className={`${ ROOT_CLASS } ${ styles }`}
          data-full-path={value}
        >
          <ConfigItem
            label={label}
            name={name}
            required={required}
            value={value}
          />
          <button
            className={`${ ROOT_CLASS }__btn`}
            onClick={this.handleClick}
          >
            <div className={`${ ROOT_CLASS }__btn-icon`}>&#x1F5BF;</div>
          </button>
        </div>
        {showFolderDisplay && (
          <FolderDisplay
            onClose={this.handleDisplayClose}
            onSelect={this.handleFolderSelection}
          />
        )}
      </Fragment>
    );
  }
}

FolderPicker.propTypes = {
  label: string,
  name: string,
  onChange: func,
  required: bool,
  value: string,
};

export default FolderPicker;