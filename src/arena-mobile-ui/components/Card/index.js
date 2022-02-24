import React from 'react'

import {View} from 'react-native'

import styles from './styles'

const Card = ({children, customStyles = {}}) => {
  return <View style={[styles.container, customStyles]}>{children}</View>
}

export default Card
