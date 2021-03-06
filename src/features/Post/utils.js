export const getPostKey = function(post) {
  return `${post.author}/${post.permlink}`;
}

export const getPostPath = function(post, prefix = '') {
  return `${prefix}/@${post.author}/${post.permlink}`;
}

export const generatePostKey = function(author, permlink) {
  return `${author}/${permlink}`;
}

export const hasUpdated = function(oldPost, newPost) {
  if (!oldPost || !newPost) {
    return true;
  }

  return (oldPost.active_votes && oldPost.active_votes.length !== newPost.active_votes.length) ||
    Math.abs(oldPost.payout_value - newPost.payout_value) > 0.02 ||
    oldPost.children !== newPost.children;
}

export const sanitizeText = function(text, stripEndDot = false) {
  let t = text.trim().replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  if (stripEndDot) {
    return t.replace(/(\.)$/, '');
  } else {
    return t;
  }
}

export const splitTags = function(string) {
  const DEFAULT_TAG = 'steemhunt';

  return sanitizeText(string)
    .toLowerCase()
    .split(/[,\s]+/)
    .filter((s) => {
      return s; // remove empty values
    })
    .filter((elem, pos, arr) => {
      return arr.indexOf(elem) === pos && arr[pos] !== DEFAULT_TAG; // remove duplicated values
    });
}

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|#|$)", "i");
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  } else {
    var hash =  '';
    if( uri.indexOf('#') !== -1 ){
        hash = uri.replace(/.*#/, '#');
        uri = uri.replace(/#.*/, '');
    }
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    return uri + separator + key + "=" + value + hash;
  }
}

export const addReferral = function(url) {
  url = updateQueryStringParameter(url, 'ref', 'steemhunt');

  return url;
}

export const getCachedImage = function(url, width = 0, height = 0) {
  if (/\.gif$/.test(url)) {
    return `https://steemitimages.com/0x0/${url}`;
  }

  return `https://steemitimages.com/${width}x${height}/${url}`;
}

export const stripCachedURL = function(url) {
  return url.replace(/https:\/\/steemitimages\.com\/\d+x\d+\//, '')
}

export const isEditable = function(post) {
  if (post.cashout_time && post.cashout_time !== '1969-12-31T23:59:59') {
    return true;
  }

  if (post.created_at) {
    const created = new Date(post.created_at).getTime();
    const diffDays = ((new Date()).getTime() - created) / 86400000;

    if (diffDays < 7) {
      return true;
    }
  }

  return false;
}

export const shuffle = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}