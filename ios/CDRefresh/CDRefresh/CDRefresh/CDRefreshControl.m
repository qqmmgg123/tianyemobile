//
//  CDRefreshView.m
//  CDRefresh
//
//  Created by dung.c on 2017/8/14.
//  Copyright © 2017年 DUNG. All rights reserved.
//


#import "CDRefreshControl.h"

#import "CDRefreshView.h"
#pragma mark - 刷新控件
@implementation CDRefreshControl
{
	BOOL    isBusy, isEndLoad;
}

/**
 说明:
    初始化
**/
- (instancetype)initWithScrollView:(UIScrollView *)scrollView
{
	if (self = [super init])
	{
		_scrollView = scrollView;
		_edgeInset  = scrollView.contentInset;
		
		isEndLoad = YES;		//初始时禁止加载
		
		self.refreshView = [[CDRefreshView alloc] initWithType:NO];
		self.loadView    = [[CDRefreshView alloc] initWithType:YES];
		        
		//检测滚动通知
		[_scrollView addObserver:self forKeyPath:@"contentOffset" options:0 context:nil];
		[_scrollView.panGestureRecognizer addObserver:self forKeyPath:@"state" options:0 context:nil];
	}
	
    return self;
}

- (void)dealloc
{
	[_scrollView removeObserver:self forKeyPath:@"contentOffset"];
    [_scrollView.panGestureRecognizer removeObserver:self forKeyPath:@"state"];
}

/**
 说明：
    观察属性值已变更
**/
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if ([keyPath isEqualToString:@"contentOffset"])
    {
        [self scrollViewDidScroll];
    }
    else if (!isBusy)
    {
		if (_scrollView.panGestureRecognizer.state == UIGestureRecognizerStateBegan)
		{
			_edgeInset = _scrollView.contentInset;
		}
		else if (_scrollView.panGestureRecognizer.state == UIGestureRecognizerStateEnded)
		{
			[self scrollViewDidEndDragging];
		}
    }
}

/**
 说明:
	更新约束
**/
- (void)layoutIfNeeded
{
	if ([_scrollView isKindOfClass:[UITableView class]])
	{
		UITableView *view = (UITableView *)_scrollView;
		
		[view.tableHeaderView layoutIfNeeded];
		[view.tableFooterView layoutIfNeeded];
	}
}

#pragma mark - 控件属性
- (void)setTintColor:(UIColor *)tintColor
{
	[super setTintColor:tintColor];
	
	_loadView.tintColor = tintColor;
	_refreshView.tintColor = tintColor;
}

- (void)setRefreshView:(CDRefreshView *)refreshView
{
	[_refreshView removeFromSuperview];
	_refreshView = refreshView;
	
	CGFloat w = DPI(refreshView.bounds.size.height);
	
	_refreshView.hidden = YES;
	_refreshView.frame  = CGRectMake(-w, 0, w, _scrollView.bounds.size.height);
	[_scrollView addSubview:_refreshView];
}

- (void)setLoadView:(CDRefreshView *)loadView
{
	[_loadView removeFromSuperview];
	_loadView = loadView;
	
	CGFloat w = DPI(loadView.bounds.size.height);
	
	_loadView.hidden = YES;
	_loadView.frame  = CGRectMake(0, 0, w, _scrollView.bounds.size.height);
	[_scrollView addSubview:_loadView];
}

#pragma mark - 刷新处理
/**
 说明:
    手动刷新
**/
- (void)beginRefreshing
{
    if (self.allControlEvents & CDRefreshEventsRefresh)
    {
        [UIView animateWithDuration:ANIMATEDURATION animations:^{
			
			isBusy = isEndLoad = YES;
			
			UIEdgeInsets insets = _edgeInset;
			insets.left += _refreshView.bounds.size.width;
			
			[UIView animateWithDuration:ANIMATEDURATION animations:^{
				
				_scrollView.contentInset = insets;
				_refreshView.hidden = NO;
				
				[self layoutIfNeeded];
			}];
			
			_refreshView.state = CDRefreshStateWorking;
			[_refreshView displayWithProgress:1.f];
        }];
		
        [self performSelector:@selector(performEvents:) withObject:@(CDRefreshEventsRefresh) afterDelay:ANIMATEDURATION inModes:@[NSRunLoopCommonModes]];
    }
}

/**
 说明:
    完成刷新/加载
**/
- (void)endLoading:(BOOL)end
{
	isEndLoad = end;
	
	if (_refreshView.hidden && _loadView.hidden)
	{
		isBusy = NO;
		return;
	}
	
    [UIView animateWithDuration:ANIMATEDURATION animations:^{
		_refreshView.alpha = _loadView.alpha = 0;
		_refreshView.transform = _loadView.transform = CGAffineTransformMakeScale(.4, .4);
        
    } completion:^(BOOL finished) {
		
        _refreshView.state  = CDRefreshStateNormal;
        _refreshView.hidden = YES;
		_refreshView.alpha  = 1;
		_refreshView.transform = CGAffineTransformIdentity;
        
        _loadView.state  = CDRefreshStateNormal;
        _loadView.hidden = YES;
		_loadView.alpha  = 1;
		_loadView.transform = CGAffineTransformIdentity;
		
		[UIView animateWithDuration:ANIMATEDURATION animations:^{
			_scrollView.contentInset = _edgeInset;
			[self layoutIfNeeded];
		} completion:^(BOOL finished) {
			isBusy = NO;
		}];
    }];
}

- (void)endRefreshing
{
    [self endLoading:YES];
}

/**
 说明：
    拖动视图处理
**/
- (void)scrollViewDidScroll
{
	//右拉刷新
	if (self.allControlEvents & CDRefreshEventsRefresh)
	{
		CGFloat w = _refreshView.bounds.size.width;
		CGFloat p = MAX(0, -(_scrollView.contentOffset.x + _scrollView.contentInset.left) / w);
		
		if (!isBusy)
		{
			_refreshView.frame  = CGRectMake(-w, 0, w, _scrollView.bounds.size.height);
			_refreshView.hidden = (p <= 0);
			
			if (p >= 1 && _refreshView.state == CDRefreshStateNormal)
			{
				_refreshView.state = CDRefreshStateRelease;
			}
			else if (p < 1 && _refreshView.state == CDRefreshStateRelease)
			{
				_refreshView.state = CDRefreshStateNormal;
			}
		}
        
		[_refreshView displayWithProgress:p];
	}
	
	//左拉加载
	if (!isEndLoad && (self.allControlEvents & (CDRefreshEventsLoad | CDRefreshEventsAutoLoad)))
	{
		CGFloat w = _loadView.bounds.size.width;
		CGFloat p = (CGRectGetMaxX(_scrollView.bounds) - _scrollView.contentSize.width - _scrollView.contentInset.right) / w;
		
		if (!isBusy)
		{
			_loadView.frame  = CGRectMake(_scrollView.contentSize.width, 0, w, _scrollView.bounds.size.height);
			_loadView.hidden = (p <= 0.01f);
			
			//自动左拉处理
			if ((p > -8) && (self.allControlEvents & CDRefreshEventsAutoLoad))
			{
				isBusy = YES;
				_loadView.state  = CDRefreshStateWorking;
				_loadView.hidden = NO;
				
				UIEdgeInsets edgeInset = _edgeInset;
				edgeInset.right += _loadView.bounds.size.width;
				_scrollView.contentInset = edgeInset;
				
				[self performEvents:@(CDRefreshEventsAutoLoad)];
			}
			//手动左拉处理
			else if (p >= 1 && _loadView.state == CDRefreshStateNormal)
			{
				_loadView.state = CDRefreshStateRelease;
			}
			else if (p < 1 && _loadView.state == CDRefreshStateRelease)
			{
				_loadView.state = CDRefreshStateNormal;
			}
		}
		
		[_loadView displayWithProgress:p];
	}
}

/**
 说明:
    松开滚动
**/
- (void)scrollViewDidEndDragging
{
	//右拉刷新
    if (_refreshView.state == CDRefreshStateRelease && (self.allControlEvents & CDRefreshEventsRefresh))
    {
        isBusy = isEndLoad = YES;
        _refreshView.state = CDRefreshStateWorking;
        
        [UIView animateWithDuration:ANIMATEDURATION animations:^{
			UIEdgeInsets edgeInset = _edgeInset;
            edgeInset.left += _refreshView.bounds.size.width;
            
            _scrollView.contentInset = edgeInset;
            [_scrollView layoutIfNeeded];
        }];
		
		[_refreshView displayWithProgress:1.f];
        [self performSelector:@selector(performEvents:) withObject:@(CDRefreshEventsRefresh) afterDelay:ANIMATEDURATION inModes:@[NSRunLoopCommonModes]];
    }
	//左拉加载
    else if (!isEndLoad && _loadView.state == CDRefreshStateRelease && (self.allControlEvents & CDRefreshEventsLoad))
    {
        isBusy = YES;
        _loadView.state = CDRefreshStateWorking;
        
        [UIView animateWithDuration:ANIMATEDURATION animations:^{
            UIEdgeInsets edgeInset = _edgeInset;
            edgeInset.right += _loadView.bounds.size.width;
            
            _scrollView.contentInset = edgeInset;
            [_scrollView layoutIfNeeded];
        }];
		
		[_loadView displayWithProgress:1.f];
        [self performSelector:@selector(performEvents:) withObject:@(CDRefreshEventsLoad) afterDelay:ANIMATEDURATION inModes:@[NSRunLoopCommonModes]];
    }
}

#pragma mark - 目标执行
/**
 说明:
    执行事件
**/
- (void)performEvents:(NSNumber *)events
{
	[self sendActionsForControlEvents:(UIControlEvents)events.intValue];
}

/**
 说明:
    添加事件
**/
- (void)addTarget:(id)target action:(SEL)action forControlEvents:(CDRefreshEvents)controlEvents
{
	[super addTarget:target action:action forControlEvents:(UIControlEvents)controlEvents];
}

@end
