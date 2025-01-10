import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import MenuComponent from '../../components/MenuComponent/MenuComponent';
import {useSelector} from 'react-redux';
import {getAllNoti, getAllManagerNoti} from '../../services/NotiService';

// Tham chiếu ảnh với require
const HomeScreen = () => {
  const user = useSelector(state => state?.user);
  const users = useSelector(state => state.users.users);
  const [managerNoti, setManagerNoti] = useState([]);

  useEffect(() => {
    const getManagerNoti = async () => {
      try {
        const response = await getAllManagerNoti();
        setManagerNoti(response);
      } catch (err) {
        console.error('Failed to fetch manager notifications:', err);
      }
    };

    getManagerNoti();
  }, []); // Chạy một lần khi component mount

  const formatDate = date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Đảm bảo ngày có 2 chữ số
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Đảm bảo tháng có 2 chữ số
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <ScrollView style={styles.container}>
      <MenuComponent />
      {/* Tiêu đề trang */}
      <Text style={styles.title}>Trang chủ</Text>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/nap-logo.png')} // Tham chiếu ảnh đúng
          style={styles.logo}
        />
      </View>

      {/* Bảng thông báo */}
      <View style={styles.notificationBox}>
        <Text style={styles.notificationTitle}>Thông báo</Text>

        {/* Render các thông báo */}
        {managerNoti.length > 0 ? (
          managerNoti.map((noti, index) => {
            const user = users.find(user => user.id === noti.id_user);
            const userName = user ? user.name : 'Người dùng không xác định'; // Nếu không tìm thấy, hiển thị "Người dùng không xác định"
            return (
              <View key={index}>
                <Text style={styles.notificationName}>
                  {userName} ({formatDate(noti.create_at)})
                </Text>
                <Text style={styles.notificationTitleContent}>
                  {noti.title}
                </Text>
                <Text style={styles.notificationContent}>{noti.content}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.noNotification}>Không có thông báo mới</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  notificationBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    marginTop: 30,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'blue',
  },
  notificationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationTitleContent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  notificationContent: {
    fontSize: 16,
    color: '#555',
  },
});

export default HomeScreen;
