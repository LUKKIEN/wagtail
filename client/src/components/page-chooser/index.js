import React, { Component, PropTypes } from 'react';
import { keys, API } from 'config';

const PAGE_API = `${API}pages/`;


class PageChooser extends Component {

  constructor(props) {
    super(props);

    this.state = {
      defaultMaxResults: 5,
      startNode: 2,
      currentNode: 2,
      path: [],
      children: { items: [] },
      nodes: {},
      offset: 0,
    }

    this.getPage = this._getPage.bind(this);
    this.onGetPage = this._onGetPage.bind(this);
    this.getChildrenOf = this._getChildrenOf.bind(this);
    this.getMaxResults = this._getMaxResults.bind(this);
    this.next = this._next.bind(this);
    this.back = this._back.bind(this);
  }

  componentDidMount() {
    this.getPage(this.state.startNode);
  }

  _getMaxResults() {
    const {maxResults} = this.props;
    const {defaultMaxResults} = this.state;
    return maxResults ? maxResults : defaultMaxResults;
  }

  _getPage(page) {
    let {path, offset} = this.state;
    let index = path.indexOf(page);
    let maxResults = this.getMaxResults();

    if (index === -1) {
      path.push(page);
    } else if (page !== this.state.currentNode) {
      path.splice(index, 1);
    }

    $.get(`${PAGE_API}?child_of=${page}&limit=${maxResults}&offset=${offset}`, (data) => {
      this.onGetPage(data, page, path);
    });
  }

  _onGetPage(data, page, path) {
    const nodes = this.state.nodes;
    nodes[page] = data;

    this.setState({
      nodes,
      path,
      currentNode: page,
    });
  }

  _getChildrenOf(index) {
    return this.state.nodes[index];
  }

  isAtRoot() {
    return this.state.path.length === 1;
  }

  _next() {
    let {offset, currentNode} = this.state;
    let maxResults = this.getMaxResults();

    this.setState({
      offset: offset + maxResults
    }, () => {
      this.getPage(currentNode);
    })
  }

   _back() {
    let {offset, currentNode} = this.state;
    let maxResults = this.getMaxResults();
    let newOffset = offset - maxResults;

    if (newOffset < 0) {
      newOffset = 0;
    }

    this.setState({
      offset: newOffset
    }, () => {
      this.getPage(currentNode);
    })
  }

  render() {
    const {offset, path} = this.state;
    const max = this.getMaxResults();
    const prev = path[path.length-1];
    const children = this.getChildrenOf(prev);

    let nodes = [];
    let totalResults = 0;

    if (children) {
      nodes = children.items.map(child => {
        return <div onClick={this.getPage.bind(this, child.id)}>{child.title}</div>
      });

      totalResults = children.meta.total_count;
    }

    let prevNode = null;

    if (prev && !this.isAtRoot()) {
      prevNode = <div onClick={this.getPage.bind(this, prev)}>Back</div>
    }

    return (
      <div>
        {prevNode}
        {nodes}
        {(totalResults > 0 && max + offset < totalResults) ? <div onClick={this.next}>Next</div> : null}
        {(totalResults > 0 && offset > 0) ? <div onClick={this.back}>Back</div> : null}
      </div>
    );
  }
}


PageChooser.displayName = 'PageChooser';

export default PageChooser;
