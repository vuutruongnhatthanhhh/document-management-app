import React, {useState, useEffect} from 'react';
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
  Alert,
} from 'react-native';

import MenuComponent from '../../components/MenuComponent/MenuComponent';
import {Picker} from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import {launchImageLibrary} from 'react-native-image-picker';
import {resetUser, updateUser} from '../../redux/slides/userSlide';
import {updateListUser} from '../../redux/slides/userListSlide';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {
  updateeUser,
  getAllUser,
  getUserById,
  loginUser,
} from '../../services/UserService';
import {getAllRole} from '../../services/RoleService';
import {useMutationHooks} from '../../hooks/useMutationHook';
import crypto from 'crypto-js';

const {width, height} = Dimensions.get('window');

const SettingScreen = ({navigation}) => {
  const user = useSelector(state => state.user);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState('');
  const [messageOldPassword, setMessageOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPassword2, setConfirmPassword2] = useState('');
  const [messageNewPassword, setMessageNewPassword] = useState('');

  const [dropdownPosition, setDropdownPosition] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);

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
  const dispatch = useDispatch();

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

  const handleOptionSelect = option => {
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

  const handleChangePassword = () => {
    console.log('Đổi mật khẩu');
    setIsModalVisible(true);
  };

  const handleSaveChanges = () => {
    console.log('Lưu thay đổi');
  };

  const handleSelectAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo', // Chỉ chọn ảnh
        quality: 0.8, // Chất lượng ảnh (0-1)
      },
      response => {
        // Kiểm tra xem response.assets có tồn tại không
        if (response.didCancel) {
          console.log('User canceled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          // Kiểm tra nếu assets tồn tại và có ít nhất một hình ảnh
          if (
            response.assets &&
            response.assets.length > 0 &&
            response.assets[0].uri
          ) {
            // Đảm bảo uri là string và không phải undefined
            setAvatar(response.assets[0].uri || null); // Lưu ảnh vào state avatar
          } else {
            console.log('No assets found');
          }
        }
      },
    );
  };

  const handleLogout = async () => {
    dispatch(resetUser());
    navigation.replace('Login');
  };

  const roleName =
    roles.find(role => role.id === user.id_role)?.name || 'Không xác định';

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await getAllRole();
        setRoles(allRoles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleChangeName = value => {
    setName(value); // Cập nhật tên người dùng
  };

  const handleOnchangePassword = value => {
    setPassword(value);
  };

  const handleOnchangeConfirmPassword = value => {
    setConfirmPassword(value);
  };

  const handleOnchangeConfirmPassword2 = value => {
    setConfirmPassword2(value);
  };

  const handleGetAllUser = async id => {
    const users = await getAllUser();
    dispatch(updateListUser({users}));
  };

  const handleGetUserById = async id => {
    const user = await getUserById(id);
    dispatch(updateUser(user));
    return user;
  };

  const mutation = useMutationHooks(data => updateeUser(user?.id, data));

  const handleUpdateName = () => {
    const isNameChanged = name !== user?.name;

    if (!isNameChanged) {
      Alert.alert('Không có thay đổi nào để cập nhật.');
      return;
    }

    mutation.mutate(
      {
        id: user?.id,
        name: isNameChanged ? name : user?.name,
        username: user?.username,
        password: user?.password,
        id_role: user?.id_role,
        avatar: user?.avatar,
        publicKey: user?.publicKey,
        isHide: 1,
        permiss_sign: user?.permiss_sign,
      },
      {
        onSuccess: () => {
          handleGetUserById(user?.id);
          handleGetAllUser();
          Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        },
        onError: () => {
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin');
        },
      },
    );
  };

  const mutationCheckPassword = useMutationHooks(data => loginUser(data));

  const handleOk = () => {
    const hashedPassword = crypto.SHA256(password).toString();
    mutationCheckPassword.mutate({
      username: user?.username,
      password: hashedPassword,
    });
  };

  const mutationChangePassword = useMutationHooks(data =>
    updateeUser(user?.id, data),
  );

  const {data, isPending, isSuccess, isError, error} = mutationCheckPassword;

  useEffect(() => {
    if (isError) {
      setMessageOldPassword('Mật khẩu cũ không đúng');
    } else if (isSuccess) {
      setMessageOldPassword('');
      if (confirmPassword == '' || confirmPassword2 == '') {
        setMessageNewPassword('Vui lòng nhập mật khẩu mới');
      } else if (confirmPassword !== confirmPassword2) {
        setMessageNewPassword('Mật khẩu nhập lại không đúng');
      } else {
        mutationChangePassword.mutate(
          {
            id: user?.id,
            name: name,
            username: user?.username,
            password: crypto.SHA256(confirmPassword2).toString(),
            id_role: user?.id_role,
            avatar: user?.avatar,
            publicKey: user?.publicKey,
            isHide: 1,
            permiss_sign: user?.permiss_sign,
          },
          {
            onSuccess: () => {
              handleGetUserById(user?.id);
              Alert.alert('Thành công', 'Đổi mật khẩu thành công');
              setIsModalVisible(false);
            },
            onError: () => {
              Alert.alert('Lỗi', 'Có lỗi xảy ra');
            },
          },
        );
        setPassword('');
        setMessageNewPassword('');
        setConfirmPassword('');
        setConfirmPassword2('');
      }
    }
  }, [isSuccess, isError, error]);

  const handleCancel = () => {
    setPassword('');
    setMessageNewPassword('');
    setConfirmPassword('');
    setConfirmPassword2('');

    setIsModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.container}>
        {/* Bao quanh MenuComponent với một View có position absolute */}
        <View style={styles.menuWrapper}>
          <MenuComponent />
        </View>

        <Text style={styles.title}>Cài đặt</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên người dùng"
          value={name}
          onChangeText={handleChangeName} // Cập nhật tên người dùng
        />

        {/* Hiển thị ô chức vụ */}
        <TextInput
          style={styles.input}
          placeholder="Chức vụ"
          value={roleName}
          onChangeText={setRole} // Cập nhật chức vụ
          editable={false}
        />

        {/* Button Đổi mật khẩu */}

        {/* Button Lưu thay đổi */}
        <TouchableOpacity onPress={handleUpdateName} style={styles.buttonSave}>
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>

        {/* Button Đăng xuất */}
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>

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
                <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

                {/* Tên người dùng */}
                <TextInput
                  placeholder="Mật khẩu cũ"
                  value={password}
                  onChangeText={handleOnchangePassword}
                  style={styles.input}
                  secureTextEntry
                />
                {messageOldPassword && (
                  <Text style={styles.error}>{messageOldPassword}</Text>
                )}

                {/* Tên đăng nhập */}
                <TextInput
                  placeholder="Mật khẩu mới"
                  value={confirmPassword}
                  onChangeText={handleOnchangeConfirmPassword}
                  style={styles.input}
                  secureTextEntry
                />

                {/* Mật khẩu */}
                <TextInput
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword2}
                  onChangeText={handleOnchangeConfirmPassword2}
                  style={styles.input}
                  secureTextEntry
                />
                {messageNewPassword && (
                  <Text style={styles.error}>{messageNewPassword}</Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleOk}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
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
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ef6b48',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  avatarButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatarButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 15,
  },
  error: {
    color: 'red',
  },
});

export default SettingScreen;
