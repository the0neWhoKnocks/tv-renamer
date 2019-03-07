import { css } from 'emotion';

export const ROOT_CLASS = 'log-item';

export default css`
  color: #8e9a98;
  font-family: monospace;
  padding: 0.75em;
  
  .${ ROOT_CLASS } {
    
    &__body {
      * {
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
    
    &__to {
      color: #81c581;
    }
    
    &__error {
      color: #d25700;
    }
    
    &__deleted {
      line-height: 1.5em;
      
      &-icon {
        color: #d25700;
        font-size: 1.5em;
        padding-right: 0.25em;
        display: inline-block;
        vertical-align: top;
      }
    }
  }
`;