//
//  ViewController.m
//  CDRefresh
//
//  Created by 程东 on 2017/8/3.
//  Copyright © 2017年 Fitshow. All rights reserved.
//

#import "ViewController.h"

#import "CDRefreshControl.h"

@interface ViewController ()
{
    CDRefreshControl *_refreshControl;
}
@property (weak, nonatomic) IBOutlet UIScrollView *scrollView;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    CGRect bounds = _scrollView.bounds;
    bounds.size.width += 90;
    UIView *backView = [[UIView alloc] initWithFrame:bounds];
    backView.backgroundColor = [UIColor colorWithRed:241/255.0 green:204/255.0 blue:184/255.0 alpha:1.0];
    [_scrollView addSubview:backView];
    
    bounds.size.width -= 90;
    UILabel *label = [[UILabel alloc] initWithFrame:bounds];
    label.textAlignment = NSTextAlignmentCenter;
    label.font = [UIFont systemFontOfSize:54];
    label.text = @"CDRefresh";
    [_scrollView addSubview:label];

    _scrollView.contentSize = CGSizeMake(self.view.bounds.size.width + 90, 0);
    
    _refreshControl = [[CDRefreshControl alloc] initWithScrollView:_scrollView];
    [_refreshControl addTarget:self action:@selector(refresh) forControlEvents:CDRefreshEventsRefresh];
    [_refreshControl addTarget:self action:@selector(load) forControlEvents:CDRefreshEventsLoad];
    
    [_refreshControl endLoading:NO];

}

- (void)refresh
{
    NSLog(@"%s", __FUNCTION__);
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        
        [_refreshControl endLoading:NO];
    });
}

- (void)load
{
    NSLog(@"%s", __FUNCTION__);
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        
        [_refreshControl endLoading:NO];
    });
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
