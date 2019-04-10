import { css } from 'emotion';

export const MODIFIER__READ_ONLY = 'is--read-only';
export const MODIFIER__REQUIRED = 'is--required';
export const ROOT_CLASS = 'config-item';
export const REQUIRED_WIDTH = '0.8em';

export default css`
  white-space: nowrap;
  margin: 0.5em 0;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  
  label {
    min-width: 7em;
    display: inline-block;
  }
  
  input {
    width: 14em;
    flex-grow: 1;
    padding: 0.2em 0.5em;
    border: solid 1px;
    display: inline-block;
  }
  
  .${ ROOT_CLASS } {
    
    &__indicator {
      width: 0.4em;
      height: 0.75em;
      border-radius: 0.15em;
      margin-right: 0.2em;
      background: radial-gradient(#fff 15%, #d24d00);
      box-shadow: 0 0 5px 2px #ff5200;
      position: absolute;
      z-index: 1;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }
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
  
  &.${ MODIFIER__REQUIRED } {
    
    &::after {
      content: '';
      width: ${ REQUIRED_WIDTH };
      border-radius: 0 0.25em 0.25em 0;
      background: #333;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
    }
    
    input {
      margin-right: ${ REQUIRED_WIDTH };
    }
    
    input:valid ~ .${ ROOT_CLASS }__indicator {
      background: radial-gradient(#fff 15%, #35c597);
      box-shadow: 0 0 5px 2px #2ae8ab;
    }
  }
`;