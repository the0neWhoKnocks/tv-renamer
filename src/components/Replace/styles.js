import { css } from 'emotion';

export const ROOT_CLASS = 'replace';
export const MODIFIER__CLEAR_BTN_VISIBLE = 'cbtn--visible';
const COLOR__TABLE_BORDER = '#555';

const groupColors = ['#a9eaf9', '#ffdbe6', '#bbffd9', '#cdcaff'];

export default css`
  width: calc(80vw - 2em); /* values from Modal */
  max-width: 600px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  
  .${ ROOT_CLASS } {
    
    &__input-wrapper {
      width: 100%;
      position: relative;
      
      button {
        font-size: 0.75em;
        border-radius: unset;
        background: #fff;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      button:hover {
        color: #000;
      }
      
      &.${ MODIFIER__CLEAR_BTN_VISIBLE } input {
        padding-right: 2.5em;
      }
    }
    
    &__helper-btn {
      padding: 0.25em 0.5em;
      border-radius: unset;
      margin-left: 0.25em;
    }
    
    &__labeled-input {
      margin-bottom: 0.25em;
      display: flex;
      align-items: center;
      
      label {
        width: 80px;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      input {
        width: 100%;
        font-size: 1.2em;
        font-family: monospace;
        padding: 0.25em;
        border: solid 1px;
      }
      
      &:nth-of-type(2) {
        
        .${ ROOT_CLASS } {
          &__helper-btn:nth-of-type(1):not([data-for="ndx"]) {
            background: ${ groupColors[0] };
          }
          &__helper-btn:nth-of-type(2):not([data-for="ndx"]) {
            background: ${ groupColors[1] };
          }
          &__helper-btn:nth-of-type(3):not([data-for="ndx"]) {
            background: ${ groupColors[2] };
          }
          &__helper-btn:nth-of-type(4):not([data-for="ndx"]) {
            background: ${ groupColors[3] };
          }
        }
      }
    }
    
    &__help-section {
      color: #888;
      line-height: 1.25em;
      padding: 0.5em;
      border: solid 1px;
      border-radius: 0.25em;
    }
    &__help-section code {
      padding: 1px 2px 3px;
      border: solid 1px;
      background: transparent;
      display: inline;
    }
    
    &__table {
      max-height: 50vh; /* anything above 50 won't account for Mobile keyboard */
      border: solid 2px ${ COLOR__TABLE_BORDER };
      border-radius: 0.25em;
      margin-top: 1em;
      background: #fff;
      display: flex;
      flex-direction: column;
      
      &-body {
        max-height: 70vh;
        overflow-x: hidden;
        overflow-y: auto;
      }
      
      &-row {
        display: flex;
      }
      
      &-data {
        width: 50%;
        word-break: break-all;
        padding: 0.5em;
        border: solid 1px ${ COLOR__TABLE_BORDER };
      }
      
      &-head {
        
        .${ ROOT_CLASS } {
          
          &__table-row {
            background: ${ COLOR__TABLE_BORDER };
          }
          
          &__table-data {
            color: #eee;
            font-size: 1.5em;
            font-family: monospace;
            border-bottom-width: 2px;
          }
          &__table-data:nth-of-type(1) {
            border-right-color: #888;
          }
          &__table-data:nth-of-type(2) {
            border-left-color: #888;
          }
        }
      }
      
      &-body {
        
        .${ ROOT_CLASS } {
          
          &__table-row {
            padding-top: 22px;
            background: #fff;
            position: relative;
            
            &::before {
              content: attr(data-dir);
              color: #868686;
              font-family: monospace;
              padding: 0.25em 0.5em;
              border: solid 1px ${ COLOR__TABLE_BORDER };
              white-space: nowrap;
              justify-content: flex-end;
              overflow: hidden;
              background: #111;
              display: flex;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
            }
          }
          
          &__table-data {
            color: #aaa;
            font-size: 16px;
            font-family: monospace;
            
            mark {
              font-weight: bold;
            }
            &:nth-of-type(1) > mark {
              background: #fff;
              padding: 0.25em;
              border-radius: 0.25em;
              border: solid 1px #b1b1b1;
              
              mark {
                padding: 0 0.25em;
              }
              
              mark[data-ndx="0"] {
                background: ${ groupColors[0] };
              }
              mark[data-ndx="1"] {
                background: ${ groupColors[1] };
              }
              mark[data-ndx="2"] {
                background: ${ groupColors[2] };
              }
              mark[data-ndx="3"] {
                background: ${ groupColors[3] };
              }
            }
            &:nth-of-type(2) mark {
              background: transparent;
            }
          }
        }
      }
    }
    
    &__btm-nav {
      margin-top: 1em;
      display: flex;
      justify-content: space-between;
      
      button {
        width: 49%;
        font-size: 1em;
        padding: 0.5em;
      }
    }
  }
`;