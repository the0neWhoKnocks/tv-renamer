import { css } from 'emotion';
import {
  DEFAULT_CTA,
  VALID_CTA,
} from 'COMPONENTS/globalStyles';

export const ROOT_CLASS = 'delete-confirmation';

export default css`
  max-width: 30em;
  overflow: auto;
  
  .${ ROOT_CLASS } {
    
    &__code-block {
      color: #eee;
      font-size: 1.2em;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 0.5em;
      background: #333;
    }
    
    &__nav {
      margin-bottom: 0;
      display: flex;
      position: relative;
    }
    
    &__cancel-btn,
    &__delete-btn {
      ${ DEFAULT_CTA }
      width: 50%;
      padding: 1em;
    }
    
    &__cancel-btn {
      border-radius: 0.25em 0 0 0.25em;
      border-right: none;
    }
    
    &__delete-btn {
      border-radius: 0 0.25em 0.25em 0;
      
      &:not(:disabled) {
        ${ VALID_CTA }
      }
    }
  }
`;