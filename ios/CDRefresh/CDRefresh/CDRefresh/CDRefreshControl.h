//
//  CDRefreshView.m
//  CDRefresh
//
//  Created by dung.c on 2017/8/14.
//  Copyright © 2017年 DUNG. All rights reserved.
//

#import <UIKit/UIKit.h>

@class CDRefreshView;

typedef NS_ENUM(uint, CDRefreshEvents) {
    CDRefreshEventsRefresh		= 1 << 24,		//下拉刷新
    CDRefreshEventsLoad			= 1 << 25,		//手动上拉加载
    CDRefreshEventsAutoLoad		= 1 << 26,		//自动上拉加载
};

@interface CDRefreshControl : UIControl
{
	UIEdgeInsets		_edgeInset;
	UIScrollView		*_scrollView;
}

- (instancetype)init	NS_UNAVAILABLE;
- (instancetype)initWithScrollView:(UIScrollView *)scrollView;

@property (nonatomic, retain) CDRefreshView		*refreshView;
@property (nonatomic, retain) CDRefreshView		*loadView;

- (void)addTarget:(id)target action:(SEL)action forControlEvents:(CDRefreshEvents)controlEvents;

- (void)beginRefreshing;
- (void)endRefreshing;

- (void)endLoading:(BOOL)end;

@end
