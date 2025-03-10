import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";
import colors from "./constants/colors";
import { useState } from "react";

export default function RequestsScreen() {
    const [activeFilter, setActiveFilter] = useState(null);

    const getButtonColor = (filter) => {
        switch (filter) {
            case "accepted": return colors.success;
            case "rejected": return colors.danger;
            case "pending": return colors.warning;
            default: return "#e0e0e0";
        }
    };

    return (
        <View style={styles.screen}>

            <View style={styles.profile_block}>
                <Text style={styles.student_name}>Иванов Иван Иванович</Text>
                <Text style={styles.student_group}>Группа: ИВТ-21</Text>
            </View>

            <View style={styles.filter_block}>
                <TouchableOpacity style={[styles.filter_button, styles.left_button, styles.active_filter]}>
                    <Text style={styles.filter_text}>Приняты</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.filter_button]}>
                    <Text style={styles.filter_text}>Отклонены</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.filter_button, styles.right_button]}>
                    <Text style={styles.filter_text}>На проверке</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={[{}, {}, {}, {}, {}, {}, {}, {}, {}]}
                renderItem={() => <RequestCard />}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
}

function RequestCard() {
    return (
        <View style={styles.card}>

            <View style={[styles.card_row, { justifyContent: "space-between" }]}>
                <View style={{ flexDirection: "row" }}>
                    <Image source={require("../assets/images/check-icon.png")} style={styles.icon} />
                    <Text style={styles.date}>25.02.2025 - 27.02.2025</Text>
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
        backgroundColor: "#E6E6E6",
        alignSelf: "center",
    },

    /*** Плашка с данными ***/
    profile_block: {
        marginBottom: 16,
    },
    student_name: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text,
    },
    student_group: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
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
        fontSize: 18,
        color: colors.text,
        letterSpacing: -0.5,
    },
    reason: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: colors.textTransparent,
    },
});