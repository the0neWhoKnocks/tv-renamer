import { css } from 'emotion';
import {
  DEFAULT_CTA,
  VALID_CTA,
} from 'COMPONENTS/globalStyles';

export const MODIFIER__READ_ONLY = 'is--read-only';
export const MODIFIER__REQUIRED = 'is--required';
export const ROOT_CLASS = 'config';

export default css`

  h2 {
    padding-bottom: 0.25em;
    border-bottom: solid 1px #aaa;
    margin: 0 0 0.5em;
  }

  .${ ROOT_CLASS } {  
    
    &__body {
      min-width: 22em;
      max-width: 26em;
      padding: 1em;
    }
    
    &__msg {
      padding: 1em;
      margin: 0.5em 0;
      background: #eee;
      
      &.is--error {
        background: #ffa8a8;
      }
    }
    
    &__btm-nav {
      text-align: center;
      padding: 0.5em;
      
      button {
        padding: 0.5em 1em;
        margin: 0 0.5em;
      }
    }
    
    &__close-btn,
    &__save-btn {
      ${ DEFAULT_CTA }
    }
    
    &__save-btn {
      
      &:not(:disabled) {
        ${ VALID_CTA }
      }
    }
  }
`;