# Badges


<!-- toc -->


## codeclimate

```js
{%= _.codeclimate() %}
// => [![Code Climate](https://codeclimate.com/github/ruby/ruby.png)](https://codeclimate.com/github/ruby/ruby)
```

## coderwall

```js
{%= _.coderwall() %}
// => [![endorse](https://api.coderwall.com/jonschlinkert/endorsecount.png)](https://coderwall.com/jonschlinkert)
```

## coveralls

```js
{%= _.coveralls() %}
// => [![Coverage Status](https://coveralls.io/repos/assemble/assemble/badge.png?branch=master)](https://coveralls.io/r/assemble/assemble?branch=master)
```

## [david](https://david-dm.org/)

[![dependencies](https://david-dm.org/assemble/assemble.png)](https://david-dm.org/assemble/assemble)
[![devDependencies](https://david-dm.org/assemble/assemble.png/dev-status.png)](https://david-dm.org/assemble/assemble)

```js
{%= _.david() %}
// => [![dependencies](https://david-dm.org/assemble/assemble.png)](https://david-dm.org/assemble/assemble)
// => [![devDependencies](https://david-dm.org/assemble/assemble/dev-status.png)](https://david-dm.org/assemble/assemble#info=devDependencies)
```

## drone

```js
{%= _.drone() %}
// => [![](https://drone.io/assemble/assemble/status.png)](https://drone.io/assemble/assemble/latest)
```

## fury

```js
{%= _.fury() %}
// => [![NPM version](https://badge.fury.io/assemble/assemble.png)](http://badge.fury.io/assemble/assemble)
```

## nodei

[![NPM](https://nodei.co/npm/assemble.png)](https://nodei.co/npm/assemble/)

```js
{%= _.nodei() %}
{%= _.nodei('downloads,stars', '6') %}

{%= _.nodei('mini') %}
{%= _.nodei('compact') %}
{%= _.nodei('compact,downloads,mini,stars') %}
{%= _.nodei('compact,downloads,stars') %}
{%= _.nodei('compact,downloads,stars', 6) %}
```

**examples**

[![NPM](https://nodei.co/npm/grunt-readme.png)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?mini=true)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?compact=true)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?downloads=true&stars=true&months=6)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?compact=true&downloads=true&mini=true&stars=true)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?compact=true&downloads=true&stars=true)](https://nodei.co/npm/grunt-readme/)
[![NPM](https://nodei.co/npm/grunt-readme.png?compact=true&downloads=true&stars=true&months=6)](https://nodei.co/npm/grunt-readme/)


## travis

[![Build Status](https://travis-ci.org/assemble/assemble.png?branch=master)](https://travis-ci.org/assemble/assemble)

```js
{%= _.travis() %}
// => [![Build Status](https://travis-ci.org/assemble/assemble.png?branch=master)](https://travis-ci.org/assemble/assemble)
```
