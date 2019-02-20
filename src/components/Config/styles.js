import { css } from 'emotion';

export const MODIFIER__READ_ONLY = 'is--read-only';
export const ROOT_CLASS = 'config';

export default css`

  .${ ROOT_CLASS } {
    
    &__item {
      margin: 0.5em 0;
      
      label {
        min-width: 7em;
        display: inline-block;
      }
      
      input {
        width: 14em;
        padding: 0.2em 0.5em;
        border: solid 1px;
        display: inline-block;
      }
      
      &[data-remaining-time]::after {
        content: "~ " attr(data-remaining-time) " Hours Remaining on JWT";
        font-family: monospace;
        text-align: right;
        padding: 0.25em;
        display: block;
        opacity: 0.5;
      }
      
      &.${ MODIFIER__READ_ONLY } {
        
        label {
          font-style: italic;
          opacity: 0.5;
        }
        
        input {
          color: #999;
          font-style: italic;
        }
      }
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
      color: #333;
      font-weight: bold;
      border: solid 1px;
      border-radius: 0.25em;
      background: linear-gradient(#f5f5f5, #d2d2d2);
      
      &:disabled {
        opacity: 0.5;
      }
    }
    
    &__save-btn {
      
      &:not(:disabled) {
        color: #16614f;
        background: linear-gradient(#f5f5f5, #9cf3db);
      }
    }
  }
`;