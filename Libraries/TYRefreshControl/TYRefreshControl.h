/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import <React/RCTComponent.h>
#import <React/RCTScrollableProtocol.h>
#import <CDRefreshControl.h>

@interface TYRefreshControl : CDRefreshControl <RCTCustomRefreshContolProtocol>
{
    CDRefreshControl *_refreshControl;
}

@property (nonatomic, copy) RCTDirectEventBlock onRefresh;

@end
