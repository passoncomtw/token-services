import React from "react";
import { TouchableWithoutFeedback } from "react-native";
import { Text, Icon } from "react-native-elements";
import { View, StyleSheet } from "react-native";
import Button from "~/components/Button";
import themeSet from "~/theme";
import theme from "~/theme";

const CardItem = (props) => {
  const styles = getStyle(themeSet, defaultCard);
  const { bankName, owner, cardNo, branch, onEdit, defaultCard, onPress } = props;

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.root}>
        <View style={styles.contentZone}>
          <Text style={styles.title}>{bankName}</Text>
          <Text style={styles.subtitle}>{cardNo}</Text>
          <Text style={styles.content}>{owner}</Text>
          <Text style={styles.content}>{branch}</Text>
        </View>
        <View style={styles.buttonZone}>
          <Button title="編輯" type="clear" onPress={onEdit} />
          {defaultCard && (
            <Icon name="check" size={30} color={theme.colors.success} />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyle = (theme, defaultCard) =>
  StyleSheet.create({
    root: {
      width: "100%",
      display: "flex",
      padding: 15,
      flexDirection: "row",
      borderWidth: 1,
      borderColor: defaultCard ? theme.colors.success : theme.colors.greyLight,
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.small,
    },
    title: {
      fontWeight: "bold",
      fontSize: theme.fontSize.h3,
      marginTop: theme.spacing.small,
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      fontSize: theme.fontSize.h4,
      marginBottom: theme.spacing.small,
    },
    content: {
      fontSize: theme.fontSize.h5,
      marginBottom: theme.spacing.small,
    },
    contentZone: {
      flex: 1,
    },
    buttonZone: {
      width: 100,
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
  });

export default CardItem;
