import { css } from 'emotion';

export default css`
  
  .app {
    
    &__nav {
      text-align: right;
      padding: 0.5em;
      background: #333;
      position: sticky;
      top: 0;
    }
    
    &__overlay {
      padding: 1em;
      background: #eee;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.is--visible {
        visibility: visible;
      }
    }
  }
`;