import React, {useState, useEffect, useMemo} from 'react';
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
import {useSelector} from 'react-redux';
import * as RoleService from '../../services/RoleService';
import * as UserService from '../../services/UserService';
import {useMutationHooks} from '../../hooks/useMutationHook';
import {useDispatch} from 'react-redux';
import {updateListUser} from '../../redux/slides/userListSlide';
import crypto from 'crypto-js';

const {width, height} = Dimensions.get('window');

const UserScreen = () => {
  const [searchText, setSearchText] = useState('');
  const users = useSelector(state => state.users.users);
  const [roles, setRoles] = useState({});
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(3);
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);

  const [nameEdit, setNameEdit] = useState('');
  const [roleEdit, setRoleEdit] = useState(1);
  const [hideEdit, setHideEdit] = useState(1);

  const [dropdownPosition, setDropdownPosition] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleMoreOptions = (event, users) => {
    if (dropdownPosition) {
      setDropdownPosition(null);
    } else {
      const {pageY, pageX} = event.nativeEvent;

      const dropdownHeight = 0; // Chiều cao của dropdown
      const dropdownWidth = 150; // Chiều rộng của dropdown

      let adjustedTop = pageY - 180; // Thêm 10px để nó hiển thị dưới phần tử "More Options"
      let adjustedLeft = pageX;

      // Điều chỉnh vị trí nếu dropdown ra ngoài màn hình
      if (adjustedTop + dropdownHeight > height) {
        adjustedTop = height - dropdownHeight - 10;
      }

      if (adjustedLeft + dropdownWidth > width) {
        adjustedLeft = width - dropdownWidth - 10;
      }

      setDropdownPosition({top: adjustedTop, left: adjustedLeft});
      setSelectedUser(users);
    }
  };

  const mutationUpdate = useMutationHooks(data =>
    UserService.updateeUser(selectedUser?.id, data),
  );

  const handleOptionSelect = option => {
    setNameEdit(selectedUser?.name);
    setRoleEdit(selectedUser?.id_role);
    setHideEdit(selectedUser?.isHide);
    if (selectedUser?.permiss_sign === 1) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }

    if (option === 'edit') {
      setIsEditModalVisible(true); // Mở modal chỉnh sửa
    }
    if (option === 'block') {
      handleHide(selectedUser?.id);
    }
    if (option === 'delete') {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn xóa tài khoản này',
        [
          {
            text: 'Hủy', // Nút Hủy
            onPress: () => console.log('Không xóa tài khoản'),
            style: 'cancel', // Đặt nút hủy làm mặc định
          },
          {
            text: 'Đồng ý', // Nút Đồng ý
            onPress: () => handleConfirmDelete(selectedUser?.id),
          },
        ],
        {cancelable: false}, // Không cho phép đóng hộp thoại ngoài vùng xác nhận
      );
    }
    setDropdownPosition(null);
  };

  const mutationDelete = useMutationHooks(id => UserService.deleteUser(id));

  const handleConfirmDelete = id => {
    mutationDelete.mutate(id, {
      onSuccess: async () => {
        Alert.alert('Thành công', 'Xóa tài khoản thành công');
        handleGetAllUser();
      },
      onError: error => {
        Alert.alert('Lỗi', 'Lỗi trong quá trình xóa tài khoản');
        console.log(error);
      },
    });
  };

  const handleOverlayPress = () => {
    setDropdownPosition(null);
  };

  const filteredUsers = useMemo(() => {
    if (!searchText) {
      // Nếu không có text tìm kiếm, hiển thị toàn bộ người dùng
      return users;
    }
    // Lọc người dùng theo tên, không phân biệt hoa thường
    return users.filter(user =>
      user.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [users, searchText]);

  const renderUsers = ({item}) => (
    <View
      style={[
        styles.notificationItem,
        item.isHide === 0 && {backgroundColor: 'rgba(255, 0, 0, 0.1)'}, // Đặt màu nền đỏ nếu isHide === 0
      ]}>
      <View style={styles.notificationHeader}>
        <Image
          source={{
            uri:
              item.avatar ||
              'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
          }}
          style={styles.avatar}
        />
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationTitle}>{item.name}</Text>
          <Text>{roles[item.id_role]}</Text>
        </View>
        <TouchableOpacity
          onPress={event => handleMoreOptions(event, item)}
          style={styles.moreOptions}>
          <Text style={styles.moreOptionsText}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // const filteredNotifications = notifications.filter(notification =>
  //   notification.title.toLowerCase().includes(searchText.toLowerCase()),
  // );

  useEffect(() => {
    const fetchRoles = async () => {
      const roleData = {};
      for (const user of users) {
        if (!roles[user.id_role]) {
          const role = await RoleService.getRoleById(user.id_role);
          roleData[user.id_role] = role.name;
        }
      }
      setRoles(prev => ({...prev, ...roleData}));
    };

    fetchRoles();
  }, [users]);

  const mutationAddUser = useMutationHooks(data =>
    UserService.createUser(data),
  );

  const handleChangeName = value => {
    setName(value);
  };
  const handleChangeUsername = value => {
    setUserName(value);
  };
  const handleChangePassword = value => {
    setPassword(value);
  };
  const handleChangeRole = value => {
    console.log('Giá trị mới:', value);
    setRole(Number(value));
  };

  const handleGetAllUser = async id => {
    const users = await UserService.getAllUser();
    dispatch(updateListUser({users}));
  };

  const handleAddUser = () => {
    const hashedPassword = crypto.SHA256(password).toString();
    const permissSign = role === 1 || role === 2 ? 1 : 0;
    mutationAddUser.mutate(
      {
        name,
        username,
        password: hashedPassword,
        id_role: role,
        avatar: '',
        publicKey: '',
        isHide: 1,
        permiss_sign: permissSign,
      },
      {
        onSuccess: async () => {
          // const roleNameAdd = await handleGetRoleName(role);
          // if (shouldAddLog) {
          //   mutationAddLog.mutate({
          //     content: `đã thêm tài khoản <span style="color: red">${name}</span>, chức vụ <span style="color: red">${roleNameAdd}</span>`,
          //     id_user: user?.id,
          //     status: 1,
          //   });
          // }
          setName('');
          setUserName('');
          setPassword('');
          setRole(3);
          setIsModalVisible(false);
          handleGetAllUser();

          Alert.alert('Thành công', 'Tạo tài khoản thành công');
        },
        onError: error => {
          if (error?.response?.data?.error == 'Username already exists') {
            Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại');
          } else {
            Alert.alert('Lỗi', 'Có lỗi xảy ra');
          }
        },
      },
    );
  };

  const handleClose = () => {
    setName('');
    setUserName('');
    setPassword('');
    setRole(3);
    setIsModalVisible(false);
  };

  const handleChangeNameEdit = value => {
    setNameEdit(value);
  };
  const handleChangeRoleEdit = value => {
    setRoleEdit(Number(value));
  };

  const onCheckboxChange = value => {
    setIsChecked(value);
  };

  const onUpdate = async () => {
    if (!nameEdit || nameEdit.trim() === '') {
      Alert.alert('Lỗi', 'Tên người dùng không được để trống');
      return;
    }
    // if (originalName === nameEdit && originalRole === roleEdit) {
    //   setOpen(false);
    //   return;
    // }

    // const originalRoleName = await handleGetRoleName(originalRole);
    // const newRoleName = await handleGetRoleName(roleEdit);
    const permissSign = isChecked ? 1 : 0;
    // const displayPermiss = permissSign === 1 ? 'có' : 'không';

    mutationUpdate.mutate(
      {
        id: selectedUser.id,
        name: nameEdit,
        username: selectedUser.username,
        password: selectedUser.password,
        id_role: roleEdit,
        avatar: selectedUser.avatar,
        publicKey: selectedUser.publicKey,
        isHide: selectedUser.isHide,
        permiss_sign: permissSign,
      },
      {
        onSuccess: () => {
          // if (shouldAddLog) {
          //   if (originalName !== nameEdit && originalRole == roleEdit) {
          //     mutationAddLog.mutate({
          //       content: `đã chỉnh sửa thông tin tài khoản <span style="color: red;">${originalName}</span>, thay đổi tên tài khoản thành <span style="color: red;">${nameEdit}</span>, quyền ký: <span style="color: red">${displayPermiss}</span>`,
          //       id_user: user?.id,
          //       status: 2,
          //     });
          //   } else if (originalName === nameEdit && originalRole !== roleEdit) {
          //     mutationAddLog.mutate({
          //       content: `đã chỉnh sửa thông tin tài khoản <span style="color: red;">${originalName}</span>, thay đổi chức vụ từ <span style="color: red;">${originalRoleName}</span> thành <span style="color: red;">${newRoleName}</span>, , quyền ký: <span style="color: red">${displayPermiss}</span>`,
          //       id_user: user?.id,
          //       status: 2,
          //     });
          //   } else {
          //     mutationAddLog.mutate({
          //       content: `đã chỉnh sửa thông tin tài khoản <span style="color: red;">${originalName}</span>, thay đổi tên thành <span style="color: red;">${nameEdit}</span>, thay đổi chức vụ từ <span style="color: red;">${originalRoleName}</span> thành <span style="color: red;">${newRoleName}</span>, , quyền ký: <span style="color: red">${displayPermiss}</span>`,
          //       id_user: user?.id,
          //       status: 2,
          //     });
          //   }
          // }
          handleGetAllUser();
          Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        },
        onError: () => {
          Alert.alert('Lỗi', 'Có lỗi xảy ra');
        },
      },
    );
    setIsEditModalVisible(false);
  };

  const mutationHideUser = useMutationHooks(data =>
    UserService.hideUser(data.id, data),
  );

  const handleHide = id => {
    let isHideVar = 0;
    if (selectedUser?.isHide === 0) {
      isHideVar = 1; // Gán giá trị mới thay vì so sánh
    } else {
      isHideVar = 0; // Gán giá trị mới
    }

    // const userToHide = users.find(user => user.id === id);
    // const userName = userToHide ? userToHide.name : '[Tên không xác định]';
    mutationHideUser.mutate(
      {
        id: id,
        isHide: isHideVar,
      },
      {
        onSuccess: () => {
          // if (shouldAddLog) {
          //   mutationAddLog.mutate({
          //     content: `đã khóa tài khoản <span style="color:red">${userName}</span>`,
          //     id_user: user?.id,
          //     status: 5,
          //   });
          // }
          handleGetAllUser();
          if (isHideVar === 0) {
            Alert.alert('Thành công', 'Khóa tài khoản thành công');
          } else {
            Alert.alert('Thành công', 'Mở khóa tài khoản thành công');
          }
        },
        onError: error => {
          Alert.alert('Lỗi', 'Có lỗi xảy ra');
          console.log(error);
        },
      },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.container}>
        {/* Bao quanh MenuComponent với một View có position absolute */}
        <View style={styles.menuWrapper}>
          <MenuComponent />
        </View>

        <Text style={styles.title}>
          Tài khoản
          <Text style={styles.plusIcon} onPress={() => setIsModalVisible(true)}>
            {' '}
            +
          </Text>{' '}
          {/* Biểu tượng dấu cộng */}
        </Text>

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

        <View style={{flex: 1}}>
          <FlatList
            data={[...filteredUsers].reverse()}
            renderItem={renderUsers}
            keyExtractor={item => item.id}
            style={styles.notificationList}
            scrollEnabled={true}
          />
        </View>

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
                  value={name}
                  onChangeText={handleChangeName}
                  style={styles.input}
                />

                {/* Chức vụ (Picker mới từ @react-native-picker/picker) */}
                <Picker
                  selectedValue={role}
                  onValueChange={handleChangeRole}
                  style={styles.input}>
                  <Picker.Item label="Nhân viên" value={3} />
                  <Picker.Item label="IT" value={1} />
                  <Picker.Item label="Quản lý" value={2} />
                  <Picker.Item label="Khác" value={4} />
                </Picker>

                {/* Tên đăng nhập */}
                <TextInput
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChangeText={handleChangeUsername}
                  style={styles.input}
                />

                {/* Mật khẩu */}
                <TextInput
                  placeholder="Mật khẩu"
                  value={password}
                  onChangeText={handleChangePassword}
                  style={styles.input}
                  secureTextEntry
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddUser}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Tạo</Text>
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
                  value={nameEdit}
                  onChangeText={handleChangeNameEdit}
                  style={styles.input}
                />

                {/* Chức vụ (Picker mới từ @react-native-picker/picker) */}
                <Picker
                  selectedValue={roleEdit}
                  onValueChange={handleChangeRoleEdit}
                  style={styles.input}>
                  <Picker.Item label="Nhân viên" value={3} />
                  <Picker.Item label="IT" value={1} />
                  <Picker.Item label="Quản lý" value={2} />
                  <Picker.Item label="Khác" value={4} />
                </Picker>

                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={isChecked}
                    onValueChange={onCheckboxChange}
                  />
                  <Text style={styles.checkboxText}>Ký tài liệu</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onUpdate}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Lưu</Text>
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
                onPress={() => handleOptionSelect('edit')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('block')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>
                  {selectedUser?.isHide === 0 ? 'Mở khóa' : 'Khóa'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('delete')}
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
});

export default UserScreen;
