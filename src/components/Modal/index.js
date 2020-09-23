import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { bool, func, node, string } from 'prop-types';
import styles, {
  MODIFIER__CLICKABLE,
  MODIFIER__CLOSING,
  ROOT_CLASS,
  TRANSITION_DURATION,
} from './styles';

export default class Modal extends Component {
  constructor({ visible }) {
    super();
    
    this.state = {
      closing: false,
      visible,
    };
    
    this.handleMaskClick = this.handleMaskClick.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) {
    let state = {};
    
    // `visible` state changed from parent
    if(
      prevProps.visible !== this.props.visible
      && this.props.visible !== this.state.visible
    ) state.visible = this.props.visible;
    
    if(
      !this.props.noMask
      && (prevState.visible && !this.state.visible)
    ){
      state.closing = true;
    }
    
    if(Object.keys(state).length) {
      this.setState(state, () => {
        if(state.closing){
          setTimeout(() => {
            this.setState({ closing: false, visible: false });
          }, TRANSITION_DURATION);
        }
      });
    }
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
    } = this.props;
    const {
      closing,
      visible,
    } = this.state;
    const _rootClass = rootClassOverride || ROOT_CLASS;
    const _styles = stylesOverride || styles;
    let modifiers = '';
    
    if(!visible && !closing) return null;
    
    const maskModifier = (onMaskClick) ? MODIFIER__CLICKABLE : '';
    
    if(closing) modifiers += MODIFIER__CLOSING;
    
    return createPortal(
      (
        <div className={`${ _rootClass } ${ _styles } ${ modifiers }`}>
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