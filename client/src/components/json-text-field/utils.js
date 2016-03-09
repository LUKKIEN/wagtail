const NO_MATCH = 0;
const PARTIAL_MATCH = 1;
const EXACT_MATCH = 2;

export function selectionContains(entityType, filterFn, editorState) {
  var hasEntity = NO_MATCH;
  var selectionState = editorState.getSelection();
  var selStart = selectionState.getStartOffset();
  var selEnd = selectionState.getEndOffset();

  var startKey = editorState.getSelection().getStartKey();
  var selectedBlock = editorState
    .getCurrentContent()
    .getBlockForKey(startKey)

  filterFn(selectedBlock, (start, end) => {
    if (start >= selStart && end <= selEnd) {
      hasEntity = PARTIAL_MATCH;

      if (start === selStart && end === selEnd) {
        hasEntity = EXACT_MATCH;
      }
    }
  });

  return hasEntity;
}
