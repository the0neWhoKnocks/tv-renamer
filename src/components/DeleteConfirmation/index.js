import React, { Component } from 'react';
import { func, number, string } from 'prop-types';
import {
  API__DELETE_FILE,
} from 'ROOT/conf.app';
import fetch from 'UTILS/fetch';
import styles, {
  MODIFIER__PROCCESSING,
  ROOT_CLASS,
} from './styles';

class DeleteConfirmation extends Component {
  constructor() {
    super();
    
    this.state = {
      proccessing: false,
    };
    
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }
  
  handleCancelClick() {
    this.props.onClose();
  }
  
  handleDeleteClick() {
    const { filePath, index, onDeleteSuccess } = this.props;
    
    this.setState({ proccessing: true }, () => {
      fetch(`${ API__DELETE_FILE }?file=${ encodeURIComponent(filePath) }`)
        .then(() => {
          onDeleteSuccess({ filePath, index });
        })
        .catch((err) => {
          alert(err);
        });
    });
  }
  
  render() {
    const {
      filePath,
    } = this.props;
    const { proccessing } = this.state;
    let rootModifier = '';
    
    if (proccessing) rootModifier = MODIFIER__PROCCESSING;
    
    return (
      <div className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}>
        <div className={`${ ROOT_CLASS }__desc-row`}>
          This file will be deleted
          <pre className={`${ ROOT_CLASS }__code-block`}>{filePath}</pre>
        </div>
        <nav className={`${ ROOT_CLASS }__nav`}>
          <button
            className={`${ ROOT_CLASS }__cancel-btn`}
            onClick={this.handleCancelClick}
            disabled={proccessing}
          >Cancel</button>
          <button
            className={`${ ROOT_CLASS }__delete-btn`}
            onClick={this.handleDeleteClick}
            disabled={proccessing}
          >Delete</button>
        </nav>
      </div>
    );
  }
}

DeleteConfirmation.propTypes = {
  filePath: string,
  index: number,
  onDeleteSuccess: func,
  onClose: func,
};

export default DeleteConfirmation;