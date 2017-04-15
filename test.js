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
    function FixtureEnzyme() {
      return (
        <strong>Hello World</strong>
      );
    }

    const enzymeWrapper = renderers(<FixtureEnzyme />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.enzyme).is.a('function');
    });

    enzymeWrapper('an enzyme instance', function (wrapper) {
      assume(wrapper).is.enzyme();
    });

    enzymeWrapper('doesnt think that normal types is enzyme', function () {
      assume('hi').is.not.enzyme();
      assume({}).is.not.enzyme();
      assume([]).is.not.enzyme();
      assume(1).is.not.enzyme();
    });
  });

  describe('.className', function () {
    function FixtureClassName() {
      return (
        <div className='hello world'>
          <span className='single-class-name'></span>
        </div>
      );
    }

    const classNameWrapper = renderers(<FixtureClassName />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.className).is.a('function');
      assume(assumed.classNames).is.a('function');
    });

    classNameWrapper('finds multiple classNames on the root node', function (wrapper) {
      assume(wrapper).has.className('hello');
      assume(wrapper).has.className('world');
    });

    classNameWrapper('finds the single className on the child node', function (wrapper) {
      assume(wrapper.find('span')).has.className('single-class-name');
    });

    classNameWrapper('throws assertion errors when it cannot find the class name', function (wrapper, next) {
      assume(wrapper).does.not.have.className('moo');

      try { assume(wrapper).has.className('moo'); }
      catch (e) { return next(); }

      throw new Error('I should fail hard');
    });

    classNameWrapper('finds classNames deeply in the tree using .anywhere', function (wrapper) {
      assume(wrapper).anywhere.has.className('single-class-name');
      assume(wrapper).does.not.anywhere.have.className('single-class-names');
    });
  });

  describe('.contains', function () {
    function UserContainer(props) {
      return (
        <div className={props.className}>
          hello
        </div>
      );
    }

    function FixtureContainer() {
      return (
        <div className='hello world'>
          <UserContainer className='holy' />
          <UserContainer className='moly' />
        </div>
      );
    }

    function Anywhere() {
      return (
        <div className='hello world'>
          <div id='we' className='need to go'>
            <div className='deeper'>
              <UserContainer className='holy' />
            </div>
          </div>
        </div>
      );
    }

    const containerWrapper = renderers(<FixtureContainer />);
    const containerAnywhere = renderers(<Anywhere />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.contain).is.a('function');
      assume(assumed.contains).is.a('function');
    });

    containerWrapper('finds the User component', function (wrapper) {
      assume(wrapper).contains(<UserContainer className='moly' />);
      assume(wrapper).contains(<UserContainer className='holy' />);
      assume(wrapper).does.not.contain(<UserContainer className='what' />);
    });

    containerAnywhere('finds User component deeply in the tree using .anywhere', function (wrapper) {
      assume(wrapper).anywhere.contains(<UserContainer className='holy' />);
      assume(wrapper).does.not.anywhere.contain(<UserContainer className='holys' />);
    });
  });

  describe('.tagName', function () {
    function FixtureTagName() {
      return (
        <div>
          <strong>hi</strong>
        </div>
      );
    }

    const tagNameWrapper = renderers(<FixtureTagName />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.tagName).is.a('function');
    });

    tagNameWrapper('comparing tagnames', function (wrapper) {
      assume(wrapper).has.tagName('div');
      assume(wrapper).does.not.have.tagName('strong');
    });
  });

  describe('.checked', function () {
    function FixtureChecked() {
      return (
        <div>
          <input id='checkers' defaultChecked />
          <input id='not-checked' defaultChecked={false} />
        </div>
      );
    }

    const checkedWrapper = renderers(<FixtureChecked />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.checked).is.a('function');
    });

    checkedWrapper('sees the input as checked', function (wrapper) {
      assume(wrapper.find('#checkers')).is.checked();
      assume(wrapper.find('#not-checked')).is.not.checked();
    });
  });

  describe('.disabled', function () {
    function FixtureDisabled() {
      return (
        <div>
          <input id='disabled' disabled />
          <input id='not-disabled' />
        </div>
      );
    }

    const disabledWrapper = renderers(<FixtureDisabled />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.checked).is.a('function');
    });

    disabledWrapper('sees the input as checked', function (wrapper) {
      assume(wrapper.find('#disabled')).is.disabled();
      assume(wrapper.find('#not-disabled')).is.not.disabled();
    });
  });

  describe('#props', function () {
    function UserProps(props) {
      return (
        <div>
          hello { props.world }
        </div>
      );
    }

    function FixtureProps() {
      return (
        <div className='hello world'>
          <UserProps world='moly' more='props' available={ 1 } required />
          <UserProps world='holy' />
        </div>
      );
    }

    const propWrapper = renderers(<FixtureProps />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.props).is.a('function');
    });

    propWrapper('finding the props of the component', function (wrapper) {
      assume(wrapper.find(UserProps).first()).to.have.props(['world']);
      assume(wrapper.find(UserProps).first()).to.have.props({ 'world': 'moly' });
      assume(wrapper.find(UserProps).first()).to.not.have.props(['hi']);
      assume(wrapper.find(UserProps).first()).to.not.have.props({ world: 'what' });
    });
  });

  describe.skip('#html', function () {
    function FixtureHTML() {
      return (
        <div className='hello world'>
          <span className='what'>is up</span>
        </div>
      );
    }

    const htmlWrapper = renderers(<FixtureHTML />);

    it('is a function', function () {
      const assumed = assume('what');

      assume(assumed.html).is.a('function');
    });

    htmlWrapper('finding the props of the component', function (wrapper) {
      assume(wrapper).to.have.html('<span class="what">is up</span>');
      assume(wrapper).to.not.have.html('<strong>non existing tag</strong>');
    });
  });

  describe('#empty', function () {
    function Fixture() {
      return (
        <div className='hello world'>
          <span id='empty-thing' className='what'></span>
        </div>
      );
    }

    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.empty).is.a('function');
      assume(assumed.blank).is.a('function');
    });

    its('finding the props of the component', function (wrapper) {
      assume(wrapper).to.is.not.empty();
      assume(wrapper.find('#empty-thing')).is.empty();
    });
  });

  describe('#name', function () {
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
          <span id='empty-thing' className='what'></span>
          <User world='domination' />
        </div>
      );
    }
    const its = renderers(<Fixture />);

    it('is a function', function () {
      var assumed = assume('what');

      assume(assumed.name).is.a('function');
    });

    its('finding the props of the component', function (wrapper) {
      assume(wrapper).to.have.name('div');
      assume(wrapper.find(User)).to.have.name('User');
    });
  });
});
