import { css } from 'emotion';

export const MODIFIER__DISABLED = 'is--disabled';
export const ROOT_CLASS = 'toggle';
const BTN_COLOR = '#eee';
const BTN_TOGGLED_COLOR = '#333';

export default css`
  
  .${ ROOT_CLASS } {
    
    &__input {
      position: absolute;
      z-index: -1;
      opacity: 0;

      &:checked + .${ ROOT_CLASS }__btn {
        color: ${ BTN_COLOR };
        background: ${ BTN_TOGGLED_COLOR };
      }
    }
    
    &__btn {
      text-transform: uppercase;
      padding: 1em;
      border: solid 0.2em ${ BTN_TOGGLED_COLOR };
      border-radius: 1em;
      background: ${ BTN_COLOR };
      vertical-align: middle;
      cursor: pointer;
      display: inline-block;
      transition: all 100ms;
      user-select: none;

      * {
        pointer-events: none;
      }
    }
    
    &__content-wrapper {
      pointer-events: none;
    }
  }
  
  &.${ MODIFIER__DISABLED } {
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
  }
`;