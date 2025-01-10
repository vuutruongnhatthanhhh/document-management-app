import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // Hook để sử dụng navigation
import {useSelector} from 'react-redux';

const MenuComponent = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const navigation = useNavigation(); // Sử dụng hook useNavigation
  const notifications = useSelector(state => state.notifications.notifications);
  const user = useSelector(state => state?.user);

  const unreadCount = notifications.filter(
    noti => noti.status === 0 && noti.id_receiver === user.id,
  ).length;

  // Hàm để toggle trạng thái menu (ẩn/hiện)
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  // Hàm để điều hướng
  const handleNavigation = screen => {
    closeMenu(); // Đóng menu khi người dùng chọn mục
    navigation.navigate(screen); // Chuyển hướng đến màn hình tương ứng
  };

  return (
    <View style={styles.container}>
      {/* TouchableWithoutFeedback chỉ bao quanh phần nền ngoài menu */}
      {isMenuVisible && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Hamburger Menu Icon */}
      <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
        <View style={styles.bar}></View>
      </TouchableOpacity>

      {/* Menu */}
      {isMenuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => handleNavigation('Home')}>
            <Text style={styles.menuItem}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Noti')}>
            <Text style={styles.menuItem}>
              Thông báo{' '}
              {unreadCount !== 0 && (
                <Text style={styles.unread}>({unreadCount})</Text>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('User')}>
            <Text style={styles.menuItem}>Tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Document')}>
            <Text style={styles.menuItem}>Tài liệu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Log')}>
            <Text style={styles.menuItem}>Lịch sử hoạt động</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleNavigation('Setting')}>
            <Text style={styles.menuItem}>Cài đặt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2, // Đảm bảo lớp phủ hiển thị trên các phần tử khác
  },
  hamburger: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 50,
    height: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#90bf6b',
    borderRadius: 5,
    padding: 5,
  },
  bar: {
    width: 30,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginVertical: 2,
  },
  menu: {
    position: 'absolute',
    top: 70,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    width: 200,
    zIndex: 3,
  },
  menuItem: {
    fontSize: 18,
    padding: 10,
  },
  unread: {
    color: 'red',
  },
});

export default MenuComponent;
