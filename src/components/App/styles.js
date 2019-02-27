import { css } from 'emotion';

export const MODIFIER__PREVIEWING = 'is--previewing';
export const ROOT_CLASS = 'app';

export default css`
  height: 100%;
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
    
    &__items-nav {
      text-align: right;
      overflow: hidden;
      background: #666;
      
      &-btns-wrapper {
        transition: transform 200ms;
        transform: translateX(6em);
      }
      
      button {
        color: #ddd;
        padding: 0.5em 1em;
        border: none;
        border-left: solid 1px #888;
        background: transparent;
        outline: none;
        
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
      overflow-y: auto;
      
      &:nth-of-type(2) {
        max-height: 25%;
        flex-shrink: 0;
      }
      
      &-title {
        box-shadow: 0 1px 1rem 0.25rem rgba(0, 0, 0, 0.5);
        position: sticky;
        top: 0;
        z-index: 2;
        
        h2 {
          background: linear-gradient(#eee, #d4d4d4);
          padding: 0.5rem 1rem;
          margin: 0;
        }
      }
      
      &-items {
        
        &.has--items {
          padding: 1rem;
        }
      }
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