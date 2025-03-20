import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";
import colors from "./constants/colors";
import { useEffect, useState } from "react";
import { getAbsences, getProfile, } from "./api/axios";

// const mockRequests: RequestItem[] = [
//     {
//         Id: 1,
//         UserId: 101,
//         Type: "AbsenceType",
//         StartDate: "2025.03.01",
//         EndDate: "2025.03.05",
//         Status: "pending",
//         Documents: [],
//     },
//     {
//         Id: 2,
//         UserId: 102,
//         Type: "AbsenceType",
//         StartDate: "2025.02.15",
//         EndDate: "2025.02.20",
//         Status: "approved",
//         Documents: [],
//     },
//     {
//         Id: 3,
//         UserId: 103,
//         Type: "AbsenceType",
//         StartDate: "2025.01.10",
//         EndDate: "2025.01.12",
//         Status: "rejected",
//         Documents: [],
//     },
// ];

type AbsenceStatus = "pending" | "approved" | "rejected";

interface RequestItem {
    Id: number;
    UserId: number;
    Type: string;
    StartDate: string;
    EndDate: string | null;
    Status: AbsenceStatus;
    Documents: Array<any>;
}

export default function RequestsScreen() {
    const [profile, setProfile] = useState<{ fullName: string; groupId: string } | null>(null);
    const [selected, setSelected] = useState<"pending" | "approved" | "rejected" | null>(null);
    const [requests, setRequests] = useState<any[]>([]);

    const getButtonColor = (filter: "approved" | "rejected" | "pending" | null) => {
        switch (filter) {
            case "approved": return colors.successLight;
            case "rejected": return colors.dangerLight;
            case "pending": return colors.warningLight;
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

        const fetchRequests = async () => {
            try {
                const requestsData = await getAbsences({
                    size: 10,
                    sorting: 'CreateDesc',
                    status: 'Pending',
                });
                setRequests(requestsData);
            } catch (error) {
                console.error("Ошибка при загрузке заявок:", error);
            }
        };

        fetchProfile();
        //fetchRequests();
    }, []);

    const filteredRequests = selected
        ? requests.filter((request) => request.Status === selected)
        : requests;

    return (
        <View style={styles.screen}>

            <View style={styles.profile_block}>
                {profile ? (
                    <>
                        <Text>{profile.fullName}</Text>
                        <Text>Группа: {profile.groupId}</Text>
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
                    selected === "approved" && { backgroundColor: getButtonColor("approved") }
                    ]}
                    onPress={() => setSelected(selected === "approved" ? null : "approved")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "approved"
                            ? colors.successDark
                            : colors.text
                    }]}>Приняты</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.filter_button,
                    { borderRightWidth: 0 },
                    selected === "rejected" && { backgroundColor: getButtonColor("rejected") }
                    ]}
                    onPress={() => setSelected(selected === "rejected" ? null : "rejected")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "rejected"
                            ? colors.danger
                            : colors.text
                    }]}>Отклонены</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.filter_button, styles.right_button,
                    selected === "pending" && { backgroundColor: getButtonColor("pending") }
                    ]}
                    onPress={() => setSelected(selected === "pending" ? null : "pending")}>
                    <Text style={[styles.filter_text, {
                        color: selected === "pending"
                            ? colors.warningDark
                            : colors.text
                    }]}>На проверке</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={({ item }) => <RequestCard request={item} />}
                keyExtractor={(item) => item.Id.toString()}
                ListEmptyComponent={<Text style={styles.empty_text}>Нет заявок по выбранному фильтру</Text>}
            />
        </View >
    );
}

function RequestCard({ request }: { request: RequestItem }) {
    const { Status, StartDate, EndDate } = request;

    const statusIcons: Record<AbsenceStatus, any> = {
        approved: require("../assets/images/check-icon.png"),
        rejected: require("../assets/images/cancel-icon.png"),
        pending: require("../assets/images/wait-icon.png"),
    };

    return (
        <View style={styles.card}>

            <View style={[styles.card_row, { justifyContent: "space-between" }]}>
                <View style={{ flexDirection: "row" }}>
                    <Image source={statusIcons[Status]} style={styles.icon} />
                    <Text style={styles.date}> {StartDate} - {EndDate || "не указано"}</Text>
                </View>
                <View>
                    <Image source={require("../assets/images/three-dots-icon.png")} style={styles.text_icon} />
                </View>
            </View>

            <View style={styles.card_row}>
                <Image source={require("../assets/images/list-icon.png")} style={styles.text_icon} />
                <Text style={styles.reason}>Причина: Семейные обстоятельства</Text>
            </View>

            <View style={styles.card_row}>
                <Image source={require("../assets/images/tag-icon.png")} style={styles.text_icon} />
                <Text style={styles.reason}>Документ прикреплён</Text>
            </View>

        </View>
    );
}


const styles = StyleSheet.create({
    screen: {
        backgroundColor: colors.secondary,
    },
    separator: {
        height: 1,
        width: "90%",
        backgroundColor: "#FFF",
        alignSelf: "center",
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
        fontSize: 17,
        color: colors.text,
    },
    reason: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: colors.textLight,
    },

    empty_text: {
        textAlign: 'center',
        fontSize: 14,
        color: colors.textLight,
        marginTop: 20,
        fontFamily: "Inter_400Regular",
    },
});