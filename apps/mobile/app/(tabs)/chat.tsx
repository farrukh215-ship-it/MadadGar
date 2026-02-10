import { View, Text } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' }}>
      <Text style={{ fontSize: 18, color: '#57534e' }}>Chats</Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#78716c' }}>No chats yet</Text>
    </View>
  );
}
