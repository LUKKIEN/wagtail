import React, { Component, PropTypes } from 'react';

import {
  Entity,
  CompositeDecorator,
} from 'draft-js';

export const LINK = 'LINK';

export function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === LINK
      );
    },
    callback
  );
}

export const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url} className='RichEditor-link'>
      {props.children}
    </a>
  );
};


export const linkDecorator = {
    strategy: findLinkEntities,
    component: Link,
}
