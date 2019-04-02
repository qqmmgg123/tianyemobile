//
//  CDRefreshView.m
//  CDRefresh
//
//  Created by dung.c on 2017/8/14.
//  Copyright © 2017年 DUNG. All rights reserved.
//


#import "CDRefreshView.h"

/*===================================================================
 说明:
 刷新视图
 ==================================================================*/
@implementation CDRefreshView

- (instancetype)initWithType:(BOOL)load
{
    if (self = [super initWithFrame:CGRectMake(0, 0, DPI(320), DPI(64))])
    {
        _title = [[UILabel alloc] init];
        _title.textColor = [UIColor grayColor];
        _title.font = [UIFont systemFontOfSize:DPI(11)];
        _title.translatesAutoresizingMaskIntoConstraints = NO;
        _title.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_title];

        _indicator = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
        _indicator.hidesWhenStopped = YES;
        _indicator.transform = CGAffineTransformMakeScale(SCALE(.66), SCALE(.66));
        _indicator.translatesAutoresizingMaskIntoConstraints = NO;
        [self addSubview:_indicator];

        _image = [[UIImageView alloc] init];
        _image.tag = load;
        _image.translatesAutoresizingMaskIntoConstraints = NO;
        [self addSubview:_image];

        self.string = load ? @"左拉加载,松开加载,正在加载" : @"右拉刷新,松开刷新,正在刷新";
        self.tintColor = [UIColor whiteColor];
    }
    
    return self;
}

- (void)setTintColor:(UIColor *)tintColor
{
    [super setTintColor:tintColor];
    
    CGFloat size = 40;
    UIGraphicsBeginImageContextWithOptions(CGSizeMake(size, size), NO, 0);
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    if (!_image.tag)
    {
        CGContextScaleCTM(ctx, 1, -1);
        CGContextTranslateCTM(ctx, 40, -40);
        CGContextRotateCTM (ctx, M_PI_2);
    }
    else
    {
        CGContextTranslateCTM(ctx, 0, 40);
        CGContextRotateCTM (ctx, -M_PI_2);
    }
    
    CGContextSetFillColorWithColor(ctx, rgba(127, 127, 127, .3).CGColor);
    CGContextAddArc(ctx, size/2, size/2, size/2, 0, 2 * M_PI, YES);
    CGContextFillPath(ctx);
    
    CGContextBeginPath(ctx);
    CGContextSetFillColorWithColor(ctx, self.tintColor.CGColor);
    
    CGContextMoveToPoint(ctx, size * .5, size * .21);
    CGContextAddLineToPoint(ctx, size * .74, size * .44);
    CGContextAddLineToPoint(ctx, size * .61, size * .44);
    CGContextAddLineToPoint(ctx, size * .61, size * .79);
    CGContextAddLineToPoint(ctx, size * .39, size * .79);
    CGContextAddLineToPoint(ctx, size * .39, size * .44);
    CGContextAddLineToPoint(ctx, size * .26, size * .44);
    CGContextClosePath(ctx);
    CGContextFillPath(ctx);
    
    _image.image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
}

- (void)setString:(NSString *)string
{
    _string = string;
    self.state = _state;
}

//设置状态
- (void)setState:(CDRefreshState)state
{
    _state = state;
    
    _image.hidden = (_state == CDRefreshStateWorking);
    if (_state == CDRefreshStateWorking) [_indicator startAnimating]; else [_indicator stopAnimating];
    
    //状态文本动画
    NSArray *ary = [_string componentsSeparatedByString:@","];
    _title.text = _state < ary.count ? ary[_state] : ary.firstObject;
    CATransition *animation = [CATransition animation];
    [animation setDuration:ANIMATEDURATION];
    [animation setTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionDefault]];
    [animation setType:kCATransitionFade];
    [_title.layer addAnimation:animation forKey:nil];
}

//子类处理，定制显示
- (void)displayWithProgress:(CGFloat)progress
{
    if (progress > 0)
    {
        [UIView animateWithDuration:ANIMATEDURATION animations:^{
            CGFloat rotation = (_state == CDRefreshStateRelease) ? M_PI : 0;
            _image.transform = CGAffineTransformMakeRotation(rotation);
        }];
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    CGRect selfFrame = self.frame;
    CGFloat titleX = 0;
    CGFloat titleH = 15;
    CGFloat titleW = selfFrame.size.width;
    CGFloat titleY = selfFrame.size.height * 0.5;
    _title.frame = CGRectMake(titleX, titleY, titleW, titleH);
    
    CGFloat imageH = 27;
    CGFloat imageW = imageH;
    CGFloat imageX = (titleW - imageW) * 0.5;
    CGFloat imageY = titleY - imageH;
    _image.frame = CGRectMake(imageX, imageY, imageW, imageH);
    
    CGFloat indicatorH = 30;
    CGFloat indicatorW = indicatorH;
    CGFloat indicatorX = (titleW - indicatorW) * 0.5;
    CGFloat indicatorY = titleY - indicatorH;
    _indicator.frame = CGRectMake(indicatorX, indicatorY, indicatorW, indicatorH);
}


@end
