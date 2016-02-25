import React, { Component, PropTypes } from 'react';
import LoadingIndicator from 'components/loading-indicator';
import ExplorerItem from './explorer-item';


class Explorer extends Component {

  constructor(props) {
    super(props);

    this.state = { cursor: null };
  }

  componentDidMount() {
    fetch('/api/v1/pages/?child_of=2')
    .then(res => { return res.json() })
    .then(body => {
      this.setState({
        cursor: body
      });
    });
  }

  componentWillUnmount(cursor) {

  }

  _getPages(cursor) {
    if (!cursor) {
      return [];
    }

    return cursor.pages.map(item =>
      <ExplorerItem key={item.id} title={item.title} data={item} />
    );
  }

  getPosition() {
    const { position } = this.props;
    return {
      left: position.right + 'px',
      top: position.top + 'px'
    }
  },

  render() {
    const { cursor } = this.state;
    const pages = this._getPages(cursor);

    return (
      <div style={this.getPosition()} className="c-explorer">
        {cursor ? pages : <LoadingIndicator />}
      </div>
    );
  }
}

Explorer.propTypes = {
  onPageSelect: PropTypes.func,
  initialPath: PropTypes.string,
  apiPath: PropTypes.string,
  size: PropTypes.number
};

export default Explorer;
