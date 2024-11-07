import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import homeLine from '~/assets/images/home/homeLine.png';
import icHomeBuy from '~/assets/images/home/icHomeBuy.png';
import icHomeSell from '~/assets/images/home/icHomeSell.png';
import icHomeWays from '~/assets/images/home/icHomeWays.png';
import homeLinkbtn from '~/assets/images/home/homeLinkbtn.png';
import homeBgMainarea from '~/assets/images/home/homeBgMainarea.png';
import colors from '~/theme/color';
import Text from '~/components/Text';
import spacing from '~/theme/spacing';
import ListItem from './components/ListItem';
import Image from '~/components/Image';
import ImageIcon from '~/components/ImageIcon';
import coinIcon from '~/assets/images/icCoin.png';
import ScrollViewBox from '~/components/ScrollViewBox';
import EyeIconButton from '~/components/Button/EyeIconButton';
import { formatMoney } from '~/utils/formatHelper';
import { ORDER_TYPE } from '~/constants/status.config';

const HomeText = (props) => <Text color='secondary' {...props} />;

const BalanceBox = ({ title, content, containerStyle }) => (
  <View style={containerStyle}>
    <HomeText h5 fontWeight='medium' style={styles.balanceTitle}>
      {title}
    </HomeText>
    <View style={styles.numberContent}>
      <ImageIcon source={coinIcon} size={16} style={styles.coinIcon} />
      <HomeText h4 fontWeight='medium'>
        {content}
      </HomeText>
    </View>
  </View>
);

const HomeScreen = ({
  id,
  cards,
  isAuth,
  usefulBalance,
  navigation,
  guaranteedBalance,
  handleGetUserInfo,
  handleGetCards,
}) => {
  const [showBalance, setShowBalance] = useState(false);

  const hasNoCard = cards.isEmpty();
  const hasNoCardText = hasNoCard ? '未設置' : '';
  const getBalanceAmount = (amount) =>
    showBalance ? formatMoney(amount) : '******';

  useEffect(() => {
    if (id) {
      handleGetUserInfo(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isAuth && hasNoCard) {
      handleGetCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNoCard]);

  return (
    <ScrollViewBox
      fill
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              handleGetUserInfo(id);
              handleGetCards();
            }}
          />
        ),
      }}>
      <ImageBackground source={homeBgMainarea} style={styles.imagebg}>
        <View style={styles.upperContainerStyle}>
          <View style={styles.row}>
            <ImageIcon source={coinIcon} size={16} style={styles.coinIcon} />
            <HomeText h5 style={styles.eCoin} fontWeight='bold'>
              E幣
            </HomeText>
            <EyeIconButton
              onEyePress={() => setShowBalance(!showBalance)}
              showContent={showBalance}
              eyeColor={colors.secondary}
            />
          </View>
          <View style={styles.mainBalanceBox}>
            <View style={styles.amountBox}>
              <HomeText h1 fontWeight='bold'>
                {getBalanceAmount(usefulBalance)}
              </HomeText>
              <Image
                style={styles.linkOrder}
                source={homeLinkbtn}
                // onPress={() => switchTabIndex(3)}
                onPress={() => navigation.navigate("Buy-Order", {screen: "Buy-Order-Home"})}
              />
            </View>
            <HomeText h5 fontWeight='medium'>
              = CNY ¥{getBalanceAmount(usefulBalance)}
            </HomeText>
          </View>

          <Image style={styles.dividerStyle} source={homeLine} />
          <View style={styles.balanceBox}>
            <BalanceBox
              title='可用餘額 (E幣)'
              content={getBalanceAmount(usefulBalance)}
              containerStyle={styles.usefulBalance}
            />
            <BalanceBox
              title='擔保餘額 (E幣)'
              content={getBalanceAmount(guaranteedBalance)}
              containerStyle={styles.depositAmount}
            />
          </View>
        </View>
      </ImageBackground>
      <View>
        <ListItem
          title='我要買'
          icon={icHomeBuy}
          onPress={() => navigation.navigate("Transaction", {
            screen: "Transaction-Home",
            params: {searchType: ORDER_TYPE.BUY},
          })}
        />
        <ListItem
          title='我要賣'
          icon={icHomeSell}
          onPress={() => navigation.navigate("Transaction", {
            screen: "Transaction-Home",
            params: {searchType: ORDER_TYPE.SALE},
          })}
        />
        <ListItem
          title='收付方式'
          rightTitle={hasNoCardText}
          icon={icHomeWays}
          onPress={() => navigation.navigate('Wallet-Bank-Card-Modal')}
        />
      </View>
    </ScrollViewBox>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  upperContainerStyle: {
    paddingHorizontal: spacing.big,
  },
  coinIcon: {
    marginRight: 8,
  },
  imagebg: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: spacing.middle,
    minHeight: 380,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eCoin: {
    paddingRight: spacing.middle,
  },
  dividerStyle: {
    height: 10,
  },
  linkOrder: {
    width: 80,
    height: 80,
  },
  mainBalanceBox: {
    paddingTop: spacing.middle,
    paddingBottom: spacing.big,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.middle,
  },
  balanceTitle: {
    paddingBottom: spacing.small,
  },
  usefulBalance: {
    width: '50%',
  },
  guaranteedBalance: {
    width: '50%',
    paddingLeft: spacing.big,
  },
});

export default HomeScreen;
