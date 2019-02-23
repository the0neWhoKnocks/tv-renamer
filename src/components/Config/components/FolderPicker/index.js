import React, { Component, Fragment } from 'react';
import { bool, func, string } from 'prop-types';
import Modal, { ModalConsumer } from 'COMPONENTS/Modal';
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
        {showModal && (
          <Modal
            onMaskClick={this.handleModalClose}
          >
            <FolderDisplay
              current={value}
              onClose={this.handleModalClose}
              onSelect={this.handleFolderSelection}
            />
          </Modal>
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