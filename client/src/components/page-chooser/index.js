import React, { Component, PropTypes } from 'react';
import { keys, API } from 'config';

const PAGE_API = `${API}pages/`;


class Pagination extends Component {
  render() {
    const {totalResults, max, offset, next, back} = this.props;
    const hasResults = totalResults > 0;

    if (!hasResults) {
      return null;
    }

    return (
      <div>
        {(offset > 0 && totalResults > max) ? <span className='button' onClick={back}>Back</span> : null}
        {(max + offset < totalResults) ? <span className='button' onClick={next}>Next</span> : null}
      </div>
    );
  }
}


function _buildTree(startNode, cb) {
  let apiPage = `${PAGE_API}${startNode}`;
  let path = [];

  function processNode(data) {
    path.push(data);

    if (data.meta.parent) {
        $.get(data.meta.parent.meta.detail_url, processNode);
    } else {
      cb(path.reverse());
    }
  }

  $.get(apiPage, processNode);
  return path;
}



class PageChooser extends Component {

  constructor(props) {
    super(props);

    let start = 4;

    this.state = {
      defaultMaxResults: 5,
      startNode: start,
      path: [],
      nodePath: [],
      nodes: {},
      offset: 0,
    }

    this.getPage = this._getPage.bind(this);
    this.onGetPage = this._onGetPage.bind(this);
    this.getChildrenOf = this._getChildrenOf.bind(this);
    this.getMaxResults = this._getMaxResults.bind(this);
    this.next = this._next.bind(this);
    this.back = this._back.bind(this);
    this.pop = this._pop.bind(this);
  }

  componentDidMount() {
    let {startNode} = this.state;

    this.setState({
      currentNode: startNode,
    }, () => {
      _buildTree(startNode, (rootPath) => {
        this.setState({
          nodePath: rootPath,
          path: rootPath.map(item => { return item.id })
        }, () => {
          this.getPage(startNode);
        })
      });
    });
  }

  _getMaxResults() {
    const {maxResults} = this.props;
    const {defaultMaxResults} = this.state;
    return maxResults ? maxResults : defaultMaxResults;
  }

  _getPage(page, newOffset) {
    let {path, offset} = this.state;
    let index = path.indexOf(page);
    let maxResults = this.getMaxResults();

    if (index === -1) {
      path.push(page);
    } else if (page !== this.state.currentNode) {
      path.splice(index, 1);
    }

    if (typeof(newOffset) === 'number') {
      offset = newOffset
    }

    let api = this.constructUrl(PAGE_API, page, maxResults, offset);

    $.get(api, (data) => {
      this.onGetPage(data, page, path, newOffset);
    });

  }

  constructUrl(api, page, limit, offset) {
    return `${api}?child_of=${page}&limit=${limit}&offset=${offset}`;
  }

  _onGetPage(data, page, path, newOffset) {
    const nodes = this.state.nodes;
    let offset = typeof newOffset === 'number' ? newOffset : this.state.offset;
    nodes[page] = data;

    this.setState({
      nodes,
      path,
      offset,
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

  _pop() {
    const {path} = this.state;
    let previous = path.pop();
    previous = path.pop();
    this.getPage(previous, 0);
  }

  onPick(id) {
    this.props.onUpdate({
      type: 'page',
      link: id,
      target: 'default'
    }, true);
  }

  render() {
    const {offset, path} = this.state;
    const max = this.getMaxResults();
    const current = path[path.length-1];
    const children = this.getChildrenOf(current);
    const prev = path[path.length-2];

    let nodes = [];
    let totalResults = 0;

    if (children) {
      nodes = children.items.map(child => {
        return (
          <div>
            {child.title}
            {child.meta.children.count ? <span onClick={this.getPage.bind(this, child.id, 0)}>[ children ]</span> : null}
            <span onClick={this.onPick.bind(this, child.id)}>[ select ]</span>
          </div>
        );
      });

      totalResults = children.meta.total_count;
    }

    let paginationProps = {
      totalResults,
      max,
      offset,
      next: this.next,
      back: this.back,
    }

    return (
      <div>
        {this.isAtRoot() ? null : <div onClick={this.pop}>.. Up</div>}
        {nodes}
        <Pagination {...paginationProps} />
      </div>
    );
  }
}


PageChooser.displayName = 'PageChooser';

export default PageChooser;
