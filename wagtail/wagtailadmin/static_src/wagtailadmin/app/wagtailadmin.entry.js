import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Explorer, { store } from 'components/explorer';
import ExplorerToggle from 'components/explorer/toggle';


document.addEventListener('DOMContentLoaded', e => {
  const top = document.querySelector('.wrapper');
  const div = document.createElement('div');
  const trigger = document.querySelector('[data-explorer-menu-url]');

  let rect = trigger.getBoundingClientRect();
  let triggerParent = trigger.parentNode;
  let label = trigger.innerText;

  top.parentNode.appendChild(div);

  ReactDOM.render((
      <Provider store={store}>
        <ExplorerToggle label={label} />
      </Provider>
    ),
    triggerParent
  );

  ReactDOM.render(
    <Provider store={store}>
      <Explorer type={'sidebar'} top={0} left={rect.right} defaultPage={1} />
    </Provider>,
    div
  );

});
