import React, {useCallback, useEffect, useState} from 'react'

import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'

import {useDispatch, useSelector} from 'react-redux'

import {selectors as appSelectors, actions as appActions} from 'state/app'

import Layout from 'arena-mobile-ui/components/Layout'
import Header from 'arena-mobile-ui/components/Header'
import Input from 'arena-mobile-ui/components/Input'
import Button from 'arena-mobile-ui/components/Button'

import baseStyles from 'arena-mobile-ui/styles'

import styles from './styles'

const ConnectionSettings = () => {
  const [formData, setFormData] = useState({})
  const dispatch = useDispatch()

  const onChangeText = useCallback(
    key => value => {
      setFormData(prevValue => ({...prevValue, [key]: value}))
    },
    [],
  )

  const handleSubmitForm = useCallback(() => {
    dispatch(appActions.initConnection(formData))
  }, [formData])

  const {username, password} = useSelector(appSelectors.getAccessData)

  const isLoading = useSelector(appSelectors.getIsLoading)

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      username: username || prevData.username,
      password: password || prevData.password,
    }))
  }, [username, password])

  return (
    <Layout>
      <>
        <Header hasBackComponent>
          <Text style={[baseStyles.textStyle.title]}>Connection settings</Text>
        </Header>

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView>
            <View style={{flex: 1, padding: 16}}>
              <Text style={[styles.header]}>Access info</Text>

              <Input
                title="Username (email)"
                onChangeText={onChangeText('username')}
                value={formData?.username || username}
              />
              <Input
                title="Password"
                onChangeText={onChangeText('password')}
                value={formData?.password || password}
                secureTextEntry={true}
              />

              <Button
                onPress={handleSubmitForm}
                label="connect"
                disabled={isLoading}
              />
              <View style={{height: 100}}></View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    </Layout>
  )
}

export default ConnectionSettings
