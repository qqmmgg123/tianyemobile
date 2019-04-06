/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "TYRefreshControl.h"
#import "CDRefreshControl.h"

#import "RCTUtils.h"

@implementation TYRefreshControl
{
  BOOL _currentRefreshingState;
}

@synthesize refreshing = _refreshing;

RCT_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)layoutSubviews
{
  [super layoutSubviews];
  UIScrollView *scrollView = (UIScrollView *)self.superview;
  _refreshControl = [[CDRefreshControl alloc] initWithScrollView:scrollView];
  [_refreshControl addTarget:self action:@selector(refresh) forControlEvents:CDRefreshEventsRefresh];
  [_refreshControl addTarget:self action:@selector(load) forControlEvents:CDRefreshEventsLoad];
  
  [_refreshControl endLoading:NO];
}

- (void)refresh
{
  NSLog(@"%s", __FUNCTION__);
  __block typeof(self)weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [weakSelf->_refreshControl endLoading:NO];
    if (weakSelf->_onRefresh) {
      weakSelf->_onRefresh(nil);
    }
  });
}

- (void)load
{
  NSLog(@"%s", __FUNCTION__);
  __block typeof(self)weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [weakSelf->_refreshControl endLoading:NO];
  });
}

- (void)setRefreshing:(BOOL)refreshing
{
  _currentRefreshingState = refreshing;
}

@end
