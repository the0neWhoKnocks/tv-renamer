import { css } from 'emotion';

export const MODIFIER__EDITING_NAME = 'editing--name';
export const ROOT_CLASS = 'renamable';

export default css`
  padding: 0.5em 0;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
  position: relative;
  
  &::before {
    content: '';
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #ccc0, #ccc 100%);
    position: absolute;
    bottom: 0;
    z-index: -1;
    transition: transform 300ms;
    transform: translateX(-100%);
  }
  
  &:hover {
    
    &::before {
      transform: translateX(0%);
    }
  }

  > [contenteditable="true"] {
    cursor: text;
    outline: none;
    
    &:focus {
      padding: 0.25em 0.5em;
      border: inset 1px;
      background: white;
    }
  }

  @media (max-width: 600px) {
    font-size: 3.5vw;
  }
  
  &.${ MODIFIER__EDITING_NAME } {
    overflow-x: auto;
    text-overflow: unset;
  }
`;