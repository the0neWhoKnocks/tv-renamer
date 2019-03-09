import { css } from 'emotion';

export const ROOT_CLASS = 'assign-id';

export default css`
  max-width: 30em;
  overflow: auto;
  
  .${ ROOT_CLASS } {
    
    &__id-input {
      width: 5em;
      text-align: center;
    }
  }
`;