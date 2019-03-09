import { css } from 'emotion';
import {
  ROOT_CLASS as ITEM_ROOT_CLASS,
  MODIFIER__REQUIRED,
  REQUIRED_WIDTH,
} from '../ConfigItem/styles';

export const ROOT_CLASS = 'folder-picker';
const iconWidth = 2;

export default css`
  position: relative;
  
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
        margin: 1px 0;
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
    
    &.${ MODIFIER__REQUIRED } + .${ ROOT_CLASS }__btn {
      
      .${ ROOT_CLASS }__btn-icon {
        margin: 1px 3px;
        right: ${ REQUIRED_WIDTH };
      }
    }
  }
`;