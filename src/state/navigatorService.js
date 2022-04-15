const config = {};

export function setNavigator(nav) {
  if (nav) {
    config.navigator = nav;
  }
}
const getNavigator = () => {
  const nav = config?.navigator;
  return nav.current;
};
export function navigate(routeName, ...args) {
  if (getNavigator() && routeName) {
    getNavigator().navigate(routeName, args || {});
  }
}
export function reset(routeName) {
  if (getNavigator() && routeName) {
    getNavigator().reset({
      index: 0,
      routes: [{name: routeName}],
    });
  }
}

export function navigatorDispatch(args) {
  if (getNavigator() && args) {
    getNavigator().dispatch(args);
  }
}

export function goBack() {
  if (getNavigator()) {
    getNavigator().goBack();
  }
}
