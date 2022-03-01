import * as React from 'react'
import {StyleSheet} from 'react-native'
import * as colors from 'arena-mobile-ui/colors'

const styles = StyleSheet.create({
  base: {
    padding: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.background,
  },
  delete: {
    backgroundColor: colors.error,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostBlack: {
    backgroundColor: colors.transparent,
  },
  text: {
    base: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    primary: {
      color: colors.white,
    },
    secondary: {
      color: colors.black,
    },
    delete: {
      color: colors.white,
    },
    ghost: {
      backgroundColor: colors.secondary,
    },
    ghostBlack: {
      backgroundColor: colors.black,
    },
  },
})

export default styles
