const PRINT_TRACK = false;
export default ({type}) =>
  properties => {
    const event = {type, properties};
    if (PRINT_TRACK && __DEV__) {
      console.log('[EVENT]', event);
    }
    return event;
  };
