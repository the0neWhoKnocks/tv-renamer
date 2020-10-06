import { css } from 'emotion';

export const ROOT_CLASS = 'replace';
const COLOR__TABLE_BORDER = '#555';

export default css`
  width: calc(80vw - 2em); /* values from Modal */
  max-width: 600px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  
  .${ ROOT_CLASS } {
    
    &__labeled-input {
      margin-bottom: 0.25em;
      display: flex;
      align-items: center;
      
      label {
        width: 90px;
        font-weight: bold;
      }
      
      input {
        width: 100%;
        font-size: 1.2em;
        font-family: monospace;
        padding: 0.25em;
      }
    }
    
    &__table {
      max-height: 70vh;
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
            &:nth-of-type(1) mark {
              background: #d3f7ff;
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