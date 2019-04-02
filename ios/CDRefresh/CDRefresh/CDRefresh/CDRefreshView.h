//
//  CDRefreshView.m
//  CDRefresh
//
//  Created by dung.c on 2017/8/14.
//  Copyright © 2017年 DUNG. All rights reserved.
//


#import <UIKit/UIKit.h>

static CGFloat	dpi_width = 320;		//DPI缩放宽度（默认320，若故事板按iPhone6设计，则应设置为对象设备屏宽）

#define     ANIMATEDURATION     0.3
#define PIXEL(p)			((p) / [UIScreen mainScreen].scale)		//获取像素实际大小
#define SCALE(s)			([UIScreen mainScreen].bounds.size.width * (s) / dpi_width)		//按屏幕进行缩放（默认与5S屏宽为基数）
#define LOC(p)				(lround((p) * [UIScreen mainScreen].scale) / [UIScreen mainScreen].scale)	//锁定到像素位置
#define DPI(z)				LOC(SCALE(z))		//缩放值，并锁定到像素倍数
#define rgba(r, g, b, a)    ([UIColor colorWithRed:((r) / 255.0) green:((g) / 255.0) blue:((b) / 255.0) alpha:(a)])
#define rgb(r, g, b)        rgba(r, g, b, 1.f)

typedef NS_ENUM(uint, CDRefreshState) {
    CDRefreshStateNormal		,		//正常
    CDRefreshStateRelease		,       //拖动到位，松开即可刷新或加载
    CDRefreshStateWorking		,       //已松开，刷新或加载等待中
};

@interface CDRefreshView : UIView

@property (nonatomic, retain) UIImageView				*image;
@property (nonatomic, retain) UILabel					*title;
@property (nonatomic, retain) UIActivityIndicatorView	*indicator;

@property (nonatomic, copy) NSString			*string;		//以","分隔的三段提示字符串，例如: "右拉刷新,松开刷新,正在刷新"
@property (nonatomic, assign) CDRefreshState	state;

//子类重载
- (void)displayWithProgress:(CGFloat)progress;		//视图已显示的进度（0.0 ~ 1.0）
- (instancetype)initWithType:(BOOL)load;

@end
