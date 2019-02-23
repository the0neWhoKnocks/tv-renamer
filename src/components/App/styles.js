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
      justify-content: center;
      
      &.is--visible {
        visibility: visible;
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
        padding: 0.5rem 1rem;
        margin: 0;
        background: linear-gradient(#eee, #d4d4d4);
        box-shadow: 0 1px 1rem 0.25rem rgba(0, 0, 0, 0.5);
        position: sticky;
        top: 0;
      }
      
      &-items {
        
        &.has--items {
          padding: 1rem;
        }
      }
    }
    
    &__renamable {
      padding: 0.5em 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: default;
      
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
    }
  }
`;