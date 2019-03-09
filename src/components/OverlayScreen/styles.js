import { css } from 'emotion';

export const ROOT_CLASS = 'overlay-screen';

export default css`
  display: flex;
  justify-content: center;
  background: #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  
  .${ ROOT_CLASS } {
    
    &__body {
      width: 100%;
      height: 100%;
      align-self: center;
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;
      justify-content: center;
    }
    
    &__alignment {
      max-width: 100%;
      overflow: auto;
      margin: auto;
      display: inline-block;
    }
  }
`;