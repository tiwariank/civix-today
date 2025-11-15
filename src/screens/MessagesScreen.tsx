import React from 'react';
import { View, Button } from 'react-native';
import { useNotifications } from '../contexts/NotificationsContext';

const MessagesScreen = () => {
  const { increment, reset } = useNotifications();

  return (
    <View>
      <Button title="Simulate incoming message" onPress={() => increment('messages')} />
      <Button title="Mark all read" onPress={() => reset('messages')} />
    </View>
  );
};

export default MessagesScreen;