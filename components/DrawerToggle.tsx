import { View, Text } from 'react-native'
import React from 'react'
import { Button } from './ui/button'
import { ThemeProvider, DrawerActions, useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

const DrawerToggle = () => {
    const navigation = useNavigation();
    return (
        <Button
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            className='bg-transparent border-0 p-0 mr-4 active:bg-transparent'
        >
            <Text className='text-secondary-foreground'><AntDesign name="menu" size={20} /></Text>
        </Button>
    )
}

export default DrawerToggle