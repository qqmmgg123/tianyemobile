package com.tianyemobile;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.theweflex.react.WeChatPackage;
import com.astrocoders.selectabletext.RNSelectableTextPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.quenice.reactnative.RNCardViewPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import custom.widget.rnswiperefresh.SwipeRefreshLayoutPackage;
import com.theweflex.react.WeChatPackage;
import com.tianyemobile.UpdatePackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNExitAppPackage(),
            new WeChatPackage(),
            new RNSelectableTextPackage(),
            new SplashScreenReactPackage(),
            new CookieManagerPackage(),
            new RNCardViewPackage(),
            new SvgPackage(),
            new VectorIconsPackage(),
            new RNGestureHandlerPackage(),
            new SwipeRefreshLayoutPackage(),
            new UpdatePackage(),
            new WeChatPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    ReadableNativeArray.setUseNativeAccessor(true);
    ReadableNativeMap.setUseNativeAccessor(true);
  }
}
