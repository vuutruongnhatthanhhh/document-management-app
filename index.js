import 'react-native-gesture-handler'; // Đảm bảo đã import gesture handler
import {AppRegistry} from 'react-native';
import {NavigationContainer} from '@react-navigation/native'; // Import NavigationContainer
import App from './src/App'; // Đây là file App.js của bạn
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {persistor, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();
// Bao bọc App trong NavigationContainer ở đây
const Main = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  </QueryClientProvider>
);

AppRegistry.registerComponent(appName, () => Main); // Đăng ký Main thay vì App
