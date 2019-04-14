import { css, keyframes } from 'emotion';

export const MODIFIER__VISIBLE = 'is--visible';
export const ROOT_CLASS = 'indicator';

const hop1 = keyframes`
  0% {
    transform: translate(-150%, 0%);
  }
  25% {
    transform: translate(-75%, -100%);
  }
  50% {
    transform: translate(0%, 0%);
  }
  75% {
    transform: translate(75%, -100%);
  }
  100% {
    transform: translate(150%, 0%);
  }
`;
const hop2 = keyframes`
  0% {
    transform: translate(0%, 0%);
  }
  50%, 100% {
    transform: translate(-150%, 0%);
  }
`;
const hop3 = keyframes`
  0%, 50% {
    transform: translate(150%, 0%);
  }
  100% {
    transform: translate(0%, 0%);
  }
`;

export default css`
  padding: 0.5em 1.5em;
  border-radius: 1em;
  background: #fff;
  transition: opacity 200ms;
  opacity: 0;
  pointer-events: none;
  
  .${ ROOT_CLASS } {
    width: 0.5em;
    height: 0.5em;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
    }

    &__dot,
    &::before,
    &::after {
      width: 100%;
      height: 100%;
      border-radius: 100%;
      background: currentColor;
    }
  }
  
  &.${ MODIFIER__VISIBLE } {
    opacity: 1;
    
    .${ ROOT_CLASS } {
      &::before {
        animation: ${ hop1 } 500ms infinite;
      }
      
      &__dot {
        animation: ${ hop2 } 500ms infinite;
      }
      
      &::after {
        animation: ${ hop3 } 500ms infinite;
      }
    }
  }
`;