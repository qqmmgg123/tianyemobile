/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Stub of TYRefreshControl for Android.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const NativeTYRefreshControl = require('NativeModules').TYRefreshControl;

/**
 * High-level docs for the TYRefreshControl iOS API can be written here.
 */

const TYRefreshControl = {
  test: function() {
    NativeTYRefreshControl.test();
  },
};

module.exports = TYRefreshControl;
