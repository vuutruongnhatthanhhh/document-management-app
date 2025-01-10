import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

import {getAllUser, loginUser, getUserById} from '../../services/UserService';
import {getAllNoti} from '../../services/NotiService';
import {useMutationHooks} from '../../hooks/useMutationHook';
import {useDispatch} from 'react-redux';
import {updateListUser} from '../../redux/slides/userListSlide';
import {updateUser} from '../../redux/slides/userSlide';
import crypto from 'crypto-js';
import {useSelector} from 'react-redux';
import {notiList} from '../../redux/slides/notiSlide';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const user = useSelector(state => state?.user);
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  const handleGetAllUser = async id => {
    const users = await getAllUser();
    dispatch(updateListUser({users}));
  };

  const handleGetUserById = async id => {
    const user = await getUserById(id);
    dispatch(updateUser(user));
    return user;
  };

  const handleGetAllNoti = async () => {
    const notifications = await getAllNoti();
    dispatch(notiList({notifications}));
  };

  const mutation = useMutationHooks(data => loginUser(data));
  const {data, isPending, isSuccess, isError, error} = mutation;

  const handleLogin = async () => {
    // Logic đăng nhập sẽ ở đây

    const hashedPassword = crypto.SHA256(password).toString();
    mutation.mutate({
      username,
      password: hashedPassword,
    });
  };

  useEffect(() => {
    const handleLoginFlow = async () => {
      try {
        const user = await handleGetUserById(data?.user?.id); // Gọi hàm lấy thông tin người dùng
        if (user) {
          await handleGetAllNoti(); // Sử dụng user.id để lấy thông báo

          await handleGetAllUser(); // Lấy danh sách người dùng
          setMessage(''); // Xóa thông báo lỗi
          navigation.replace('Home'); // Chuyển hướng
        }
      } catch (error) {
        console.error('Error during login flow:', error);
      }
    };
    if (user?.id !== 0 && user?.id !== '' && user?.id != null) {
      navigation.replace('Home'); // Nếu user?.id khác 0, chuyển hướng đến trang /home
    } else if (isError) {
      // Xử lý các thông báo lỗi
      if (
        error?.response?.data?.message === 'Username and password are required'
      ) {
        setMessage('* Bạn cần điền tên đăng nhập và mật khẩu');
      } else if (error?.response?.data?.message === 'Invalid username') {
        setMessage('* Tên đăng nhập không tồn tại');
      } else if (error?.response?.data?.message === 'Invalid password') {
        setMessage('* Sai mật khẩu');
      } else if (error?.response?.data?.message === 'Account is blocked') {
        setMessage('* Tài khoản đã bị khóa');
      } else if (
        error?.response?.data?.message === 'An error occurred during login'
      ) {
        setMessage('* Kiểm tra lại đường truyền hoặc kết nối');
      }
    } else if (isSuccess) {
      handleLoginFlow(); // Gọi chuỗi xử lý tuần tự khi đăng nhập thành công
    }
  }, [isSuccess, isError, error]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/nap-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {message && <Text style={styles.message}>{message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100, // Giảm kích thước logo
    height: 100, // Giảm kích thước logo
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#90bf6b',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    color: 'red',
  },
});

export default LoginScreen;
