import { css } from 'emotion';

export default css`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;

  .config {
    
    &__item {
      margin: 0.5em 0;
      
      label {
        min-width: 7em;
        display: inline-block;
      }
      
      input {
        display: inline-block;
      }
    }
    
    &__msg {
      padding: 1em;
      margin: 0.5em 0;
      background: #eee;
      
      &.is--error {
        background: #ffa8a8;
      }
    }
    
    &__btm-nav {
      text-align: center;
      padding: 0.5em;
      
      button {
        padding: 0.5em 1em;
        margin: 0 0.5em;
      }
    }
  }
`;