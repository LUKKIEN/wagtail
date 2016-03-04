import React, { Component, PropTypes } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState
} from 'draft-js';


export default class JsonTextField extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    if (this.props.value) {
      const blocks = convertFromRaw(this.props.value);
      this.state.editorState = EditorState.createWithContent(
        ContentState.createFromBlockArray(blocks)
      );
    } else {
      this.state.editorState = EditorState.createEmpty();
    }

    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }

  handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  }

  render() {
    const {editorState} = this.state;

    const state = convertToRaw(editorState.getCurrentContent());
    const json = JSON.stringify(state, null, 4);
    const jsonSmall = JSON.stringify(state);

    return (
      <div className="c-json-text-field">

        <Editor
          editorState={editorState}
          onChange={this.onChange}
          handleKeyCommand={this.handleKeyCommand} />

        <pre>
          {json}
        </pre>

        <input type="hidden" value={jsonSmall} name={this.props.name} />
      </div>
    );
  }
}
