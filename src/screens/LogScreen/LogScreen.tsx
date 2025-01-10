import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';

import MenuComponent from '../../components/MenuComponent/MenuComponent';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';

type Notification = {
  id: string;
  title: string;
  message: string;
  avatar: string;
};

const {width, height} = Dimensions.get('window');

const UserScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Vưu Trường Nhật Thanh',
      message: 'đã ký tài liệu Chấm công T12',
      avatar:
        'https://www.gravatar.com/avatar/7e5e45ac9d26be9f404f623e5a8d357b?s=200', // Gravatar avatar
    },
    {
      id: '2',
      title: 'Phạm Minh Phát',
      message: 'đã tạo thư mục Phòng tài chính',
      avatar:
        'https://www.gravatar.com/avatar/6d34062a46420b59b7b96ad2741e3d61?s=200', // Gravatar avatar
    },
    {
      id: '3',
      title: 'Phạm Vũ Khánh Linh',
      message: 'đã xóa tệp Bảng lương T12',
      avatar:
        'https://www.gravatar.com/avatar/034567e831c0878fe4068f9d1d9209fd?s=200', // Gravatar avatar
    },
  ]);

  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái cho modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Trạng thái cho modal
  const [formData, setFormData] = useState({
    title: '',
    role: '', // Chức vụ
    username: '',
    password: '',
  });
  const [formDataEdit, setFormDataEdit] = useState({
    name: '',
    role: 0,
    isChecked: false,
  });

  const handleSendNotification = () => {
    // setNotifications([
    //   ...notifications,
    //   {
    //     id: (notifications.length + 1).toString(),
    //     title: formData.title,
    //     message: formData.message,
    //     avatar: 'https://www.gravatar.com/avatar/0?s=200',
    //   },
    // ]);
    setIsModalVisible(false);
  };

  const handleMoreOptions = (event: any, notification: Notification) => {
    if (dropdownPosition) {
      setDropdownPosition(null);
    } else {
      const {pageY, pageX} = event.nativeEvent;

      const dropdownHeight = 0; // Chiều cao của dropdown
      const dropdownWidth = 150; // Chiều rộng của dropdown

      let adjustedTop = pageY + 10; // Thêm 10px để nó hiển thị dưới phần tử "More Options"
      let adjustedLeft = pageX;

      // Điều chỉnh vị trí nếu dropdown ra ngoài màn hình
      if (adjustedTop + dropdownHeight > height) {
        adjustedTop = height - dropdownHeight - 10;
      }

      if (adjustedLeft + dropdownWidth > width) {
        adjustedLeft = width - dropdownWidth - 10;
      }

      setDropdownPosition({top: adjustedTop, left: adjustedLeft});
      setSelectedNotification(notification);
    }
  };

  const handleOptionSelect = (option: string) => {
    console.log(
      `${option} selected for notification ${selectedNotification?.id}`,
    );
    if (option === 'Chỉnh sửa') {
      setIsEditModalVisible(true); // Mở modal chỉnh sửa
    }
    setDropdownPosition(null);
  };

  const handleOverlayPress = () => {
    setDropdownPosition(null);
  };

  const renderNotificationItem = ({item}: {item: Notification}) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationTitle}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.dateText}> (09/01/2025 14:43)</Text>
          </Text>
          <Text>{item.message}</Text>
        </View>
        {/* <TouchableOpacity
          onPress={event => handleMoreOptions(event, item)}
          style={styles.moreOptions}>
          <Text style={styles.moreOptionsText}>⋮</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.container}>
        {/* Bao quanh MenuComponent với một View có position absolute */}
        <View style={styles.menuWrapper}>
          <MenuComponent />
        </View>

        <Text style={styles.title}>Lịch sử hoạt động</Text>

        {/* <TouchableOpacity
          style={styles.sendButton}
          //   onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.sendButtonText}>Xem hoạt động</Text>
        </TouchableOpacity> */}

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tài khoản..."
          value={searchText}
          onChangeText={text => setSearchText(text)} // Cập nhật giá trị tìm kiếm
        />

        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          style={styles.notificationList}
        />

        {/* Modal gửi thông báo */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}>
          {/* Chỉ bao quanh vùng ngoài modal */}
          <TouchableWithoutFeedback>
            <View style={styles.modalOverlay}>
              {/* Modal nội dung không bị ảnh hưởng */}
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Tạo tài khoản</Text>

                {/* Tên người dùng */}
                <TextInput
                  placeholder="Tên người dùng"
                  value={formDataEdit.name}
                  onChangeText={text =>
                    setFormDataEdit({...formDataEdit, name: text})
                  }
                  style={styles.input}
                />

                {/* Chức vụ (Picker mới từ @react-native-picker/picker) */}
                <Picker
                  selectedValue={formData.role}
                  onValueChange={value =>
                    setFormData({...formData, role: value})
                  }
                  style={styles.input}>
                  <Picker.Item label="Nhân viên" value="employee" />
                  <Picker.Item label="IT" value="it" />
                  <Picker.Item label="Quản lý" value="manager" />
                </Picker>

                {/* Tên đăng nhập */}
                <TextInput
                  placeholder="Tên đăng nhập"
                  value={formData.username}
                  onChangeText={text =>
                    setFormData({...formData, username: text})
                  }
                  style={styles.input}
                />

                {/* Mật khẩu */}
                <TextInput
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChangeText={text =>
                    setFormData({...formData, password: text})
                  }
                  style={styles.input}
                  secureTextEntry
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleSendNotification}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Tạo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}>
          {/* Chỉ bao quanh vùng ngoài modal */}
          <TouchableWithoutFeedback>
            <View style={styles.modalOverlay}>
              {/* Modal nội dung không bị ảnh hưởng */}
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>

                {/* Tên người dùng */}
                <TextInput
                  placeholder="Tên người dùng"
                  value={formDataEdit.name}
                  onChangeText={text =>
                    setFormDataEdit({...formDataEdit, name: text})
                  }
                  style={styles.input}
                />

                {/* Chức vụ (Picker mới từ @react-native-picker/picker) */}
                <Picker
                  selectedValue={formDataEdit.role}
                  onValueChange={value =>
                    setFormDataEdit({...formDataEdit, role: value})
                  }
                  style={styles.input}>
                  <Picker.Item label="Nhân viên" value="employee" />
                  <Picker.Item label="IT" value="it" />
                  <Picker.Item label="Quản lý" value="manager" />
                </Picker>

                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={formDataEdit.isChecked}
                    onValueChange={value =>
                      setFormDataEdit({...formDataEdit, isChecked: value})
                    }
                  />
                  <Text style={styles.checkboxText}>Ký xác nhận</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleSendNotification}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal Dropdown */}
        {dropdownPosition && (
          <View
            style={[
              styles.dropdownOverlay,
              {top: dropdownPosition.top, left: dropdownPosition.left},
            ]}>
            <View style={[styles.modal, {zIndex: 999}]}>
              <TouchableOpacity
                onPress={() => handleOptionSelect('Chỉnh sửa')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('Khóa')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Khóa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('Xóa')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  menuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 0,
    zIndex: 1000, // Đảm bảo MenuComponent nằm trên các phần tử khác
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  plusIcon: {
    fontSize: 24, // Kích thước biểu tượng dấu cộng
    color: '#90bf6b', // Màu sắc của dấu cộng
    marginLeft: 5, // Khoảng cách giữa "Tài khoản" và dấu cộng
  },
  sendButton: {
    backgroundColor: '#90bf6b',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moreOptions: {
    padding: 5,
  },
  moreOptionsText: {
    fontSize: 20,
    color: '#888',
  },
  dropdownOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    elevation: 10,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#90bf6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 18,
    color: '#333',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Màu của title
  },
  dateText: {
    fontSize: 14,
    color: 'blue', // Màu của ngày tháng
  },
});

export default UserScreen;
