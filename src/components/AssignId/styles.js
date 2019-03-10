import { css, keyframes } from 'emotion';
import {
  DEFAULT_CTA,
  VALID_CTA,
} from 'COMPONENTS/globalStyles';

export const MODIFIER__PROCCESSING = 'is--proccessing';
export const ROOT_CLASS = 'assign-id';

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
  max-width: 30em;
  overflow: auto;
  
  a {
    color: currentColor;
  }
  
  > {
    * {
      margin: 0.75em 0;
    }
  }
  
  .${ ROOT_CLASS } {
    
    &__id-row {
      font-size: 1.5em;
      line-height: 1.5em;
      margin-top: 0;
      display: flex;
      align-items: center;
    }
    
    &__show-name {
      width: 100%;
      text-align: center;
    }
    
    &__id-input {
      width: 5em;
      font-size: 1em;
      text-align: center;
    }
    
    &__search-link {
      color: #4384a2;
      text-align: center;
      padding: 0.5em;
      background: #bdeaf7;
      display: block;
    }
    
    &__nav {
      margin-bottom: 0;
      display: flex;
      position: relative;
    }
    
    &__confirm-btn,
    &__assign-btn {
      ${ DEFAULT_CTA }
      width: 50%;
      padding: 1em;
    }
    
    &__confirm-btn {
      border-radius: 0.25em 0 0 0.25em;
      border-right: none;
    }
    
    &__assign-btn {
      border-radius: 0 0.25em 0.25em 0;
      
      &:not(:disabled) {
        ${ VALID_CTA }
      }
    }
    
    &__proccessing-indicator {
      width: 0.5em;
      height: 0.5em;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: opacity 200ms;
      opacity: 0;
      
      &::before,
      &::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      }
      
      > div,
      &::before,
      &::after {
        width: 100%;
        height: 100%;
        border-radius: 100%;
        background: #666;
      }
    }
  }
  
  &.${ MODIFIER__PROCCESSING } {
    
    .${ ROOT_CLASS } {
      
      &__apply-btn {
        color: transparent;
      }
      
      &__proccessing-indicator {
        opacity: 1;
        
        &::before {
          animation: ${ hop1 } 500ms infinite;
        }
        
        > div {
          animation: ${ hop2 } 500ms infinite;
        }
        
        &::after {
          animation: ${ hop3 } 500ms infinite;
        }
      }
    }
  }
`;