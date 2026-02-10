import { View, Text } from 'react-native';

export default function PostScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf9' }}>
      <Text style={{ fontSize: 18, color: '#57534e' }}>Post creation</Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#78716c' }}>Use web app for now</Text>
    </View>
  );
}
