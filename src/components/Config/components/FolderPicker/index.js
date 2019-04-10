import React, { Component, Fragment } from 'react';
import { bool, func, string } from 'prop-types';
import Modal from 'COMPONENTS/Modal';
import SVG, { ICON__FOLDER } from 'COMPONENTS/SVG';
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
      showModal: false,
      value,
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleFolderSelection = this.handleFolderSelection.bind(this);
  }
  
  handleClick(ev) {
    this.setState({
      showModal: true,
    });
  }
  
  handleModalClose() {
    this.setState({
      showModal: false,
    });
  }
  
  handleFolderSelection(value) {
    this.setState({
      showModal: false,
      value,
    });
  }
  
  render() {
    const {
      label,
      name,
      onChange,
      required,
    } = this.props;
    const {
      showModal,
      value,
    } = this.state;
    
    return (
      <Fragment>
        <div
          className={`${ ROOT_CLASS } ${ styles }`}
          title={value}
        >
          <ConfigItem
            label={label}
            name={name}
            onUpdate={onChange}
            required={required}
            value={value}
          />
          <button
            className={`${ ROOT_CLASS }__btn`}
            onClick={this.handleClick}
          >
            <SVG className={`${ ROOT_CLASS }__btn-icon`} icon={ICON__FOLDER} />
          </button>
        </div>
        <Modal
          onMaskClick={this.handleModalClose}
          visible={showModal}
        >
          <FolderDisplay
            current={value}
            onClose={this.handleModalClose}
            onSelect={this.handleFolderSelection}
          />
        </Modal>
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