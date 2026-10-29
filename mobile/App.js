import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// O app nativo abre a versão web publicada; uma atualização do site chega ao app sem nova revisão das lojas.
const APP_URL = 'https://prato-planejado.vercel.app/';
const INTERNAL = [APP_URL, 'about:', 'blob:', 'data:'];

export default function App() {
  const web = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      web.current?.goBack();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack]);

  // Links de fora do app (e-mail, WhatsApp, sites) abrem no navegador do aparelho.
  const keepInside = (req) => {
    if (INTERNAL.some((prefix) => req.url.startsWith(prefix))) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        {offline ? (
          <View style={styles.center}>
            <Text style={styles.title}>Sem conexão</Text>
            <Text style={styles.text}>Confira sua internet e tente de novo.</Text>
            <Pressable style={styles.button} onPress={() => setOffline(false)}>
              <Text style={styles.buttonText}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={web}
            source={{ uri: APP_URL }}
            style={styles.root}
            startInLoadingState
            renderLoading={() => (
              <View style={[styles.center, StyleSheet.absoluteFill]}>
                <ActivityIndicator size="large" color="#5B3DF5" />
              </View>
            )}
            onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
            onShouldStartLoadWithRequest={keepInside}
            onError={() => setOffline(true)}
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            domStorageEnabled
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F4FB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F6F4FB' },
  title: { fontSize: 24, fontWeight: '800', color: '#17132B' },
  text: { fontSize: 16, color: '#5D5973', marginTop: 8, textAlign: 'center' },
  button: { marginTop: 20, backgroundColor: '#5B3DF5', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 22 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
