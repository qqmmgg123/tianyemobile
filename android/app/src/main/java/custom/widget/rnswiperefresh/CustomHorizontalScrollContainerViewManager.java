// Copyright (c) Facebook, Inc. and its affiliates.

// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

package custom.widget.rnswiperefresh;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.views.scroll.ReactHorizontalScrollContainerView;

/** View manager for {@link ReactHorizontalScrollContainerView} components. */
@ReactModule(name = CustomHorizontalScrollContainerViewManager.REACT_CLASS)
public class CustomHorizontalScrollContainerViewManager
    extends ViewGroupManager<ReactHorizontalScrollContainerView> {

  public static final String REACT_CLASS = "AndroidCustomHorizontalScrollContentView";

  public CustomHorizontalScrollContainerViewManager() {}

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public ReactHorizontalScrollContainerView createViewInstance(ThemedReactContext context) {
    return new ReactHorizontalScrollContainerView(context);
  }
}
