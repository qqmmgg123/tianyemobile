import createIconSet from 'react-native-vector-icons/lib/create-icon-set';
import glyphMap from 'app/iconfont.json';

const iconSet = createIconSet(glyphMap, 'iconFont', 'iconfont.ttf');

export default iconSet;

export const Button = iconSet.Button;
export const TabBarItem = iconSet.TabBarItem;
export const TabBarItemIOS = iconSet.TabBarItemIOS;
export const ToolbarAndroid = iconSet.ToolbarAndroid;
export const getImageSource = iconSet.getImageSource;
