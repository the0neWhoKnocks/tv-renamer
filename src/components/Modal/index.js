import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { func, node } from 'prop-types';
import styles, {
  MODIFIER__CLICKABLE,
  ROOT_CLASS,
} from './styles';

export default class Modal extends Component {
  constructor() {
    super();
    
    this.handleMaskClick = this.handleMaskClick.bind(this);
  }
  
  handleMaskClick(...args) {
    const { onMaskClick } = this.props;
    if(onMaskClick) onMaskClick(...args);
  }
  
  render() {
    const {
      children,
      onMaskClick,
    } = this.props;
    const maskModifier = (onMaskClick) ? MODIFIER__CLICKABLE : '';
    
    return createPortal(
      (
        <div className={`${ ROOT_CLASS } ${ styles }`}>
          <button
            className={`${ ROOT_CLASS }__mask ${ maskModifier }`}
            onClick={this.handleMaskClick}
          />
          <div className={`${ ROOT_CLASS }__body`}>
            {children}
          </div>
        </div>
      ),
      document.querySelector('#modals'),
    );
  }
}

Modal.propTypes = {
  children: node,
  onMaskClick: func,
};