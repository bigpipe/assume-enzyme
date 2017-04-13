# assume-enzyme

The `assume-enzyme` module provides a more human readable API and assertion
output when using Enzyme in your test suite.

## Installation

The module is published to the public npm registry and should be installed
a dev dependency.

```bash
npm install --save-dev assume-enzyme
```

## API

- [enzyme](#enzyme)
- [className, classNames](#classname-classnames)
- [contain, contains](#contain-contains)
- [tagName](#tagName)
- [checked](#checked)
- [disabled](#disabled)
- [props](#props)

#### enzyme

Assert that a given value is an enzyme instance.

```js
function Example() {
  return (
    <div className='hello world'></div>
  );
}

wrapper = shallow(<Example />);
assume(wrapper).is.enzyme();
```

#### className, classNames

Assert that a given component has the supplied classNames.

```js
function Example() {
  return (
    <div className='hello world'></div>
  );
}

wrapper = shallow(<Example />);
assume(wrapper).to.have.className('hello');
assume(wrapper).to.have.className('world');
```

#### contain, contains

Assert that a given wrapper contains a given component. While this method
overrides the default `contains` and `contain` methods it will still work as
expected as this functionality is only triggered if we're passed in a enzyme
instance.

#### tagName

Assert that a component has a given tag name.

```js
function Example() {
  return (
    <div className='hello world'></div>
  );
}

wrapper = shallow(<Example />);
assume(wrapper).to.have.tagName('div');
```

#### checked

Assert that a given input is checked or not.

```js
function Example() {
  return (
    <input id='hello' defaultChecked />
  );
}

wrapper = shallow(<Example />);
assume(wrapper).is.checked();
```

#### disabled

Assert that a given input is disabled or not.

```js
function Example() {
  return (
    <input id='hello' disabled />
  );
}

wrapper = shallow(<Example />);
assume(wrapper).is.disabled();
```

#### props

Assert that a component has a given set of props assigned to it.

```js
```
