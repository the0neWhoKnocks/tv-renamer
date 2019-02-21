import { css } from 'emotion';

export const MODIFIER__READ_ONLY = 'is--read-only';
export const MODIFIER__REQUIRED = 'is--required';
export const ROOT_CLASS = 'config-item';

export default css`
  margin: 0.5em 0;
  position: relative;
  
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
  
  .${ ROOT_CLASS } {
    
    &__indicator {
      width: 0.5em;
      height: 0.5em;
      border-radius: 100%;
      margin-left: 0.25em;
      background: radial-gradient(#fff 15%, #35c597);
      box-shadow: 0 0 18px 2px #2ae8ab;
      position: absolute;
      top: 50%;
      left: 100%;
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
    
    input[value=""] ~ .${ ROOT_CLASS }__indicator {
      background: radial-gradient(#fff 15%, #d24d00);
      box-shadow: 0 0 18px 2px #ff5200;
    }
  }
`;