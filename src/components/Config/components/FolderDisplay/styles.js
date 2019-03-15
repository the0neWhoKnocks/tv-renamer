import { css } from 'emotion';

export const ROOT_CLASS = 'folder-display';
export const MODIFIER__NOT_READABLE = 'not--readable';
export const MODIFIER__NOT_WRITABLE = 'not--writable';

export default css`
  
  .${ ROOT_CLASS } {
    
    &__body {
      min-width: calc(80vw - 4em); // 4em is the padding & margin of the modal
      max-width: 80vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    &__breadcrumbs {
      overflow-x: auto;
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    &__breadcrumb-btn {
      padding: 0.25em 0.75em;
      margin-left: -2px;
      
      &:first-of-type {
        margin-left: 0;
      }
    }
    
    &__folders {
      height: 100%;
      margin-top: 1em;
      overflow: auto;
      background: linear-gradient(#a7a7a7, #ddd);
      display: flex;
      flex-direction: column;
    }
    
    &__folder {
      margin: 0.25em;
      display: flex;
      flex-shrink: 0;
    }
    
    &__folder-btn,
    &__folder-select-btn {
      white-space: nowrap;
      padding: 0.5em 0.75em;
      border: solid 1px #676767;
    }
    
    &__folder-btn {
      text-align: left;
      text-overflow: ellipsis;
      overflow: hidden;
      border-radius: 0.5em 0 0 0.5em;
      margin-right: 0.25em;
      background: linear-gradient(#fff, #ddd);
      flex-grow: 1;
      
      &.${ MODIFIER__NOT_READABLE } {
        opacity: 0.5;
      }
    }
    
    &__folder-select-btn {
      border-radius: 0 0.5em 0.5em 0;
      background: linear-gradient(#f1fdf1, #b8eab8);
      
      &.${ MODIFIER__NOT_WRITABLE } {
        opacity: 0.5;
        background: linear-gradient(#fff, #ddd);
      }
    }
  }
`;