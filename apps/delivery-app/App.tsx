import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Navigation, RotateCcw, Wallet, Truck } from 'lucide-react-native';

import { theme } from './src/theme';
import { RiderProvider } from './src/context/RiderContext';
import { RiderHeader } from './src/components/RiderHeader';
import { DeliveriesScreen } from './src/screens/DeliveriesScreen';
import { CoolerIntakeScreen } from './src/screens/CoolerIntakeScreen';
import { EarningsScreen } from './src/screens/EarningsScreen';

type RiderTab = 'deliveries' | 'intake' | 'earnings';

function RiderApp() {
  const [activeTab, setActiveTab] = useState<RiderTab>('deliveries');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header */}
      <RiderHeader />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'deliveries' && <DeliveriesScreen />}
        {activeTab === 'intake' && <CoolerIntakeScreen />}
        {activeTab === 'earnings' && <EarningsScreen />}
      </View>

      {/* Bottom Fleet Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('deliveries')}
        >
          <Truck
            size={22}
            color={activeTab === 'deliveries' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'deliveries' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'deliveries' && styles.tabLabelActive,
            ]}
          >
            Deliveries
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('intake')}
        >
          <RotateCcw
            size={22}
            color={activeTab === 'intake' ? theme.colors.emerald : theme.colors.textMuted}
            strokeWidth={activeTab === 'intake' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'intake' && styles.tabLabelActiveGreen,
            ]}
          >
            Box Intake
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('earnings')}
        >
          <Wallet
            size={22}
            color={activeTab === 'earnings' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'earnings' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'earnings' && styles.tabLabelActive,
            ]}
          >
            Earnings
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RiderProvider>
        <RiderApp />
      </RiderProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.fleetCard,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.fleetCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.fleetBorder,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    ...theme.shadow.card,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weightMedium,
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
  tabLabelActiveGreen: {
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightBold,
  },
});
