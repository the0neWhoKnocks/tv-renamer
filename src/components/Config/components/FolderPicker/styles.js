import { css } from 'emotion';
import { ROOT_CLASS as ITEM_ROOT_CLASS } from '../ConfigItem/styles';

export const ROOT_CLASS = 'folder-picker';
const iconWidth = 2;

export default css`
  position: relative;
  
  &:hover {
    
    &::after {
      content: attr(data-full-path);
      font-family: monospace;
      font-size: 1.2em;
      white-space: nowrap;
      padding: 0.25em 0.5em;
      border-radius: 0.25em;
      box-shadow: 0 4px 7px 0px rgba(0,0,0,0.5);
      background: #ffffb9;
      position: absolute;
      bottom: 124%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
    }
  }
  
  .${ ROOT_CLASS } {
    
    &__btn {
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      outline: none;
      position: absolute;
      top: 0;
      left: 0;
      
      &-icon {
        width: ${ iconWidth }em;
        color: #ffa500;
        text-shadow: -1px 1px 1px #803b1b;
        border-right: solid 1px #ababab;
        margin: 1px;
        background: linear-gradient(#eee, #ccc);
        transform: scale(-1, 1);
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
      }
    }
  }
  
  .${ ITEM_ROOT_CLASS } {
    
    input {
      text-align: left;
      text-overflow: ellipsis;
      direction: rtl;
      padding-right: ${ iconWidth + 0.5 }em;
    }
  }
`;