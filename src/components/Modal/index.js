import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { bool, func, node, string } from 'prop-types';
import styles, {
  MODIFIER__CLICKABLE,
  ROOT_CLASS,
} from './styles';

export default class Modal extends Component {
  constructor({ visible }) {
    super();
    
    this.state = {
      visible,
    };
    
    this.handleMaskClick = this.handleMaskClick.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) {
    const state = {};
    
    // `visible` state changed from parent
    if(
      prevProps.visible !== this.props.visible
      && this.props.visible !== this.state.visible
    ) state.visible = this.props.visible;
    
    if(Object.keys(state).length) this.setState(state);
  }
  
  handleMaskClick() {
    const { onMaskClick } = this.props;
    
    this.setState({ visible: false }, () => {
      if(onMaskClick) onMaskClick();
    });
  }
  
  render() {
    const {
      children,
      noMask,
      onMaskClick,
      rootClassOverride,
      stylesOverride,
      visible,
    } = this.props;
    const _rootClass = rootClassOverride || ROOT_CLASS;
    const _styles = stylesOverride || styles;
    
    if(!visible) return null;
    
    const maskModifier = (onMaskClick) ? MODIFIER__CLICKABLE : '';
    
    return createPortal(
      (
        <div className={`${ _rootClass } ${ _styles }`}>
          {!noMask && (
            <button
              className={`${ _rootClass }__mask ${ maskModifier }`}
              onClick={this.handleMaskClick}
            />
          )}
          <div className={`${ _rootClass }__body`}>
            {children}
          </div>
        </div>
      ),
      document.querySelector('#modals'),
    );
  }
}

Modal.defaultProps = {
  visible: false,
};
Modal.propTypes = {
  children: node,
  noMask: bool,
  onMaskClick: func,
  rootClassOverride: string,
  stylesOverride: string,
  visible: bool,
};