import { css } from 'emotion';

export const MODIFIER__CURRENT = 'is--current';
export const MODIFIER__DATE = 'is--date';
export const MODIFIER__LIST = 'show--list';
export const MODIFIER__SCROLL_LIST = 'scroll--list';
export const ROOT_CLASS = 'version';
const borderStyle = 'solid 1px #aaa';
const currColor = '#a4e4f3';

export default css`
  overflow: auto;

  .${ ROOT_CLASS } {
    
    &__app-version {
      border-radius: 0.25em;
      padding: 0.1em 0.5em;
      margin-left: 0.25em;
      background: ${ currColor };
      display: inline-block;
    }
    
    &__releases {
      width: 25rem;
      height: 1px;
      border-top: ${ borderStyle };
      margin: 1em 0;
      overflow: hidden;
      transition: height 200ms;
      
      &-list {
        width: 100%;
        font-family: monospace;
        table-layout: fixed;
        border-collapse: collapse;
        
        tr {
          &:nth-of-type(even) {
            background: #d4d4d4;
          }
          
          &.${ MODIFIER__CURRENT } {
            background: ${ currColor };
          }
        }
        
        th {
          color: #eee;
          text-align: left;
          padding: 0.25em 0.5em;
          background: #333;
        }
        
        td {
          padding: 0.25em 0.5em;
        }
        
        .${ MODIFIER__DATE } {
          width: 40%;
          white-space: nowrap;
        }
      }
    }
    
    &__btm-nav {
      display: flex;
      
      button {
        width: 50%;
      }
    }
  }
  
  &.${ MODIFIER__LIST } {
    
    .${ ROOT_CLASS } {
      
      &__releases {
        height: 9em;
        border: ${ borderStyle };
      }
    }
  }
  
  &.${ MODIFIER__SCROLL_LIST } {
    
    .${ ROOT_CLASS } {
      
      &__releases {
        overflow-y: auto;
      }
    }
  }
`;