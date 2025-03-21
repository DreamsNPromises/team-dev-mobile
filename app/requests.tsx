import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, TextInput, Button, TouchableWithoutFeedback, Pressable, Switch, Alert } from "react-native";
import colors from "./constants/colors";
import React, { useEffect, useState } from "react";
import { createAbsenceRequest, getAbsenceById, getAbsences, getProfile, updateAbsenceRequest, } from "./api/axios";
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSignalR } from "./api/useSignalR";

type AbsenceStatus = "Pending" | "Approved" | "Rejected";

interface RequestItem {
    id: string;
    userId: string;
    studentName: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    group: string;
    status: AbsenceStatus;
    startDate: string;
    endDate: string;
    declarationToDean: boolean;
    rejectionReason?: string;
    documents?: DocumentData[];
}

interface DocumentData {
    uri: string;
    name: string;
    type: string;
}

export default function RequestsScreen() {
    const [profile, setProfile] = useState<{ fullName: string; groupId: string } | null>(null);
    const [selected, setSelected] = useState<AbsenceStatus | null>(null);
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    useSignalR('Students', setRequests);

    const openCreateModal = () => {
        setEditingRequest(null);
        setIsModalVisible(true);
    };

    const openEditModal = (request: RequestItem) => {
        setEditingRequest(request);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setEditingRequest(null);
    };

    const handleSubmit = async (requestData: NewRequest) => {
        if (editingRequest) {
            await handleUpdateRequest(editingRequest.id, requestData);
        } else {
            await handleCreateRequest(requestData);
        }

        closeModal();
    };

    const handleUpdateRequest = async (id: string, requestData: NewRequest) => {
        try {
            console.log('Обновляем заявку:', id, requestData);

            await updateAbsenceRequest(id, requestData);

            setPage(1);
            setRequests([]);

            closeModal();
        } catch (error) {
            console.error('Ошибка при обновлении заявки:', error);
        }
    };

    const handleCreateRequest = async (requestData: {
        type: string;
        startDate: string;
        endDate: string;
        declarationToDean: boolean;
        documents?: DocumentData | null;
    }) => {
        try {
            console.log('Отправляем запрос:', requestData);

            await createAbsenceRequest(requestData);

            setPage(1);
            setRequests([]);

            closeModal();
        } catch (error) {
            console.error('Ошибка при отправке заявки:', error);
        }
    };


    const getButtonColor = (filter: AbsenceStatus | null) => {
        switch (filter) {
            case "Approved": return colors.successLight;
            case "Rejected": return colors.dangerLight;
            case "Pending": return colors.warningLight;
            default: return "#e0e0e0";
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
            }
        };

        const fetchRequests = async (page: number) => {
            setLoading(true);

            try {
                const requestsData = await getAbsences({
                    size: 10,
                    sorting: 'CreateDesc',
                    page: page,
                });

                const detailedRequests = await Promise.all(
                    requestsData.map(async (request: RequestItem) => {
                        const detailedRequest = await getAbsenceById(request.id);
                        return { ...request, ...detailedRequest };
                    })
                );

                if (detailedRequests.length === 0) {
                    setHasMore(false);
                } else {
                    setRequests(requestsData => [...requestsData, ...detailedRequests]);
                }

            } catch (error) {
                console.error("Ошибка при загрузке заявок:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        fetchRequests(page);
    }, [page]);

    const filteredRequests = selected
        ? requests.filter((request) => request.status === selected)
        : requests;

    const handleEndReached = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    return (
        <View style={styles.screen}>

            <View style={styles.profile_block}>
                {profile ? (
                    <>
                        <Text style={styles.student_name}>{profile.fullName}</Text>
                        <Text style={styles.student_group}>Группа: {profile.groupId}</Text>
                    </>
                ) : (
                    <Text>Не удалось загрузить профиль</Text>
                )}
            </View>

            <View style={styles.filter_block}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.filter_button, styles.left_button,
                    { borderRightWidth: 0 },
                    selected === "Approved" && { backgroundColor: getButtonColor("Approved") }
                    ]}
                    onPress={() => setSelected(selected === "Approved" ? null : "Approved")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "Approved"
                            ? colors.successDark
                            : colors.text
                    }]}>Приняты</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.filter_button,
                    { borderRightWidth: 0 },
                    selected === "Rejected" && { backgroundColor: getButtonColor("Rejected") }
                    ]}
                    onPress={() => setSelected(selected === "Rejected" ? null : "Rejected")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "Rejected"
                            ? colors.danger
                            : colors.text
                    }]}>Отклонены</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.filter_button, styles.right_button,
                    selected === "Pending" && { backgroundColor: getButtonColor("Pending") }
                    ]}
                    onPress={() => setSelected(selected === "Pending" ? null : "Pending")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "Pending"
                            ? colors.warningDark
                            : colors.text
                    }]}>На проверке</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={({ item }) => <RequestCard key={item.id} request={item} onEdit={openEditModal} />}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    loading ? (
                        <Text style={styles.empty_text}>Загрузка...</Text>
                    ) : (
                        <Text style={styles.empty_text}>Нет заявок по выбранному фильтру</Text>
                    )
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
            //ListFooterComponent={loading ? <LoadingSpinner /> : null}
            />

            <TouchableOpacity onPress={openCreateModal}>
                <Text style={styles.createRequestButton}>
                    Создать заявку +
                </Text>
            </TouchableOpacity>

            <RequestModal
                isVisible={isModalVisible}
                onClose={closeModal}
                onSubmit={handleSubmit}
                existingRequest={editingRequest}
            />
        </View >
    );
}

function RequestCard({
    request,
    onEdit,
}: {
    request: RequestItem;
    onEdit: (request: RequestItem) => void;
}) {
    const { status, type, startDate, endDate, rejectionReason } = request;

    const statusIcons: Record<AbsenceStatus, any> = {
        Approved: require("../assets/images/check-icon.png"),
        Rejected: require("../assets/images/cancel-icon.png"),
        Pending: require("../assets/images/wait-icon.png"),
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const typeMapping: Record<string, string> = {
        Sick: "Болезнь",
        Family: "Семейные обстоятельства",
        Academic: "Учебные",
    };

    return (
        <View style={styles.card}>

            <View style={[styles.card_row, { justifyContent: "space-between" }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={statusIcons[status]} style={styles.icon} />
                    <Text style={styles.date}>
                        {formatDate(startDate)} - {endDate ? formatDate(endDate) : "не указано"}
                    </Text>
                </View>
            </View>

            <View style={styles.card_row}>
                <Image source={require("../assets/images/list-icon.png")} style={styles.text_icon} />
                <Text style={styles.reason}> Причина: {typeMapping[type]}</Text>
            </View>

            {status === "Rejected" && rejectionReason && (
                <View style={styles.card_row}>
                    <Text style={styles.rejection_reason_text}>Причина отклонения: {rejectionReason}</Text>
                </View>
            )}

            <View style={styles.card_row}>
                <TouchableOpacity onPress={() => onEdit(request)} style={[styles.edit_button]}>
                    <Text style={styles.edit_button_text}> ⋮  Редактировать</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

interface RequestModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (newRequest: any) => void;
    existingRequest?: RequestItem | null;
}

interface NewRequest {
    type: string;
    startDate: string;
    endDate: string;
    declarationToDean: boolean;
    documents?: DocumentData | null;
}

const RequestModal: React.FC<RequestModalProps> = ({ isVisible, onClose, onSubmit, existingRequest }) => {
    const [newRequest, setNewRequest] = useState<NewRequest>({
        type: 'Sick',
        startDate: '',
        endDate: '',
        declarationToDean: false,
        documents: null,
    });

    useEffect(() => {
        if (existingRequest) {
            setNewRequest({
                type: existingRequest.type,
                startDate: formatDate(existingRequest.startDate),
                endDate: existingRequest.endDate ? formatDate(existingRequest.endDate) : '',
                declarationToDean: existingRequest.declarationToDean || false,
                documents: existingRequest.documents ? existingRequest.documents[0] : null,
            });
        } else {
            setNewRequest({
                type: 'Sick',
                startDate: '',
                endDate: '',
                declarationToDean: false,
                documents: null,
            });
        }
    }, [existingRequest]);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleSubmit = () => {
        const convertToISO = (dateString: string) => {
            const parts = dateString.split('.');

            const [day, month, year] = parts;

            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
            );

            return date.toISOString();
        };

        let isValid = true;
        let errorMessage = '';

        if (newRequest.type === 'Sick') {
            // Sick: document не обязателен, даты не обязательны
            if (!newRequest.startDate) {
                errorMessage = "Укажите дату начала.";
                isValid = false;
            }
        } else if (newRequest.type === 'Academic') {
            // Academic: документ обязателен, даты обязательны
            if (!newRequest.startDate || !newRequest.endDate) {
                errorMessage = "Укажите даты начала и окончания.";
                isValid = false;
            }
            if (!newRequest.documents) {
                errorMessage = "Документ обязателен.";
                isValid = false;
            }
        } else if (newRequest.type === 'Family') {
            // Family: если нет документа, обязательна пометка в "Заявление в деканат"
            if (!newRequest.documents && !newRequest.declarationToDean) {
                errorMessage = "Если нет документа, должно быть заявление в деканат.";
                isValid = false;
            }
        }

        if (!isValid) {
            Alert.alert('Ошибка', errorMessage, [
                { text: 'OK', onPress: () => console.log('OK нажато') },
            ])
            return;
        }

        const requestWithISO = {
            ...newRequest,
            startDate: convertToISO(newRequest.startDate),
            endDate: convertToISO(newRequest.endDate),
        };

        console.log('Что отправляем на сервер:', requestWithISO);

        onSubmit(requestWithISO);
        onClose();
    };

    // const showDatepicker = () => {
    //     setShow(true);
    // };
    //
    // const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    //     const currentDate = selectedDate || date;
    //     setShow(false);
    //     setDate(currentDate);
    //     setNewRequest({ ...newRequest, startDate: currentDate.toLocaleDateString() });
    // };

    const handleDateChange = (input: string, field: 'startDate' | 'endDate') => {
        const numbersOnly = input.replace(/[^0-9]/g, '');

        let formatted = numbersOnly;

        if (numbersOnly.length > 2 && numbersOnly.length <= 4) {
            formatted = `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
        } else if (numbersOnly.length > 4) {
            formatted = `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 4)}.${numbersOnly.slice(4, 8)}`;
        }

        setNewRequest((prev) => ({
            ...prev,
            [field]: formatted,
        }));
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: false,
            });

            if (result.assets && result.assets.length > 0) {
                const doc = result.assets[0];
                console.log('Документ выбран:', doc);

                const documentData: DocumentData = {
                    uri: doc.uri,
                    name: doc.name,
                    type: doc.mimeType || 'application/octet-stream',
                };

                setNewRequest((prev) => ({
                    ...prev,
                    documents: documentData,
                }));
            }

        } catch (error) {
            console.log('Ошибка выбора документа:', error);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modal_overlay}>
                    <Pressable style={styles.modal_container} onPress={() => { }}>
                        <Text style={styles.modal_title}>Создать заявку</Text>


                        {newRequest.type !== 'Family' && (
                            <View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Дата начала"
                                    value={newRequest.startDate}
                                    //onFocus={showDatepicker}
                                    onChangeText={(text) => handleDateChange(text, 'startDate')}
                                    maxLength={10}
                                    keyboardType="numeric"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Дата окончания"
                                    value={newRequest.endDate}
                                    onChangeText={(text) => handleDateChange(text, 'endDate')}
                                    maxLength={10}
                                    keyboardType="numeric"
                                />
                            </View>)}

                        <Text>Причина</Text>
                        <Picker
                            selectedValue={newRequest.type}
                            onValueChange={(itemValue) => setNewRequest({ ...newRequest, type: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Болезнь" value="Sick" />
                            <Picker.Item label="Семейные обстоятельства" value="Family" />
                            <Picker.Item label="Учебные" value="Academic" />
                        </Picker>

                        {newRequest.type === 'Family' && (
                            <View style={styles.switchContainer}>
                                <Text>Заявление в деканат</Text>
                                <Switch
                                    value={newRequest.declarationToDean}
                                    onValueChange={(value) => setNewRequest({ ...newRequest, declarationToDean: value })}
                                />
                            </View>
                        )}

                        <TouchableOpacity onPress={handlePickDocument} style={[styles.button, { backgroundColor: colors.textLight }]}>
                            <Text style={styles.button_text}>Прикрепить документ</Text>
                        </TouchableOpacity>


                        {newRequest.documents && (
                            <View>
                                <Text style={styles.file_name}>Файл: {newRequest.documents?.name}</Text>
                            </View>
                        )}

                        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                            <Text style={styles.button_text}>Отправить</Text>
                        </TouchableOpacity>
                    </Pressable>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFF",
    },

    /*** Плашка с данными ***/
    profile_block: {
        margin: 16,
        paddingLeft: 25,
    },
    student_name: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: colors.text,
    },
    student_group: {
        fontSize: 12,
        fontFamily: "Inter_400Regular",
        color: colors.textLight,
    },

    /*** Фильтры ***/
    filter_block: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 16,
    },
    filter_button: {
        flex: 1,
        backgroundColor: colors.secondary,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EAECF0",
    },
    active_filter: {
        backgroundColor: colors.primary,
    },
    filter_text: {
        color: colors.text,
        fontSize: 14,
        fontFamily: "Inter_500Medium",
    },

    left_button: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    right_button: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },


    /*** Карточка ***/
    card: {
        backgroundColor: "#FCFCFD",
        flexDirection: "column",
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderColor: "#EAECF0",
        borderWidth: 1,
        gap: 10,
    },
    card_row: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 28,
        height: 28,
        marginRight: 12,
    },
    text_icon: {
        width: 16,
        height: 16,
        resizeMode: "contain",
    },
    info: {
        //flex: 1,
    },
    date: {
        fontFamily: "Inter_700Bold",
        fontSize: 16,
        color: colors.text,
    },
    reason: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: colors.textLight,
    },
    rejection_reason_text: {
        color: colors.danger,
        fontFamily: "Inter_400Regular",
    },

    empty_text: {
        textAlign: 'center',
        fontSize: 14,
        color: colors.textLight,
        marginTop: 20,
        fontFamily: "Inter_400Regular",
    },
    edit_button: {
        backgroundColor: colors.textLight,
        padding: 8,
        borderRadius: 6,
    },
    edit_button_text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: "Inter_400Regular",
    },

    /*** Модальное окно ***/
    createRequestButton: {
        backgroundColor: "#FCFCFD",
        padding: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        textAlign: "center",
        fontFamily: "Inter_400Regular",
        color: colors.text,
        fontSize: 16,
        borderColor: "#EAECF0",
        borderWidth: 1,
    },
    modal_overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal_container: {
        backgroundColor: "white",
        padding: 20,
        width: 300,
        borderRadius: 10,
    },
    modal_title: {
        fontSize: 16,
        marginBottom: 15,
        fontFamily: "Inter_500Medium",
    },
    input: {
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
        borderRadius: 5,
    },

    picker: {
        height: 50,
        width: "100%",
        borderColor: "#ddd",
        borderWidth: 1,
    },

    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },

    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    button_text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: "Inter_400Regular",
    },
    file_name: {
        fontSize: 14,
        color: '#333',
        marginVertical: 10,
    },
});