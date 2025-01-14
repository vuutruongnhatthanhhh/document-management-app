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
  Linking,
  ActivityIndicator,
} from 'react-native';

import MenuComponent from '../../components/MenuComponent/MenuComponent';
import {useSelector} from 'react-redux';
import {getDocumentById, signDocument} from '../../services/DocumentService';
import {
  createManagerNoti,
  deleteNoti,
  getAllNoti,
} from '../../services/NotiService';
import {useMutationHooks} from '../../hooks/useMutationHook';
import {useMutation} from '@tanstack/react-query';
import {notiList} from '../../redux/slides/notiSlide';
import {useDispatch} from 'react-redux';
import {WebView} from 'react-native-webview';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import dayjs from 'dayjs';

const {width, height} = Dimensions.get('window');

const NotiScreen = () => {
  const notifications = useSelector(state => state.notifications.notifications);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const users = useSelector(state => state.users.users);
  const [documentNames, setDocumentNames] = useState({});
  const [documentUrl, setDocumentUrl] = useState({});
  const [titleNotiManager, setTitleNotiManager] = useState(null);
  const [contentNotiManager, setContentNotiManager] = useState(null);

  const filteredNotifications = useMemo(
    () => notifications.filter(noti => noti.id_receiver === user.id),
    [notifications, user],
  );

  const reversedNotifications = [...filteredNotifications].reverse();

  const [dropdownPosition, setDropdownPosition] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái cho modal
  const [isModalViewVisible, setIsModalViewVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });
  const [isLoadingSign, setIsLoadingSign] = useState(false);
  const [isLoadingRefuse, setIsLoadingRefuse] = useState(false);
  const [isLoadingSendNoti, setIsLoadingSendNoti] = useState(false);

  const mutationAddManagerNoti = useMutationHooks(data =>
    createManagerNoti(data),
  );

  const handleSendManagerNoti = () => {
    setIsLoadingSendNoti(true);
    mutationAddManagerNoti.mutate(
      {
        title: titleNotiManager,
        content: contentNotiManager,
        id_user: user?.id,
      },
      {
        onSuccess: async () => {
          Alert.alert('Thành công', 'Gửi thông báo thành công');
          setIsLoadingSendNoti(false);
          // if (shouldAddLog) {
          //   mutationAddLog.mutate({
          //     content: `đã thêm thông báo mới`,
          //     id_user: user?.id,
          //     status: 1,
          //   });
          // }
          setTitleNotiManager(null);
          setContentNotiManager(null);
        },
        onError: () => {
          Alert.alert('Lỗi', 'Cần điền đầy đủ thông tin khi gửi thông báo');
          setIsLoadingSendNoti(false);
          setTitleNotiManager(null);
          setContentNotiManager(null);
        },
      },
    );

    setIsModalVisible(false);
  };

  const handleMoreOptions = (event, notification) => {
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

  const handleConfirmDelete = notificationId => {
    setIsLoadingRefuse(true);
    mutationDeleteNoti.mutate(notificationId);
  };

  const mutationSign = useMutationHooks(
    async mutationData => await signDocument(mutationData),
  );

  const getAllNotiRedux = async () => {
    try {
      const notifications = await getAllNoti();
      dispatch(notiList({notifications}));
    } catch (error) {
      console.error('Error fetching all notifications by userId', error);
    }
  };

  const handleDeleteNoti = async id => {
    await deleteNoti(id);
    getAllNotiRedux();
  };

  const handleSign = (idNoti, docId) => {
    setIsLoadingSign(true);
    const idUser = user?.id;
    const name = user?.name; // Thay thế bằng logic lấy tên người ký
    const currentTime = dayjs().format('DD-MM-YYYY HH:mm');
    const mutationData = {
      id: docId,
      data: {
        name,
        time: currentTime,
        idUser,
      },
    };
    mutationSign.mutate(mutationData, {
      onSuccess: async () => {
        handleDeleteNoti(idNoti);
        setIsLoadingSign(false);
        Alert.alert('Thành công', 'Ký tài liệu thành công!');
        // if (shouldAddLog) {
        //   mutationAddLog.mutate({
        //     content: `đã ký tệp <span style="color:red">${docName}</span>`,
        //     id_user: user?.id,
        //     status: 6,
        //   });
        // }
      },
      onError: error => {
        console.error('Error signing document:', error);
        Alert.alert('Lỗi', 'Ký tài liệu thất bại, vui lòng thử lại.');
      },
    });
  };

  const handleOptionSelect = async option => {
    const notificationId = selectedNotification.id;
    const docId = selectedNotification.id_document;
    if (option === 'refuse') {
      // Hiển thị confirm dialog
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn từ chối?',
        [
          {
            text: 'Hủy', // Nút Hủy
            onPress: () => console.log('Từ chối đã bị hủy'),
            style: 'cancel', // Đặt nút hủy làm mặc định
          },
          {
            text: 'Đồng ý', // Nút Đồng ý
            onPress: () => handleConfirmDelete(notificationId),
          },
        ],
        {cancelable: false}, // Không cho phép đóng hộp thoại ngoài vùng xác nhận
      );
    }
    if (option === 'view') {
      // Hiển thị confirm dialog
      // setIsModalViewVisible(true);
      const dataDoc = await getDocumentById(selectedNotification.id_document);
      const docUrl = dataDoc.url;
      const extension = docUrl.split('.').pop().toLowerCase();

      // Kiểm tra extension
      const isPdfOrImage = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(
        extension,
      );
      if (isPdfOrImage) {
        // Nếu là file PDF hoặc ảnh, mở trực tiếp
        await InAppBrowser.open(docUrl);
      } else {
        // Nếu không, mở qua Office Viewer
        await InAppBrowser.open(
          `https://view.officeapps.live.com/op/view.aspx?src=${docUrl}`,
        );
      }
    }

    if (option === 'sign') {
      handleSign(notificationId, docId);
    }
    setDropdownPosition(null);
  };

  const handleOverlayPress = () => {
    setDropdownPosition(null);
  };

  const findSenderAvatar = id_sender => {
    const sender = users.find(user => user.id === id_sender);
    return {
      uri:
        sender?.avatar ||
        'https://cdn-icons-png.flaticon.com/512/6596/6596121.png',
    }; // Trả về URL avatar hoặc null
  };

  const findSenderName = id_sender => {
    const sender = users.find(user => user.id === id_sender);
    return sender ? sender.name : 'Không xác định';
  };

  const renderNotificationItem = ({item}) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <Image
          source={findSenderAvatar(item.id_sender)}
          style={styles.avatar}
        />
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationTitle}>
            {findSenderName(item.id_sender)}
          </Text>
          <Text>
            đã gửi yêu cầu ký tệp{' '}
            <Text style={styles.docName}>
              {documentNames[item.id_document]}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={event => handleMoreOptions(event, item)}
          style={styles.moreOptions}>
          {isLoadingSign || isLoadingRefuse ? (
            // Hiển thị biểu tượng loading thay cho nội dung nút
            <ActivityIndicator size="small" color="blue" />
          ) : (
            <Text style={styles.moreOptionsText}>⋮</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleGetDocumentById = async id => {
    const document = await getDocumentById(id);
    return document;
  };

  useEffect(() => {
    const fetchDocumentNames = async () => {
      const names = {};
      const url = {};
      for (const notification of filteredNotifications) {
        if (notification.id_document) {
          const document = await handleGetDocumentById(
            notification.id_document,
          );
          names[notification.id_document] =
            document?.name || 'Tên không xác định';
          url[notification.id_document] = document?.url;
        }
      }
      setDocumentNames(names);
      setDocumentUrl(url);
    };

    fetchDocumentNames();
  }, [filteredNotifications]);

  const handleChangeTitleNotiManager = value => {
    setTitleNotiManager(value);
  };

  const handleChangeContentNotiManager = value => {
    setContentNotiManager(value);
  };

  const getAllNotification = async () => {
    try {
      const notifications = await getAllNoti();
      dispatch(notiList({notifications}));
    } catch (error) {
      console.error('Error fetching all notifications by userId', error);
    }
  };

  const mutationDeleteNoti = useMutation({
    mutationFn: id => deleteNoti(id),
    onSuccess: (data, variables) => {
      // if (shouldAddLog) {
      //   const currentNotification = notifications.find(
      //     (noti) => noti.id === variables
      //   );

      //   // Lấy id_document từ thông báo
      //   const id_document = currentNotification?.id_document;

      //   // Lấy tên tài liệu từ documentNames
      //   const documentName = documentNames[id_document] || "Tên không xác định";

      //   mutationAddLog.mutate({
      //     content: `đã từ chối ký tài liệu <span style="color:red">${documentName}</span>`,
      //     id_user: my_user?.id,
      //     status: 6,
      //   });
      // }
      getAllNotification();
      Alert.alert('Thành công', 'Từ chối yêu cầu thành công');
      setIsLoadingRefuse(false);
    },
    onError: () => {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi từ chối yêu cầu');
      setIsLoadingRefuse(false);
    },
  });

  return (
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.container}>
        {/* Bao quanh MenuComponent với một View có position absolute */}
        <View style={styles.menuWrapper}>
          <MenuComponent />
        </View>

        <Text style={styles.title}>Thông Báo</Text>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => setIsModalVisible(true)}>
          <Text style={styles.sendButtonText}>Gửi Thông Báo</Text>
        </TouchableOpacity>
        {reversedNotifications.length === 0 ? (
          <Text>Không có thông báo</Text>
        ) : (
          <FlatList
            data={reversedNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            style={styles.notificationList}
          />
        )}

        {/* Modal gửi thông báo */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            {isLoadingSendNoti ? (
              // Hiển thị biểu tượng loading thay cho nội dung nút
              <ActivityIndicator size="small" color="blue" />
            ) : (
              <View style={styles.modalOverlay}>
                <View style={styles.modal}>
                  <Text style={styles.modalTitle}>Gửi Thông Báo</Text>
                  <TextInput
                    placeholder="Tiêu đề"
                    value={titleNotiManager}
                    onChangeText={handleChangeTitleNotiManager}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Nội dung"
                    value={contentNotiManager}
                    onChangeText={handleChangeContentNotiManager}
                    style={styles.input}
                    multiline
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        handleSendManagerNoti();
                      }}
                      style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>Gửi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsModalVisible(false)}
                      style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
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
                onPress={() => handleOptionSelect('view')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Xem</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('sign')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Ký</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionSelect('refuse')}
                style={styles.modalOption}>
                <Text style={styles.modalOptionText}>Từ chối</Text>
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
  docName: {
    color: 'red',
  },
});

export default NotiScreen;
