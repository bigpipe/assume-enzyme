import { shallow, mount, render } from 'enzyme';
import assume from 'assume';
import React from 'react';
import assyme from './';

/**
 * Helper function which will render
 *
 * @param {Component} fixture The component we need to render.
 * @param {Object} methods Render methods we want to use.
 * @returns {Function} helper functions.
 * @private
 */
function renderers(fixture, methods) {
  const compile = (name, method, desc, fn) => {
    it(`(${name}): ${desc}`, (next) => {
      const wrapper = method(fixture);

      if (fn.length > 1) return fn(wrapper, next);

      fn(wrapper);
      next();
    });
  };

  //
  // Define a default set of render methods we want to run.
  //
  if (!methods) methods = { shallow };

  return (name, fn) => {
    Object.keys(methods).forEach((key) => {
      compile(key, methods[key], name, fn);
    });
  }
}

describe('assume-enzyme', function () {
  it('works as a plugin', function () {
    assume.use(assyme);
  });

  describe('.enzyme', function () {
    function Fixture() {
      return (
        <strong>Hello World</strong>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.enzyme).is.a('function');
    });

    its('an enzyme instance', function (wrapper) {
      assume(wrapper).is.enzyme();
    });

    it('doesnt think that normal types is enzyme', function () {
      assume('hi').is.not.enzyme();
      assume({}).is.not.enzyme();
      assume([]).is.not.enzyme();
      assume(1).is.not.enzyme();
    });
  });

  describe('.className', function () {
    function Fixture() {
      return (
        <div className='hello world'>
          <span className='single-class-name'></span>
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.className).is.a('function');
      assume(assumed.classNames).is.a('function');
    });

    its('finds multiple classNames on the root node', function (wrapper) {
      assume(wrapper).has.className('hello');
      assume(wrapper).has.className('world');
    });

    its('finds the single className on the child node', function (wrapper) {
      assume(wrapper.find('span')).has.className('single-class-name');
    });

    its('throws assertion errors when it cannot find the class name', function (wrapper, next) {
      assume(wrapper).does.not.have.className('moo');

      try { assume(wrapper).has.className('moo'); }
      catch (e) { return next(); }

      throw new Error('I should fail hard');
    });

    its('finds classNames deeply in the tree using .deep', function (wrapper) {
      assume(wrapper).deeply.has.className('single-class-name');
      assume(wrapper).does.not.deeply.have.className('single-class-names');
    });
  });

  describe('.contains', function () {
    function User(props) {
      return (
        <div className={props.className}>
          hello
        </div>
      );
    }

    function Fixture() {
      return (
        <div className='hello world'>
          <User className='holy' />
          <User className='moly' />
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.contain).is.a('function');
      assume(assumed.contains).is.a('function');
    });

    its('finds the User component', function (wrapper) {
      assume(wrapper).contains(<User className='moly' />);
      assume(wrapper).contains(<User className='holy' />);
      assume(wrapper).does.not.contain(<User className='what' />);
    });
  });

  describe('.tagName', function () {
    function Fixture() {
      return (
        <div>
          <strong>hi</strong>
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.tagName).is.a('function');
    });

    its('comparing tagnames', function (wrapper) {
      assume(wrapper).has.tagName('div');
      assume(wrapper).does.not.have.tagName('strong');
    });
  });

  describe('.checked', function () {
    function Fixture() {
      return (
        <div>
          <input id='checkers' defaultChecked />
          <input id='not-checked' defaultChecked={false} />
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.checked).is.a('function');
    });

    its('sees the input as checked', function (wrapper) {
      assume(wrapper.find('#checkers')).is.checked();
      assume(wrapper.find('#not-checked')).is.not.checked();
    });
  });

  describe('.disabled', function () {
    function Fixture() {
      return (
        <div>
          <input id='disabled' disabled />
          <input id='not-disabled' />
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.checked).is.a('function');
    });

    its('sees the input as checked', function (wrapper) {
      assume(wrapper.find('#disabled')).is.disabled();
      assume(wrapper.find('#not-disabled')).is.not.disabled();
    });
  });

  describe('#props', function () {
    function User(props) {
      return (
        <div>
          hello { props.world }
        </div>
      );
    }

    function Fixture() {
      return (
        <div className='hello world'>
          <User world='moly' more='props' available={ 1 } required />
          <User world='holy' />
        </div>
      );
    }
    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.props).is.a('function');
    });

    its('finding the props of the component', function (wrapper) {
      assume(wrapper.find(User).first()).to.have.props(['world']);
      assume(wrapper.find(User).first()).to.have.props({ 'world': 'moly' });
      assume(wrapper.find(User).first()).to.not.have.props(['hi']);
      assume(wrapper.find(User).first()).to.not.have.props({ world: 'what' });
    });
  });

  describe('#html', function () {
    function Fixture() {
      return (
        <div className='hello world'>
          <span className='what'>is up</span>
        </div>
      );
    }
    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.html).is.a('function');
    });

    its('finding the props of the component', function (wrapper) {
      assume(wrapper).to.have.html('<span class="what">is up</span>');
      assume(wrapper).to.not.have.html('<strong>non existing tag</strong>');
    });
  });
});
