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
      outline: none;
      position: absolute;
      top: 0;
      left: 0;
      
      &-icon {
        width: ${ iconWidth }em;
        height: calc(100% - 2px);
        margin: 1px 0;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
      }
    }
    &__btn,
    &__btn:hover {
      background: transparent;
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
        right: ${ REQUIRED_WIDTH };
      }
    }
  }
`;