import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();
    
    this.state = {
      loaded: false,
    };
  }
  
  componentDidMount() {
    this.setState({
      loaded: true,
    });
  }
  
  render() {
    const {
      loaded,
    } = this.state;
    
    if(!loaded) return <div>Loading</div>;
    
    return (
      <div>Hello</div>
    );
  }
}

export default App;