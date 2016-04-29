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
  AtomicBlockUtils,
} from 'draft-js';


import StyleButton from './components/style-button';
import LinkControls from './components/link-controls';
import BlockStyleControls from './components/block-style-controls';
import InlineStyleControls from './components/inline-style-controls';

import config from './config';
import { selectionContains } from './utils';
import { LINK, findLinkEntities, Link, linkDecorator } from './entities/link';



export default class JsonTextField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: this.getEditorState(this.props.value)
    };

    this.onChange = (editorState) => this.setState({editorState});
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.handleTabCommand = this._handleTabCommand.bind(this);
    this.onConfirmLink = this._onConfirmLink.bind(this);
    this.onRemoveLink = this._onRemoveLink.bind(this);
    this.addMedia = this._addMedia.bind(this);
    this.addImage = this._addImage.bind(this);
  }

  getEditorState(value) {
    if (value) {
      const blocks = convertFromRaw(value);

      return EditorState.createWithContent(
        blocks,
        this.getDecorators()
      );
    } else {
      return EditorState.createEmpty(this.getDecorators());
    }
  }

  getDecorators() {
    const decorators = [linkDecorator];
    const compositeDecorator = new CompositeDecorator(decorators);
    return compositeDecorator;
  }

  componentDidMount() {
    this.refs.editor.focus();
  }

  updateState(state) {
    this.onChange(state);
    setTimeout(() => this.refs.editor.focus(), 0);
    return true;
  }

  _handleTabCommand(event) {
    const {editorState} = this.state;
    const newState = RichUtils.onTab(event, editorState);

    if (newState) {
      return this.updateState(newState);
    }

    return false;
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      return this.updateState(newState);
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

  _addMedia(type) {
    const src = window.prompt('Enter a URL');

    if (!src) {
      return;
    }

    const entityKey = Entity.create(type, 'IMMUTABLE', {src});

    return AtomicBlockUtils.insertAtomicBlock(
      this.state.editorState,
      entityKey,
      ' '
    );
  }

  _addImage() {
    const state = this.addMedia('image')
    if (state) {
      this.onChange(state);
    }
  }

  getStyleMap() {
    const styleMap = {
      'STRIKETHROUGH': {
        textDecoration: 'line-through',
      },
    };

    return styleMap;
  }


  getBlockClassName(block) {
    switch (block.getType()) {
      case 'blockquote':
        return 'RichEditor-blockquote';
      default:
        return null;
    }
  }

  blockRenderer(contentBlock) {
    const type = contentBlock.getType();

    switch (type) {
      case 'atomic':
        return {
          component: MediaComponent,
          editable: false,
          props: {
            foo: 'bar',
          },
        };

      default:
        return null;
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
          styles={config.get('BLOCK_TYPES')}
          editorState={editorState}
          onToggle={this.toggleBlockType}
        />

        <Button onClick={this.addImage} label='Add image' style='image' />

        <LinkControls
          editor={this.refs.editor}
          editorState={editorState}
          onConfirmLink={this.onConfirmLink}
          onRemoveLink={this.onRemoveLink}
          entityType={LINK}
          filterFn={findLinkEntities}  />

        <InlineStyleControls
          styles={config.get('INLINE_STYLES')}
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
        />

        <Editor
          ref="editor"
          editorState={editorState}
          onChange={this.onChange}
          onTab={this.handleTabCommand}
          handleKeyCommand={this.handleKeyCommand}
          spellCheck={true}
          customStyleMap={this.getStyleMap()}
          blockStyleFn={this.getBlockClassName}
          blockRendererFn={this.blockRenderer}
           />

        <pre>
          {json}
        </pre>

        <input type="hidden" value={jsonSmall} name={this.props.name} />
      </div>
    );
  }
}


const MediaComponent = (props) => {
  const entity = Entity.get(props.block.getEntityAt(0));
  const {src, alt} = entity.getData();
  const type = entity.getType();

  return (
    <div>
      <img src={src} alt={alt ? alt : props.foo} />
    </div>
  );
}

const Button = (props) => {
  let className = 'RichEditor-styleButton';
  return <span className={className} onClick={props.onClick}>{props.label}</span>
}
