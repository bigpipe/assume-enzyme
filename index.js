'use strict';

var toString = require('react-element-to-jsx-string');
var beautify = require('html/lib/html');
var cheerio = require('cheerio');
var enzyme = require('enzyme');

//
// The `react-element-to-jsx-string` is converted from an ES6 module to ES5 so
// it has a weird .default syntax.
//
toString = toString.default || toString;


/**
 * Expose the Assume plugin interface.
 *
 * @param {Assume} assume The assume instance.
 * @param {Object} util Utilities provided by assume.
 * @public
 */
module.exports = function plugin(assume, util) {
  var hasOwn = Object.prototype.hasOwnProperty;
  var ShallowWrapper = enzyme.ShallowWrapper;
  var ReactWrapper = enzyme.ReactWrapper;
  var format = util.format;

  //
  // Introduce a new flag.
  //
  assume.flags._anywhere = 'anywhere, somewhere';

  /**
   * Helper function to check if a given value is an enzyme instance.
   *
   * @param {Enzyme} value Possible wrapper.
   * @returns {Boolean} If it's a wrapper.
   * @private
   */
  function isEnzyme(value) {
    return value instanceof ShallowWrapper || value instanceof ReactWrapper;
  }

  /**
   * Transform a wrapper to HTML we could walk through.
   *
   * @param {Enzyme} value Possible wrapper.
   * @returns {Cheerio} Transformed HTML.
   * @private
   */
  function html(value) {
    return cheerio(value.html());
  }

  /**
   * Transform a wrapper of children in to a proper array.
   *
   * @param {Enzyme} wrapper Wrapper
   * @private
   */
  function toArray(wrapper) {
    var result = new Array(wrapper.length);

    wrapper.forEach(function each(node, index){
      result[index] = node;
    });

    return result;
  }

  /**
   * Clean up the HTML like output of the enzyme debug command so it's more
   * human readable in assertion messages.
   *
   * @param {Enzyme} value Enzyme instance
   * @returns {String} Component.
   * @private
   */
  function debug(value) {
    return beautify.prettyPrint(value.debug(), {
      indent_size: 2
    });
  }

  /**
   * Check if anything in the tree matches this.
   *
   * @param {Enzyme} value Wrapper we want to iterate over.
   * @param {Function} fn Iterator.
   * @returns {Boolean} Did we found anything that matched.
   * @private
   */
  function anywhere(value, fn) {
    var children = toArray(value.children());
    var found = false;

    while (children.length) {
      var node = children.shift();
      found = fn(node);

      if (found) break;
      Array.prototype.push.apply(children, toArray(node.children()));
    }

    return found;
  }

  /**
   * Assert that our given value is an enzyme wrapper.
   *
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('enzyme', function enzymes(msg) {
    var value = this.value
      , expect = format('%j to @ be an enzyme instance', value);

    return this.test(isEnzyme(value), msg, expect);
  });

  /**
   * Assert if the wrapper has a given className.
   *
   * @param {String} str Name of the className it should contain.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('className, classNames', function className(str, msg) {
    var value = this.value
      , found = value.hasClass(str)
      , expect = format('`%s` to @ have class %s', value.props().className, str);

    if (!this._anywhere || found) return this.test(found, msg, expect);

    found = anywhere(value, function iterate(node) {
      return node.hasClass(str);
    });

    return this.test(found, msg, expect);
  });

  /**
   * Assert if the wrapper contains a given component/node.
   *
   * @param {String} component The component or node it should have.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('contain, contains', function contain(component, msg) {
    if (!isEnzyme(this.value)) {
      return this.clone(this.value).includes(component, msg);
    }

    var value = this.value
      , found = value.contains(component)
      , expect = format('%s to @ contain %s', debug(value), toString(component));

    if (!this._anywhere || found) return this.test(found, msg, expect);

    found = anywhere(value, function iterate(node) {
      return node.contains(component);
    });

    return this.test(found, msg, expect);
  });

  /**
   * Assert that an element has a given tag name.
   *
   * @param {String} name Tag name it should have.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('tagName', function tagName(name, msg) {
    var value = html(this.value)[0].name
      , expect = format('%s to @ have tag name %s', value, name);

    return this.test(value === name, msg, expect);
  });

  /**
   * Assert that the given component is checked.
   *
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('checked', function checked(msg) {
    var value = html(this.value).is(':checked')
      , expect = format('%s component to @ be checked', debug(this.value));

    return this.test(value, msg, expect);
  });

  /**
   * Assert that the given component is disabled.
   *
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('disabled', function disabled(msg) {
    var value = html(this.value).is(':disabled')
      , expect = format('%s component to @ be disabled', debug(this.value));

    return this.test(value, msg, expect);
  });

  /**
   * Assert that the given component has a ref with the given name.
   *
   * @param {String} name Name of the reference that should be on the component.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('ref', function ref(name, msg) {
    var value = (this.value.instance().refs || {})[name]
      , expect = format('%s component to @ ref %s', debug(this.value), name);

    return this.test(!!value, msg, expect);
  });

  /**
   * Assert props.
   *
   * @param {Array|Object} what Keys, or key/value we want to include.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('props', function props(what, msg) {
    var value = this.value.props()
      , expect = format('%j to @ include props %j', value, what)
      , passed = true;

    if (util.type(what) === 'array') {
      util.each(what, function each(key) {
        passed = hasOwn.call(value, key);

        if (!passed) return false;
      });
    } else {
      var keys = [];

      for (var key in what) {
        keys.push(key);
      }

      util.each(keys, function each(key) {
        passed = util.deep(value[key], what[key]);

        if (!passed) return false;
      });
    }

    return this.test(passed, msg, expect);
  });

  /**
   * Assert that the HTML output of a component includes a given string.
   *
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('html', function htmls(str, msg) {
    var value = html(this.value).outerHTML.replace(/\sdata-reactid+="[^"]+"/g, '');

    return this.clone(value).includes(str, msg);
  });

  /**
   * Assert if the wrapper contains a matching node.
   *
   * @param {String} component The component or node it should have.
   * @param {String} msg Reason of assertion failure.
   * @returns {Assume} The assume instance for chaining.
   * @public
   */
  assume.add('containMatchingElement', function containMatchingElement(component, msg) {
  });

  assume.add('descendants', function descendants(selector, msg) {
  });

  assume.add('exactly', function exactly(value, msg) {
  });

  assume.add('blank, empty', function blank(msg) {
    var value = this.value
      , expect = format('%s to @ be empty', debug(value));

    return this.test(value.isEmpty(), msg, expect);
  });

  assume.add('present', function present(msg) {
  });

  assume.add('html', function html(value, msg) {
  });

  assume.add('id', function id(value, msg) {
  });

  assume.add('match', function match(selector, msg) {
  });
};
