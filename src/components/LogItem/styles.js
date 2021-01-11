import { css } from 'emotion';

export const ROOT_CLASS = 'log-item';
const COLOR__SUCCESS = '#81c581';

export default css`
  color: #8e9a98;
  font-family: monospace;
  padding: 2.25em 0.75em 0.75em;
  position: relative;
  
  .${ ROOT_CLASS } {
    
    &__time {
      position: absolute;
      right: 0.5rem;
      top: 0.25rem;
    }
    
    &__body {
      * {
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
    
    &__to {
      color: ${ COLOR__SUCCESS };
    }
    
    &__error {
      color: #ff4040;
    }
    
    &__warning {
      color: #ff6a00;
      
      &-icon {
        color: #efff00;
        padding-right: 0.5em;
      }
      
      a {
        color: #70c4ff;
        padding: 0.5em 0;
        display: block;
      }
    }
    
    &__deleted {
      line-height: 1.5em;
      
      &-icon {
        color: ${ COLOR__SUCCESS };
        font-size: 1em;
        padding-right: 0.5em;
        display: inline-block;
        vertical-align: top;
      }
      
      &-path {
        color: #c3c3c3;
      }
    }
  }
`;