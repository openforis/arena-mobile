export default ({type}) =>
  properties => {
    const event = {type, properties};
    if (__DEV__) {
      console.log('[EVENT]', event);
    }
    return event;
  };
