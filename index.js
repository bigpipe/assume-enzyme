'use strict';

var toString = require('react-element-to-jsx-string');
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
      , expect = format('`%s` to @ have class %s', value.props().className, str);

    return this.test(value.hasClass(str), msg, expect);
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
      , expect = format('%j to @ contain %s', value.html(), toString(component));

    return this.test(value.contains(component), msg, expect);
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
      , expect = format('component to @ be checked');

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
      , expect = format('component to @ be disabled');

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
      , expect = format('component to @ ref %s', name);

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

  assume.add('blank', function blank(msg) {
  });

  assume.add('present', function present(msg) {
  });

  assume.add('html', function html(value, msg) {
  });

  assume.add('id', function id(value, msg) {
  });

  assume.add('match', function match(selector, msg) {
  });

  assume.add('selected', function selected(msg) {
  });
};
