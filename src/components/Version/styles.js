import { css } from 'emotion';
import { ROOT_CLASS as TOGGLE_ROOT_CLASS } from 'COMPONENTS/Toggle/styles';

export const MODIFIER__LIST = 'show--list';
export const MODIFIER__SCROLL_LIST = 'scroll--list';
export const ROOT_CLASS = 'version';
const borderStyle = 'solid 1px #aaa';

export default css`
  overflow: auto;

  .${ ROOT_CLASS } {
    
    &__releases {
      width: 25rem;
      margin: 1em 0;
      
      &-list {
        height: 1px;
        border-top: ${ borderStyle };
        overflow: hidden;
        transition: height 200ms;
        
        .${ TOGGLE_ROOT_CLASS } {
          margin: 0.25em 0;
          
          &__btn {
            width: 100%;
            padding: 0.25em 0.5em;
            border-radius: 0;
            text-transform: none;
            border: none;
            background: rgba(0,0,0,0.1);
          }
        }
      }
    }
    
    &__btm-nav {
      display: flex;
      
      button {
        width: 50%;
      }
    }
  }
  
  &.${ MODIFIER__LIST } {
    
    .${ ROOT_CLASS } {
      
      &__releases-list {
        height: 9em;
        padding: 0 0.25em;
        border: ${ borderStyle };
      }
    }
  }
  
  &.${ MODIFIER__SCROLL_LIST } {
    
    .${ ROOT_CLASS } {
      
      &__releases-list {
        overflow-y: auto;
      }
    }
  }
`;