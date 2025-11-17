import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, AccessibilityRole } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';

type Props = {
  size?: number;
  color?: string;
};

export const HamburgerButton: React.FC<Props> = ({
  size = 15,
  color = '#0f62fe',
}) => {
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus(); // 'open' | 'closed'
  const anim = useRef(new Animated.Value(drawerStatus === 'open' ? 1 : 0)).current;

  // animate when drawer opens/closes
  useEffect(() => {
    Animated.timing(anim, {
      toValue: drawerStatus === 'open' ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [drawerStatus]);

  const onPress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const lineCommon = {
    width: size,
    height: 3,
    backgroundColor: color,
    borderRadius: 2,
  };

  const topStyle = {
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  const middleStyle = {
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  const bottomStyle = {
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-45deg'],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View style={[lineCommon, topStyle]} />
      <Animated.View style={[lineCommon, { marginVertical: 4 }, middleStyle]} />
      <Animated.View style={[lineCommon, bottomStyle]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
