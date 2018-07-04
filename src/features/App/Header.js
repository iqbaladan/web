import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getLoginURL } from 'utils/token';
import { Menu, Popover, Icon, Button, Spin, Input, Tooltip } from 'antd';
import {
  selectMe,
  selectMyAccount,
  selectIsLoading,
  selectMyFollowingsLoadStatus,
  selectMyFollowingsList,
  selectMyFollowingsListLoaded
} from 'features/User/selectors';
import { selectSearchTerm, selectMyPostsCountToday } from 'features/Post/selectors';
import { getFollowingsBegin } from 'features/User/actions/getFollowings';
import { followBegin } from 'features/User/actions/follow';
import { logoutBegin } from 'features/User/actions/logout';
import { setSearchTerm } from 'features/Post/actions/searchPost';
import logo from 'assets/images/logo-nav-pink@2x.png'
import AvatarSteemit from 'components/AvatarSteemit';
import { formatNumber } from 'utils/helpers/steemitHelpers';

class Header extends Component {
  static propTypes = {
    me: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    myAccount: PropTypes.object.isRequired,
    myFollowingsLoadStatus: PropTypes.object.isRequired,
    myFollowingsList: PropTypes.array.isRequired,
    myFollowingsListLoaded: PropTypes.bool.isRequired,
    follow: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    getFollowings: PropTypes.func.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    myPostsCountToday: PropTypes.number.isRequired,
  };

  state = {
    menuVisible: false,
    searchVisible: false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.me !== nextProps.me) {
      this.props.getFollowings(nextProps.me);
    }
  }

  changeVisibility = (visible) => this.setState({ menuVisible: visible });

  setSearchVisible = (bool) => {
    this.setState({ searchVisible: bool }, () => {
      if (bool) {
        this.searchInput.focus();
      }
    });
  };

  handleSearch = (e) => this.props.setSearchTerm(e.target.value);

  resetSearch() {
    this.props.setSearchTerm(null);
    this.setSearchVisible(false);
  }

  handleKeyPress = (e) => {
    if (e.keyCode === 27) { // ESC
      this.resetSearch();
    }
  };

  render() {
    const { me, myAccount, myFollowingsList, myFollowingsLoadStatus, isLoading, follow, searchTerm, myPostsCountToday } = this.props;
    const isFollowing = myFollowingsList.find(following => following.following === 'steemhunt');
    const isFollowLoading = isLoading || myFollowingsLoadStatus['steemhunt'];
    const searchBarHidden = (this.props.path === '/wallet' || this.props.path === '/post');

    let menu;
    if(me) {
      menu = (
        <Menu theme="dark">
          {!isFollowing && me !== 'steemhunt' &&
            <Menu.Item key="0">
               <span onClick={follow}>
                <Icon type={isFollowLoading ? 'loading' : 'star-o'} />
                FOLLOW STEEMHUNT
              </span>
            </Menu.Item>
          }

          <Menu.Item key="1">
            <Link to="/hall-of-fame" onClick={() => this.changeVisibility(false)}>
              <Icon type="trophy" /> HALL OF FAME
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to={`/wallet`} onClick={() => this.changeVisibility(false)}>
              <Icon type="wallet" /> WALLET <sup>beta</sup>
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to={`/author/@${me}`} onClick={() => this.changeVisibility(false)}>
              <Icon type="user" /> MY PROFILE (LV. {myAccount.level})
            </Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to={`/author/@${me}`} onClick={() => this.changeVisibility(false)}>
              <Icon type="loading-3-quarters" />
              WEIGHT: x{formatNumber(myAccount.voting_weight * 100, '0,0.0')} /
              VP: {parseInt(myAccount.voting_power / 100, 10)}%
            </Link>
          </Menu.Item>
          <Menu.Item key="5">
            <span onClick={this.props.logout}>
              <Icon type="poweroff" /> LOGOUT
            </span>
          </Menu.Item>
        </Menu>
      );
    } else {
      menu = (
        <Menu theme="dark">
          <Menu.Item key="0" className="two-column-hidden">
            <Link to="/about" onClick={() => this.changeVisibility(false)}>
              <Icon type="question-circle-o" /> ABOUT STEEMHUNT
            </Link>
          </Menu.Item>
          <Menu.Item key="1">
            <Link to="/hall-of-fame" onClick={() => this.changeVisibility(false)}>
              <Icon type="trophy" /> HALL OF FAME
            </Link>
          </Menu.Item>
        </Menu>
      );
    }

    return (
      <header>
        <Link to="/">
          <img src={logo} alt="logo" className="nav-logo"/>
        </Link>

        {isLoading &&
          <div className="pull-right">
            <Spin size="large" className="header-button smaller avatar-steemit" />
          </div>
        }

        {!isLoading && me &&
          <div className="pull-right">
            { myPostsCountToday >= 2 ?
              <Tooltip title="You have already posted 2 products today. Please hunt more tomorrow :)">
                <Button shape="circle" icon="plus"  className="right-margin header-button smaller"/>
              </Tooltip>
            :
              <Link to="/post" className="right-margin header-button smaller">
                <Button shape="circle" icon="plus" />
              </Link>
            }
            <Popover
              content={menu}
              trigger="click"
              placement="bottomRight"
              visible={this.state.menuVisible}
              onVisibleChange={this.changeVisibility}
              overlayClassName="menu-popover"
            >
              <span className="ant-dropdown-link header-button" role="button">
                <AvatarSteemit name={me} votingPower={myAccount.voting_power} />
              </span>
            </Popover>
          </div>
        }

        {!isLoading && !me &&
          <div className="pull-right">
            <a href={getLoginURL()} className="right-margin header-button smaller mobile-hidden">
              <Button shape="circle" icon="plus" />
            </a>
            <Popover
              content={menu}
              trigger="click"
              placement="bottom"
              visible={this.state.menuVisible}
              onVisibleChange={this.changeVisibility}
              overlayClassName="menu-popover"
            >
              <span className="right-margin header-button smaller">
                <Button shape="circle" icon="ellipsis" />
              </span>
            </Popover>

            <Button type="primary" href={getLoginURL()} ghost className="right-margin header-button smaller">Login</Button>
            <Button
              type="primary"
              href="https://signup.steemit.com/?ref=steemhunt"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => window.gtag('event', 'signup_clicked', { 'event_category' : 'signup', 'event_label' : 'Header Button' })}
              className="header-button smaller"
            >
              Sign Up
            </Button>
          </div>
        }

        <div className="pull-right">
          {!searchBarHidden &&
            <Input.Search
              ref={node => this.searchInput = node}
              value={searchTerm}
              placeholder="Search products"
              onSearch={value => this.props.setSearchTerm(value)}
              onChange={this.handleSearch}
              onKeyDown={this.handleKeyPress}
              onBlur={() => this.setSearchVisible(false)}
              maxLength="40"
              className={`header-button smaller one-column-hidden right-margin${this.state.searchVisible ? ' active' : ''}`}
            />
          }
          <Button
            shape="circle"
            icon="search"
            className="header-button smaller right-margin two-column-hidden"
            onClick={() => this.setSearchVisible(true)}
          />

          <Link to="/about" className="header-button smaller right-margin two-column-hidden mobile-hidden">
            <Button shape="circle" icon="question" style={{ fontSize: '21px' }} />
          </Link>
        </div>
      </header>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  me: selectMe(),
  isLoading: selectIsLoading(),
  myAccount: selectMyAccount(),
  myFollowingsLoadStatus: selectMyFollowingsLoadStatus(),
  myFollowingsList: selectMyFollowingsList(),
  myFollowingsListLoaded: selectMyFollowingsListLoaded(),
  searchTerm: selectSearchTerm(),
  myPostsCountToday: selectMyPostsCountToday(),
});

const mapDispatchToProps = (dispatch, props) => ({
  follow: () => dispatch(followBegin('steemhunt')),
  logout: () => dispatch(logoutBegin()),
  getFollowings: me => dispatch(getFollowingsBegin(me)),
  setSearchTerm: (term) => dispatch(setSearchTerm(term)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
