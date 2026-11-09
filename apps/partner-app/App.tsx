import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Scissors, Anchor, Sparkles, Layers } from 'lucide-react-native';

import { theme } from './src/theme';
import { PartnerProvider, usePartner } from './src/context/PartnerContext';
import { PartnerHeader } from './src/components/PartnerHeader';
import { PrepStationScreen } from './src/screens/PrepStationScreen';
import { InwardCatchScreen } from './src/screens/InwardCatchScreen';
import { CoolerSanitizationScreen } from './src/screens/CoolerSanitizationScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';

type PartnerTab = 'prep' | 'inward' | 'sanitization' | 'inventory';

function MainPartnerApp() {
  const [activeTab, setActiveTab] = useState<PartnerTab>('prep');
  const { orders } = usePartner();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <PartnerHeader ordersCount={orders.length || 5} />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'prep' && <PrepStationScreen />}
        {activeTab === 'inward' && <InwardCatchScreen />}
        {activeTab === 'sanitization' && <CoolerSanitizationScreen />}
        {activeTab === 'inventory' && <InventoryScreen />}
      </View>

      {/* Bottom Hub Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('prep')}
        >
          <Scissors
            size={22}
            color={activeTab === 'prep' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'prep' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'prep' && styles.tabLabelActive,
            ]}
          >
            Prep KDS
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('inward')}
        >
          <Anchor
            size={22}
            color={activeTab === 'inward' ? theme.colors.teal : theme.colors.textMuted}
            strokeWidth={activeTab === 'inward' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'inward' && styles.tabLabelActiveTeal,
            ]}
          >
            Catch Inward
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('sanitization')}
        >
          <Sparkles
            size={22}
            color={activeTab === 'sanitization' ? theme.colors.teal : theme.colors.textMuted}
            strokeWidth={activeTab === 'sanitization' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'sanitization' && styles.tabLabelActiveTeal,
            ]}
          >
            Box Turnover
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('inventory')}
        >
          <Layers
            size={22}
            color={activeTab === 'inventory' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'inventory' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'inventory' && styles.tabLabelActive,
            ]}
          >
            Inventory
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PartnerProvider>
        <MainPartnerApp />
      </PartnerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
  tabLabelActiveTeal: {
    color: theme.colors.teal,
    fontWeight: theme.typography.weightBold,
  },
});
