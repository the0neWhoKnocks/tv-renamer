import { css } from 'emotion';

export const MODIFIER__EDITING_NAME = 'editing--name';
export const MODIFIER__PREVIEWING = 'is--previewing';
export const MODIFIER__SELECTED = 'is--selected';
export const MODIFIER__WARNING = 'has--warning';
export const ROOT_CLASS = 'renamable';
const itemBorderColor = '#aaa';

export default css`
  border: solid 1px ${ itemBorderColor };
  margin-bottom: -1px;
  overflow: hidden;
  cursor: default;
  position: relative;
  display: flex;
  opacity: 0.5;
  
  .${ ROOT_CLASS } {
    
    &__name,
    &__new-name {
      width: 100%;
      padding: 0.5em 0.75em;
    }
    
    &__name {
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    &__new-name {
      color: #0f5833;
      font-weight: bold;
      background: #b5efcf;
      
      &.${ MODIFIER__WARNING } {
        color: #734b00;
        background: #fff1ab;
        
        a {
          color: currentColor;
          text-decoration: none;
          padding: 0.25em 0 0.1em;
          border-bottom: solid 1px;
          margin: 0 0.5em 0 0;
          display: inline-block;
        }
      }
    }
  }
  
  [contenteditable="true"] {
    cursor: text;
    outline: none;
    
    &:focus {
      padding: 0.25em 0.5em;
      border: inset 1px;
      background: white;
    }
  }
  
  &:hover {
    
    &::before {
      transform: translateX(0%);
    }
  }
  
  &.${ MODIFIER__EDITING_NAME } {
    
    .${ ROOT_CLASS } {
      
      &__name {
        overflow-x: auto;
        text-overflow: unset;
      }
    }
  }
  
  &.${ MODIFIER__PREVIEWING } {
    
    .${ ROOT_CLASS } {
      
      &__name,
      &__new-name {
        width: 50%;
      }
      
      &__name {
        border-right: solid 1px ${ itemBorderColor };
      }
    }
  }
  
  &.${ MODIFIER__SELECTED } {
    opacity: 1;
    
    &:hover {
      border-radius: 0.5em;
      box-shadow: 0 0 0px 0.25em #666;
      z-index: 1;
    }
  }
  
  @media (max-width: 600px) {
    font-size: 3.5vw;
    flex-wrap: wrap;
    border-bottom-width: 0.2em;
    margin-bottom: 0.5em;
    
    &.${ MODIFIER__PREVIEWING } {
      
      .${ ROOT_CLASS } {
        
        &__name,
        &__new-name {
          width: 100%;
        }
        
        &__name {
          border-right: none;
        }
      }
    }
  }
`;