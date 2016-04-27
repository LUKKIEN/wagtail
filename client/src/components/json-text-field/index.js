import React, { Component, PropTypes } from 'react';

import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  CompositeDecorator,
  Entity,
} from 'draft-js';

import StyleButton from './components/style-button';
import LinkControls from './components/link-controls';

import { selectionContains } from './utils';
import { LINK, findLinkEntities, Link, linkDecorator } from './entities/link';


function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}



export default class JsonTextField extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    if (this.props.value) {
      const blocks = convertFromRaw(this.props.value);
      this.state.editorState = EditorState.createWithContent(
        ContentState.createFromBlockArray(blocks),
        linkDecorator
      );
    } else {
      this.state.editorState = EditorState.createEmpty(linkDecorator);
    }

    this.onChange = (editorState) => this.setState({editorState});
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.onConfirmLink = this._onConfirmLink.bind(this);
    this.onRemoveLink = this._onRemoveLink.bind(this);
  }

  componentDidMount() {
    this.refs.editor.focus();
  }

  _handleKeyCommand(command) {
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
      setTimeout(() => this.refs.editor.focus(), 0);

      return true;
    }

    return false;
  }


  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _onConfirmLink(editorState) {
    this.setState({editorState}, () => {
      setTimeout(() => this.refs.editor.focus(), 0);
    })
  }

  _onRemoveLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }


  render() {
    const {editorState} = this.state;

    const state = convertToRaw(editorState.getCurrentContent());
    const json = JSON.stringify(state, null, 4);
    const jsonSmall = JSON.stringify(state);

    return (
      <div className="c-json-text-field">

        <BlockStyleControls
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />

        <LinkControls
          editor={this.refs.editor}
          editorState={editorState}
          onConfirmLink={this.onConfirmLink}
          onRemoveLink={this.onRemoveLink}
          entityType={LINK}
          filterFn={findLinkEntities}  />

        <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />
        <Editor
          ref="editor"
          editorState={editorState}
          onChange={this.onChange}
          onTab={this.handleKeyCommand}
          handleKeyCommand={this.handleKeyCommand}
          spellCheck={true} />

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





const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

