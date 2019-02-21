import { css } from 'emotion';

export const ROOT_CLASS = 'folder-picker';

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
        width: 2em;
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
`;