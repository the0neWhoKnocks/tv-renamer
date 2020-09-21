import { css } from 'emotion';

export const ROOT_CLASS = 'replace';

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
        font-size: 1em;
        padding: 0.25em;
      }
    }
    
    &__table {
      border: solid 2px;
      border-collapse: collapse;
      margin-top: 1em;
      background: #fff;
      
      td {
        padding: 0.5em;
        border: solid 1px #aaa;
      }
      
      thead td {
        font-weight: bold;
        border-color: #000;
        border-bottom-width: 2px;
      }
      
      tbody tr {
        color: #aaa;
      }
      
      tbody td mark {
        font-weight: bold;
      }
      tbody td:nth-of-type(1) mark {
        background: #d3f7ff;
      }
      tbody td:nth-of-type(2) mark {
        background: transparent;
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