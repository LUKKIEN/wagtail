import React from 'react';
import ReactDOM from 'react-dom';
import JsonTextField from 'components/json-text-field';


document.addEventListener('DOMContentLoaded', e => {
  console.log('hello');
  const FIELD_SELECTOR = '[data-json-text-field]';
  const jsonFields = Array.prototype.slice.call(document.querySelectorAll(FIELD_SELECTOR));

  jsonFields.forEach(field => {
    let value = field.getAttribute('value');
    let name = field.getAttribute('name');
    let data = JSON.parse(value);

    ReactDOM.render(<JsonTextField name={name} value={data} />, field.parentNode);
  });
});
