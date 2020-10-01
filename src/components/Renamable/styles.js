import { css } from 'emotion';
import { ROOT_CLASS as TOGGLE_ROOT_CLASS } from 'COMPONENTS/Toggle/styles';

export const MODIFIER__EDITING_NAME = 'editing--name';
export const MODIFIER__PREVIEWING = 'is--previewing';
export const MODIFIER__REFRESH = 'is--refresh';
export const MODIFIER__SELECTED = 'is--selected';
export const MODIFIER__SKIPPED = 'was--skipped';
export const MODIFIER__TOGGLE = 'is--toggle';
export const MODIFIER__WARNING = 'has--warning';
export const ROOT_CLASS = 'renamable';
const sepBorder = 'solid 1px #aaa';

export default css`
  border: ${ sepBorder };
  margin-bottom: -1px;
  overflow: hidden;
  cursor: default;
  position: relative;
  display: flex;
  
  &:hover {
    border-radius: 0.5em;
    box-shadow: 0 0 0px 0.25em #666;
    z-index: 1;
    
    .${ ROOT_CLASS }__item-toggle {
      border-radius: 6px 0px 0px 6px;
        
      .${ TOGGLE_ROOT_CLASS } {
        
        &__input:checked + .${ TOGGLE_ROOT_CLASS }__btn {
          border-radius: 4px 0px 0px 4px;
        }
      }
    }
  }
  
  .${ ROOT_CLASS } {
    
    &__names {
      width: 100%;
      display: flex;
      overflow: hidden;
    }
    
    &__name,
    &__new-name {
      width: 100%;
    }
    
    &__name {
      padding: 0.5em 0.75em;
      opacity: 0.5;
      position: relative;
      display: flex;
      
      &-ext {
        padding-right: 1.75em;
      }
    }
    
    &__delete-btn {
      fill: #7b3434;
      font-size: 1.5em;
      padding: 0 0.25em;
      border: none;
      position: absolute;
      right: 1px;
      top: 0.2em;
    }
    &__delete-btn,
    &__delete-btn:hover {
      background: transparent;
    }
    
    &__ce-fix {
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      position: relative;
      
      &-mask {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
    }
    
    &__new-name {
      color: #0f5833;
      font-weight: bold;
      padding: 0.5em 0.75em;
      background: #b5efcf;
      
      &-text {
        white-space: pre-wrap;
      }
      
      &.${ MODIFIER__WARNING } {
        color: #734b00;
        background: #fff1ab;
      }
      
      &.${ MODIFIER__SKIPPED } {
        color: #676767;
        background: #dadada;
      }
    }
    
    &__nav {
      font-size: 1.1em;
      margin-top: 0.5em;
      background: #333;
      
      .${ ROOT_CLASS }__tmdb-icon,
      &-item {
        border-radius: 0;
        display: inline-block;
        vertical-align: middle;
      }
      
      .${ ROOT_CLASS }__tmdb-icon {
        width: 40px;
        height: 18px;
        padding: 0 0.25em;
      }
      
      &-item {
        color: #eee;
        line-height: 1em;
        font-family: monospace;
        font-size: 1em;
        font-weight: normal;
        padding: 0.25em 0.5em;
        border: none;
        border-left: solid 1px;
        background: transparent;
        
        &.for--series-id {
          min-width: 4em;
        }
        
        &.${ MODIFIER__TOGGLE } {
          
          .${ TOGGLE_ROOT_CLASS } {
            
            &__btn {
              padding: 0 0.25em;
              border: none;
              background: transparent;
            }
            
            &__input:not(:checked) + .${ TOGGLE_ROOT_CLASS }__btn {
              
              .${ ROOT_CLASS }__btn-icon {
                --folder-color: #808080;
              }
            }
          }
        }
        
        &.${ MODIFIER__REFRESH } {
          
          .${ ROOT_CLASS }__btn-icon {
            margin-right: 0.25em;
          }
        }
      }
    }
    
    &__item-toggle {
      width: 1em;
      color: #333;
      border: solid 2px;
      margin: 2px;
      position: relative;
      flex-shrink: 0;
      
      .${ TOGGLE_ROOT_CLASS } {
        
        &__btn {
          padding: 0;
          border: none;
          border-radius: unset;
          display: block;
          position: absolute;
          top: 1px;
          left: 1px;
          bottom: 1px;
          right: 1px;
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
      
      &__ce-fix {
        overflow-x: auto;
        overflow-y: hidden;
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
        border-right: ${ sepBorder };
      }
    }
  }
  
  &.${ MODIFIER__SELECTED } {
    
    .${ ROOT_CLASS } {
      
      &__name {
        opacity: 1;
      }
    }
  }
  
  @media (max-width: 600px) {
    font-size: 3.5vw;
    border-bottom-width: 0.2em;
    margin-bottom: 0.5em;
    
    .${ TOGGLE_ROOT_CLASS } {
      width: 5%;
    }
    
    .${ ROOT_CLASS } {
      
      &__names {
        width: 95%;
        display: block;
      }
    }
    
    &.${ MODIFIER__PREVIEWING } {
      
      .${ ROOT_CLASS } {
        
        &__name,
        &__new-name {
          width: 100%;
          border-left: ${ sepBorder };
          margin-left: 0.1em;
        }
        
        &__name {
          border-right: none;
          border-bottom: ${ sepBorder };
        }
      }
    }
  }
`;