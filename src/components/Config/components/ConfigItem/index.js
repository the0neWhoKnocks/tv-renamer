import React, { Component } from 'react';
import { bool, func, number, oneOfType, shape, string } from 'prop-types';
import styles, {
  MODIFIER__READ_ONLY,
  MODIFIER__REQUIRED,
  ROOT_CLASS,
} from './styles';

class ConfigItem extends Component {
  static getDerivedStateFromProps(props) {
    return { value: props.value };
  }
  
  constructor({ value }) {
    super();
    
    this.state = { value };
    
    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(ev) {
    const { onChange } = this.props;
    
    this.setState({
      value: ev.currentTarget.value,
    }, () => {
      if(onChange) onChange(ev);
    });
  }
  
  render() {
    const {
      data,
      label,
      name,
      readOnly,
      required,
    } = this.props;
    const {
      value,
    } = this.state;
    const dataAttrs = {};
    const inputProps = {
      name,
      readOnly,
      required,
      type: 'text',
    };
    let rootModifier = (readOnly) ? MODIFIER__READ_ONLY : '';
    
    if(readOnly){
      inputProps.defaultValue = value;
    }
    else{
      inputProps.onChange = this.handleChange;
      inputProps.value = value;
    }
    
    if(required) {
      rootModifier += ` ${ MODIFIER__REQUIRED }`;
      inputProps.pattern = '.*\\S+.*';
    }
    
    if(data){
      Object.keys(data).forEach((key) => {
        dataAttrs[`data-${ key }`] = data[key];
      });
    }
    
    return (
      <div 
        className={`${ ROOT_CLASS } ${ styles } ${ rootModifier }`}
        {...dataAttrs}
      >
        <label>{label}</label>
        <input {...inputProps} />
        {required && (
          <div className={`${ ROOT_CLASS }__indicator`} />
        )}
      </div>
    );
  }
}

ConfigItem.defaultProps = {
  value: '',
};
ConfigItem.propTypes = {
  data: shape({}),
  label: string,
  name: string,
  onChange: func,
  readOnly: bool,
  required: bool,
  value: oneOfType([
    number,
    string,
  ]),
};

export default ConfigItem;
export {
  ROOT_CLASS,
};