import React, { Component, PropTypes } from 'react';

const keys = {
  ENTER: 13
}


class LinkChooser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      urlValue: props.entity ? props.entity.getData().url : '',
    }

    this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
    this.onURLChange = this._onURLChange.bind(this);
    this.onConfirm = this._onConfirm.bind(this);
  }

  _onURLChange(e) {
    this.setState({
      urlValue: e.target.value
    })
  }

  _onLinkInputKeyDown(e) {
    if (e.which === keys.ENTER) {
      this.props.confirmLink(this.state.urlValue);
    }
  }

  _onConfirm(e) {
    e.preventDefault();
    this.props.confirmLink(this.state.urlValue);
  }

  componentDidMount() {
    this.refs.url.focus();
  }

  render() {
    return (
      <div className="Modal">
        <div className="Modal-content">
          <h2>Link chooser</h2>

          <input
            onChange={this.onURLChange}
            ref="url"
            type="text"
            value={this.state.urlValue}
            onKeyDown={this.onLinkInputKeyDown}
          />
          <div className='Modal-actions'>
            <button onMouseDown={this.onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default LinkChooser;


