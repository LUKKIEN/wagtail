import React, { Component, PropTypes } from 'react';
import { keys } from 'config';

const API = '/admin/api/v2beta/pages/';



class TabbedInterface extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: 0
    }

    this.selectTab = this._selectTab.bind(this);
  }

  _selectTab(index) {
    this.setState({
      selectedTab: index
    });
  }

  render() {
    const {selectedTab} = this.state;
    const {children} = this.props;

    const tabNames = children.map(child => {
      return child.props.title;
    });

    const child = children.find((child, index) => {
      return index === selectedTab
    });

    return (
      <div className=''>
        <div className="Modal-header Modal-header-tab t-header -background">
          <h2 className="u-color-current">Choose a link</h2>
          <div className="c-tabs">
            {tabNames.map((name, index) => {
              const className = selectedTab === index ? 'c-tabs__item c-tabs__item--selected' : 'c-tabs__item';
              return <span key={index} className={className} onClick={this.selectTab.bind(this, index)}>{name}</span>
            })}
          </div>
        </div>
        <div className="Modal-body c-tabs__content">
          {child}
        </div>
      </div>
    );
  }
}



class Tab extends Component {
  render() {
    return <div>{this.props.children}</div>
  }
}


class BasicChooser  extends Component {
  constructor(props) {
    super(props);

    this.state = {
      urlValue: props.entity ? props.entity.getData().url : '',
    }

    this.onLinkInputKeyDown = this._onLinkInputKeyDown.bind(this);
    this.onURLChange = this._onURLChange.bind(this);
  }

  componentDidMount() {
    this.refs.url.focus();
  }

  _onURLChange(e) {
    this.setState({
      urlValue: e.target.value
    }, () => {
      this.props.onUpdate(this.state.urlValue)
    })
  }

  _onLinkInputKeyDown(e) {
    if (e.which === keys.ENTER) {
      this.props.confirmLink(this.state.urlValue);
    }
  }

  render() {

    return (
      <input
        onChange={this.onURLChange}
        ref="url"
        type="text"
        value={this.state.urlValue}
        onKeyDown={this.onLinkInputKeyDown}
      />
    );
  }
}


class ExternalLinkChooser extends BasicChooser {
  render() {
    return (
      <div>
        <h3>
          Pick an external link:
        </h3>
        <input
          onChange={this.onURLChange}
          ref="url"
          type="text"
          value={this.state.urlValue}
          onKeyDown={this.onLinkInputKeyDown}
        />
      </div>
    );
  }
}


class EmailChooser extends BasicChooser {
  render() {

    return (
      <div>
        <h3>
          Pick an email link:
        </h3>
        <input
          onChange={this.onURLChange}
          ref="url"
          type="email"
          value={this.state.urlValue}
          onKeyDown={this.onLinkInputKeyDown}
        />
      </div>
    );
  }
}


class PageChooser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startNode: 2,
      currentNode: 2,
      path: [2],
      children: { items: [] },
      nodes: {}
    }

    this.getPage = this._getPage.bind(this);
    this.onGetPage = this._onGetPage.bind(this);
  }

  componentDidMount() {
    this.getPage(this.state.startNode);
  }

  _getPage(page) {
    let path = this.state.path;

    if (path.indexOf(page) < 0) {
      path.push(page)
    } else {
      path.splice(path.indexOf(page), 1);
    }

    this.setState({
      currentNode: page,
      path: path,
    }, () => {
      $.get(`${API}?child_of=${page}`, this.onGetPage);
    })
  }

  _onGetPage(data) {
    const nodes = this.state.nodes;
    nodes[this.state.currentNode] = data;

    this.setState({
      nodes
    });
  }

  render() {
    const children = this.state.children;
    const prev = this.state.path[this.state.path.length-1];

    let nodes = [];

    if (children) {
      nodes = children.items.map(child => {
        return <div onClick={this.getPage.bind(this, child.id)}>{child.title}</div>
      });
    }

    let prevNode = null;

    if (prev) {
      prevNode = <div onClick={this.getPage.bind(this, prev)}>Back</div>
    }

    return (
      <div>
        {prevNode}
        {nodes}
      </div>
    );
  }
}


class MediaChooser extends Component {
  constructor(props) {
    super(props);
    this.state = {}

  }

  render() {
    return (
      <div>
        [MEDIA CHOOSER]
      </div>
    );
  }
}



class DocumentChooser extends MediaChooser {

}


class ImageChooser extends MediaChooser {

}





class LinkChooser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: null
    };
    this.onConfirm = this._onConfirm.bind(this);
    this.onCancel = this._onCancel.bind(this);
  }

  _onConfirm(e) {
    e.preventDefault();
    this.props.confirmLink(this.state.link);
  }

  _onCancel(e) {
    e.preventDefault();
    this.props.cancelLink(e);
  }

  onUpdate(link) {
    this.setState({link});
  }

  getChoosers() {
    return [
      { name: 'External Link', type: ExternalLinkChooser },
      { name: 'Page', type: PageChooser },
      { name: 'Document', type: DocumentChooser },
      { name: 'Email', type: EmailChooser },
    ];
  }

  render() {
    const chooserTypes = this.props.choosers || this.getChoosers();

    return (
      <div className="Modal">
        <div className="Modal-content">
          <TabbedInterface>
            {chooserTypes.map(chooser => {
              const props = {
                onUpdate: this.onUpdate,
                entity: this.props.entity,
              }

              const item = React.createElement(chooser.type, props);
              return (
                <Tab title={chooser.name}>
                  {item}
                </Tab>
              );
            })}
          </TabbedInterface>
          <div className='Modal-body Modal-actions'>
            <button className='button' onMouseDown={this.onConfirm}>
              Confirm
            </button>
            <button className='button button-secondary' onMouseDown={this.onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default LinkChooser;


