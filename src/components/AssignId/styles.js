import { css } from 'emotion';
import {
  DEFAULT_CTA,
  VALID_CTA,
} from 'COMPONENTS/globalStyles';

export const MODIFIER__PROCCESSING = 'is--proccessing';
export const ROOT_CLASS = 'assign-id';

export default css`
  max-width: 30em;
  overflow: auto;
  
  a {
    color: currentColor;
  }
  
  > {
    * {
      margin: 0.75em 0;
    }
  }
  
  .${ ROOT_CLASS } {
    
    &__id-row {
      font-size: 1.5em;
      line-height: 1.5em;
      margin-top: 0;
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
    }
    
    &__search-link {
      color: #4384a2;
      text-align: center;
      padding: 0.5em;
      background: #bdeaf7;
      display: block;
    }
    
    &__matches {
      max-height: 50vh;
      overflow-y: auto;
      background: #333;
    }
    
    &__match {
      padding: 0.25em;
      border-radius: 0.25em;
      margin: 0.5em;
      background: #fff;
      display: flex;
      cursor: pointer;
      
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
`;