import { css } from 'emotion';
import {
  DEFAULT_CTA,
  VALID_CTA,
} from 'COMPONENTS/globalStyles';

export const MODIFIER__INACTIVE = 'is--inactive';
export const MODIFIER__PROCCESSING = 'is--proccessing';
export const ROOT_CLASS = 'assign-id';

export default css`
  max-width: 30em;
  overflow: auto;
  
  a {
    color: currentColor;
  }
  
  > {
    :not(:last-child) {
      margin-bottom: 0.75em;
    }
  }
  
  .${ ROOT_CLASS } {
    
    &__id-row {
      font-size: 1.5em;
      line-height: 1.5em;
      display: flex;
      align-items: center;
    }
    
    &__show-name {
      width: 100%;
      text-align: center;
    }
    
    &__id-input {
      width: 5em;
      font-size: 1em;
      text-align: center;
      opacity: 0.5;
    }
    
    &__search-link {
      color: #4384a2;
      text-align: center;
      padding: 0.5em;
      background: #bdeaf7;
      display: block;
    }
    
    &__search-bar {
      font-size: 1.4rem;
      margin-bottom: 0;
      display: flex;
      align-items: center;
      
      * {
        font-family: monospace;
      }
      
      input {
        width: 100%;
        height: 2em;
        font-size: 1em;
        text-align: center;
        padding: 0 0.5em;
        border: solid 1px;
        border-radius: 0.25em 0 0 0;
      }
      
      button {
        width: 10.9em;
        height: 2em;
        padding: 0 1em;
        border-left: none;
        border-radius: 0 0.25em 0 0;
      }
    }
    
    &__no-results,
    &__matches {
      border-radius: 0 0 0.25em 0.25em;
      background: linear-gradient(0deg, #333, #000);
    }
    
    &__no-results {
      color: #ccc;
      text-align: center;
      padding: 1em;
      
      span {
        color: #8cd8ef;
      }
    }
    
    &__matches {
      max-height: 50vh;
      overflow-y: auto;
    }
    
    &__match {
      padding: 0.25em;
      border-radius: 0.25em;
      margin: 0.5em;
      background: #fff;
      display: flex;
      cursor: pointer;
      
      &:hover {
        box-shadow: 0 0 0 4px inset #38b9de;
      }
      
      * {
        pointer-events: none;
        user-select: none;
      }
      
      &-img {
        width: 100px;
        height: 150px;
        background: #aaa;
        display: block;
        flex-shrink: 0;
      }
      
      &-copy {
        padding-left: 0.5em;
        display: flex;
        flex-direction: column;
      }
      
      &-title {
        font-weight: bold;
      }
      
      &-desc {
        height: 100%;
        max-height: 8.6em;
        font-size: 0.9em;
        overflow: hidden;
        margin-top: 0.5em;
        position: relative;
        
        &::after {
          content: '';
          height: 2em;
          background: linear-gradient(transparent, #fff);
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
      }
    }
    
    &__nav {
      margin-bottom: 0;
      display: flex;
      position: relative;
    }
    
    &__confirm-btn,
    &__assign-btn {
      ${ DEFAULT_CTA }
      width: 50%;
    }
    
    &__confirm-btn {
      border-radius: 0.25em 0 0 0.25em;
      border-right: none;
    }
    
    &__assign-btn {
      border-radius: 0 0.25em 0.25em 0;
      
      &:not(:disabled) {
        ${ VALID_CTA }
      }
    }
  }
  
  .indicator__wrapper {
    color: #666;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  &.${ MODIFIER__PROCCESSING } {
    
    .${ ROOT_CLASS } {
      
      &__apply-btn {
        color: transparent;
      }
    }
  }
  
  .${ MODIFIER__INACTIVE } {
    opacity: 0.25;
    user-select: none;
  }
`;