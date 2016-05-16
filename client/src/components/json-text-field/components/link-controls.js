import React, { Component, PropTypes } from 'react';
import LinkChooser from 'components/link-chooser';

import { selectionContains } from '../utils';
import EditorButton from './editor-button';
import { Entity, RichUtils } from 'draft-js';


class LinkControls extends Component {
  constructor() {
    super();

    this.state = {
      showURLInput: false,
      entity: null
    };

    this.promptForLink = this._promptForLink.bind(this);
    this.confirmLink = this._confirmLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.cancelLink = this._cancelLink.bind(this);
  }

  _promptForLink(e) {
    e.preventDefault();
    const {editorState} = this.props;
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {

      let selectionState = editorState.getSelection();
      let selStart = selectionState.getStartOffset();
      let startKey = editorState.getSelection().getStartKey();
      let selectedBlock = editorState
        .getCurrentContent()
        .getBlockForKey(startKey)

      let entity;
      let entityId = selectedBlock.getEntityAt(selStart);

      if (entityId) {
        entity = Entity.get(entityId);
      }

      this.setState({
        showURLInput: true,
        entity : entityId ? entity : null
      });

    }
  }

  _confirmLink(urlValue) {
    const {editorState} = this.props;
    const entityData = urlValue;
    const entityKey = Entity.create(this.props.entityType, 'MUTABLE', entityData);

    let newEditorState = RichUtils.toggleLink(
      editorState,
      editorState.getSelection(),
      entityKey
    );

    this.props.onConfirmLink(newEditorState);

    this.setState({
      showURLInput: false,
    });
  }

  _removeLink(e) {
    e.preventDefault();
    this.props.onRemoveLink();
  }

  _cancelLink(e) {
    e.preventDefault();
    this.setState({
      showURLInput: false,
    });
  }

  render() {
    const {editorState} = this.props;
    let selectionContainsLink = selectionContains(this.props.entityType, this.props.filterFn, editorState);

    let urlInput;
    let urlExpunger;
    let urlAdder;

    if (this.state.showURLInput) {
      const chooserProps = {
        onChange: this.onURLChange,
        value: this.state.urlValue,
        onKeyDown: this.onLinkInputKeyDown,
        confirmLink: this.confirmLink,
        cancelLink: this.cancelLink,
        entity: this.state.entity
      };

      urlInput = <LinkChooser {...chooserProps} />
    }

    if (selectionContainsLink) {
      urlExpunger = (
        <EditorButton onToggle={this.removeLink} label="Remove link" />
      );
    } else {
      urlAdder = (
        <EditorButton onToggle={this.promptForLink} label="Add link" />
      );
    }

    let urlChanger;

    if (selectionContainsLink) {
      urlChanger = (
        <EditorButton onToggle={this.promptForLink} label="Change link" />
      )
    }

    return (
      <div className="RichEditor-controls">
        {urlAdder}
        {urlChanger}
        {urlExpunger}
        {urlInput}
      </div>
    );
  }
}

export default LinkControls;
