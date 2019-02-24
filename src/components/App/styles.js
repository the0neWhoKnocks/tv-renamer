import { css } from 'emotion';

export default css`
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .app {
    
    &__nav {
      text-align: right;
      background: #333;
      
      button {
        color: #ddd;
        padding: 0.5rem 1rem;
        border: none;
        border-left: solid 1px #666;
        background: transparent;
      }
    }
    
    &__body {
      display: flex;
      flex-direction: column;
    }
    
    &__section {
      overflow-y: auto;
      
      &:nth-of-type(2) {
        max-height: 25%;
        flex-shrink: 0;
      }
      
      &-title {
        box-shadow: 0 1px 1rem 0.25rem rgba(0, 0, 0, 0.5);
        position: sticky;
        top: 0;
        z-index: 1;
        
        h2 {
          background: linear-gradient(#eee, #d4d4d4);
          padding: 0.5rem 1rem;
          margin: 0;
        }
        
        nav {
          text-align: right;
          background: #666;
          
          button {
            color: #ddd;
            padding: 0.5em 1em;
            border: none;
            border-left: solid 1px #888;
            background: transparent;
          }
        }
      }
      
      &-items {
        
        &.has--items {
          padding: 1rem;
        }
      }
    }
  }
`;