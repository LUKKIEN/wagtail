import React, { Component, PropTypes } from 'react';
import StyleButton, { isActive } from './style-button';


const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();

  return (
    <div className="RichEditor-controls">
      {props.styles.map((type) =>
        <StyleButton
          key={type.label}
          active={isActive(type, editorState, selection)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

export default BlockStyleControls;
