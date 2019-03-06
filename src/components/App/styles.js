import { css } from 'emotion';
import { ROOT_CLASS as LOG_ROOT_CLASS } from 'COMPONENTS/LogItem/styles';
import { ROOT_CLASS as TOGGLE_ROOT_CLASS } from 'COMPONENTS/Toggle/styles';

export const MODIFIER__PREVIEWING = 'is--previewing';
export const MODIFIER__HAS_ITEMS = 'has--items';
export const ROOT_CLASS = 'app';

export default css`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .${ ROOT_CLASS } {
    
    &__nav {
      text-align: right;
      background: #333;
      
      button {
        color: #ddd;
        padding: 0.5rem 1rem;
        border: none;
        border-left: solid 1px #666;
        background: transparent;
      }
    }
    
    &__body {
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
        transform: translateX(8.75em);
      }
      
      button {
        height: 100%;
        color: #ddd;
        padding: 0.5em 1em;
        border: none;
        border-left: solid 1px #888;
        background: transparent;
        outline: none;
        
        &:nth-of-type(2) {
          min-width: 10.5em;
        }
        
        &:hover {
          color: #fff;
        }
        
        &:focus {
          box-shadow: inset 0px -4px 0px -1px #484848;
        }
        
        &:disabled {
          opacity: 0.5;
        }
      }
    }
    
    &__section {
      height: 50%;
      display: flex;
      flex-direction: column;
      
      &:nth-of-type(2) {
        flex-shrink: 0;
        
        .${ ROOT_CLASS } {
          
          &__section {
            
            &-title {
              box-shadow: 0 -0.25em 1em 0 rgba(0, 0, 0, 0.25);
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
        margin: 0 0.75rem 1rem 0.75rem;
        overflow-y: auto;
      }
    }
  }
  
  .${ LOG_ROOT_CLASS } {
    border-top: dashed 1px rgba(255, 255, 255, 0.3);
    
    &:first-of-type {
      border-top: none;
    }
  }
  
  &.${ MODIFIER__PREVIEWING } {
    
    .${ ROOT_CLASS } {
      
      &__items-nav-btns-wrapper {
        transform: translateX(0em);
      }
    }
  }
`;