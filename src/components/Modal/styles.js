import { css } from 'emotion';

export const MODIFIER__CLICKABLE = 'is--clickable';
export const ROOT_CLASS = 'modal';

export default css`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  
  .${ ROOT_CLASS } {
    
    &__mask {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: linear-gradient(#666, #888);
      position: absolute;
      top: 0;
      left: 0;
      cursor: default;
      
      &.${ MODIFIER__CLICKABLE } {
        cursor: pointer;
      }
    }
    
    &__body {
      max-width: 80vw;
      align-self: center;
      padding: 1em;
      border-radius: 0.5em;
      margin: 1em;
      box-shadow: 0 0.5em 1.5em 0 rgba(0,0,0,0.5);
      background: #eee;
      display: flex;
      flex-direction: column;
      position: relative;
    }
  }
`;