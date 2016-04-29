const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
  {label: 'Strikethrough', style: 'STRIKETHROUGH'},
];


const _config = {
  BLOCK_TYPES: window.BLOCK_TYPES || BLOCK_TYPES,
  INLINE_STYLES: window.INLINE_STYLES || INLINE_STYLES
};


export default {
  get(keyname, _default) {

    if (_default) {
      return _config[keyname] || _default;
    }

    return _config[keyname] || null;
  }
}
