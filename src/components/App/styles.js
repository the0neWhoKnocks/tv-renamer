import { css } from 'emotion';
import { MQ__MOBILE } from 'COMPONENTS/globalStyles';
import { ROOT_CLASS as LOG_ROOT_CLASS } from 'COMPONENTS/LogItem/styles';
import { ROOT_CLASS as TOGGLE_ROOT_CLASS } from 'COMPONENTS/Toggle/styles';

export const MODIFIER__HAS_ITEMS = 'has--items';
export const MODIFIER__INDICATOR = 'has--indicator';
export const MODIFIER__LOGS = 'has--logs';
export const MODIFIER__LOGS_OPEN = 'logs--open';
export const MODIFIER__RENAME = 'enable--rename';
export const MODIFIER__VISIBLE = 'is--visible';
export const ROOT_CLASS = 'app';

export default css`
  height: 100%;
  overflow: hidden;
  background: #eee;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 0;
  
  .${ ROOT_CLASS } {
    
    &__nav {
      text-align: right;
      background: #333;
      display: flex;
      justify-content: flex-end;
      
      button {
        color: #ddd;
        padding: 0.5rem 1rem;
        border: none;
        border-left: solid 1px #666;
        border-radius: 0;
        background: transparent;
      }
    }
    
    &__body {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    &__global-toggle {
      display: inline-block;
      
      .${ TOGGLE_ROOT_CLASS }__btn {
        min-width: 6.5em;
        text-align: center;
        text-transform: none;
        padding: 0.25em;
        border-radius: 0.25em;
      }
    }
    
    &__items-nav {
      padding: 0.25em;
      margin: 1rem 1rem 0;
      overflow: hidden;
      background: #666;
      position: relative;
      flex-shrink: 0;
      
      &-btns-wrapper {
        white-space: nowrap;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        transition: transform 200ms;
        transform: translateX(10.5em);
      }
      
      button {
        height: 100%;
        color: #ddd;
        padding: 0.5em 1em;
        border: none;
        border-left: solid 1px #888;
        border-radius: 0;
        outline: none;
        position: relative;
        vertical-align: top;
        
        &:focus {
          box-shadow: inset 0px -4px 0px -1px #484848;
        }
        
        &:disabled {
          opacity: 0.5;
        }
        
        &[for="folders"] {
          padding: 0 1em;
          pointer-events: none;
          opacity: 0;
        }
        
        &[for="rename"] {
          min-width: 10.5em;
        }
        
        &.${ MODIFIER__INDICATOR } {
          color: transparent;
        }
      }
      
      .indicator__wrapper {
        color: #fff;
        background: transparent;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    
    &__section {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      
      &:nth-of-type(2) {
        flex-shrink: 0;
        
        .${ ROOT_CLASS } {
          
          &__section {
            
            &-title {
              box-shadow: 0 -0.25em 1em 0 rgba(0, 0, 0, 0.25);
              position: relative;
            }
            
            &-items {
              padding: 0;
              margin-top: 1rem;
              background: #333;
            }
          }
        }
      }
      
      &-title {
        
        h2 {
          background: linear-gradient(#eee, #d4d4d4);
          padding: 0.5rem 1rem;
          margin: 0;
        }
      }
      
      &-items {
        height: 100%;
        padding: 0.25rem 0.25rem 1rem;
        margin: 0.25rem 0.75rem 1rem 0.75rem;
        overflow-y: auto;
      }
    }
    
    &__rename-status-logs {
      height: 10em;
      color: #eee;
      white-space: pre;
      overflow: hidden;
      padding: 0.5em;
      margin: 0rem 1rem 0;
      background: #333;
      position: relative;
      
      &::after {
        content: '';
        width: 100%;
        height: 100%;
        background: linear-gradient(transparent, #333);
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    
    &__logs-nav {
      position: absolute;
      top: 50%;
      right: 0.75em;
      transform: translateY(-50%);
      
      > * {
        display: inline-block;
      }
      
      .${ TOGGLE_ROOT_CLASS } {
        
        &__btn {
          color: #333 !important;
          line-height: 1em;
          padding: 0.5em;
          border: none;
          background: none !important;
        }
      }
    }
    
    &__logs-arrow {
      width: 1em;
      height: 0.5em;
      
      &::after {
        content: '';
        width: 0;
        height: 0;
        border: solid 0.5em transparent;
        border-top: solid 0.5em currentColor;
        display: block;
      }
      
      &.is--up {
        transform: scale(-1);
      }
    }
    
    &__stats {
      
      &-count {
        color: #666;
        font-family: monospace;
        font-weight: bold;
        line-height: 2em;
        padding: 0 0.5em;
        display: inline-block;
        
        &.is--good {
          
          span {
            color: #1f9475;
          }
        }
        
        &.is--bad {
          border-left: solid 1px #909090;
          
          span {
            color: #d04500;
          }
        }
      }
    }
  }
  
  ${ MQ__MOBILE } {
    
    .${ ROOT_CLASS } {
    
      &__items-nav {
        padding-top: 2.75em;
        padding-left: 0;
        margin-bottom: 0.5rem;
        background: linear-gradient(0deg, #eee 50%, #666 50%);
        
        &-btns-wrapper {
          bottom: 50%;
        }
      }
    }
  }
  
  .${ LOG_ROOT_CLASS } {
    border-top: dashed 1px rgba(255, 255, 255, 0.3);
    
    &:first-of-type {
      border-top: none;
    }
  }
  
  &.${ MODIFIER__VISIBLE } {
    transition: opacity 500ms;
    opacity: 1;
  }
  
  &.${ MODIFIER__RENAME } {
    
    .${ ROOT_CLASS } {
      
      &__items-nav-btns-wrapper {
        transform: translateX(0em);
        
        button[for="folders"] {
          pointer-events: all;
          opacity: 1;
        }
      }
    }
  }
  
  &.${ MODIFIER__LOGS } {
    
    .${ ROOT_CLASS } {
      
      &__section:nth-of-type(2) {
        height: 3em;
      }
    }
    
    &.${ MODIFIER__LOGS_OPEN } {
      
      .${ ROOT_CLASS } {
        
        &__section {
          height: 50%;
        }
      }
    }
  }
`;