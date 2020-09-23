import { css, keyframes } from 'emotion';

export const MODIFIER__CLICKABLE = 'is--clickable';
export const MODIFIER__CLOSING = 'is--closing';
export const ROOT_CLASS = 'modal';
export const TRANSITION_DURATION = 200;

const showMask = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;
const hideMask = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const showModal = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-3em);
  }
  100% {
    opacity: 1;
    transform: translateY(0em);
  }
`;
const hideModal = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0em);
  }
  100% {
    opacity: 0;
    transform: translateY(3em);
  }
`;

export default css`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  
  .${ ROOT_CLASS } {
    
    &__mask {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: linear-gradient(#666, #888);
      position: absolute;
      top: 0;
      left: 0;
      cursor: default;
      animation: ${ showMask } ${ TRANSITION_DURATION }ms;
      
      &.${ MODIFIER__CLICKABLE } {
        cursor: pointer;
      }
    }
    
    &__body {
      max-width: 80vw;
      align-self: center;
      padding: 1em;
      border-radius: 0.5em;
      margin: 1em;
      box-shadow: 0 0.5em 1.5em 0 rgba(0,0,0,0.5);
      background: #eee;
      display: flex;
      flex-direction: column;
      position: relative;
      animation: ${ showModal } ${ TRANSITION_DURATION }ms;
    }
  }
  
  &.${ MODIFIER__CLOSING } {
    
    .${ ROOT_CLASS } {
      
      &__mask {
        animation: ${ hideMask } ${ TRANSITION_DURATION }ms;
        animation-fill-mode: forwards;
      }
      
      &__body {
        animation: ${ hideModal } ${ TRANSITION_DURATION }ms;
        animation-fill-mode: forwards;
      }
    }
  }
`;