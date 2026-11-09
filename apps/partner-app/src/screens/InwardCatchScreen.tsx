import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import {
  Anchor,
  ThermometerSnowflake,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Clock,
} from 'lucide-react-native';
import { theme } from '../theme';
import { usePartner } from '../context/PartnerContext';

export const InwardCatchScreen: React.FC = () => {
  const { inwardBatches, addInwardBatch } = usePartner();

  const [itemName, setItemName] = useState('Mangalore Coastal Pomfret');
  const [origin, setOrigin] = useState('Mangalore Old Port Dock');
  const [grossWeight, setGrossWeight] = useState('65');
  const [tempReading, setTempReading] = useState('1.7');
  const [dock, setDock] = useState('Cold Dock #1');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!itemName || !grossWeight || !tempReading) {
      Alert.alert('Missing Fields', 'Please enter item name, weight, and temperature probe reading.');
      return;
    }

    const tempNum = parseFloat(tempReading);
    if (tempNum > 4.0) {
      Alert.alert(
        'Cold-Chain Breach Warning',
        `Temperature reading ${tempNum}°C exceeds GoMeat sub-4°C threshold. Inward batch must be rejected or placed in blast chiller immediately.`
      );
      return;
    }

    addInwardBatch({
      item: itemName,
      origin,
      grossWeightKg: parseFloat(grossWeight),
      tempReading: tempNum,
      qualityGrade: 'A+',
      dock,
    });

    Alert.alert('Inward Logged', `Batch of ${grossWeight} kg ${itemName} logged at ${tempNum}°C with Quality Grade A+.`);
    setShowForm(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Anchor size={22} color="#ffffff" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Morning Catch & Farm Inward</Text>
            <Text style={styles.headerSub}>
              Digital weight scale and IoT sub-2°C probe verification
            </Text>
          </View>
          <Pressable style={styles.logNewBtn} onPress={() => setShowForm(!showForm)}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.logNewBtnText}>{showForm ? 'Close' : 'Inward'}</Text>
          </Pressable>
        </View>

        {/* INWARD FORM */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Log Incoming Batch</Text>

            <Text style={styles.label}>Product / Cut Inward</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Mangalore Kingfish"
            />

            <Text style={styles.label}>Origin & Cooperative</Text>
            <TextInput
              style={styles.input}
              value={origin}
              onChangeText={setOrigin}
              placeholder="e.g. Mangalore Old Port Dock"
            />

            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>Weight (Kg)</Text>
                <TextInput
                  style={styles.input}
                  value={grossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.label}>Probe Temp (°C)</Text>
                <TextInput
                  style={styles.input}
                  value={tempReading}
                  onChangeText={setTempReading}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <CheckCircle2 size={16} color="#ffffff" />
              <Text style={styles.submitBtnText}>Verify Quality & Inward Stock</Text>
            </Pressable>
          </View>
        )}

        {/* BATCHES LIST */}
        <View style={styles.batchesList}>
          <Text style={styles.batchesTitle}>Today's Inward Log ({inwardBatches.length} Batches)</Text>
          {inwardBatches.map((batch) => (
            <View key={batch.id} style={styles.batchCard}>
              <View style={styles.batchHeader}>
                <View>
                  <Text style={styles.batchId}>{batch.id}</Text>
                  <Text style={styles.batchItem}>{batch.item}</Text>
                </View>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{batch.qualityGrade} CERTIFIED</Text>
                </View>
              </View>

              <View style={styles.batchMetaRow}>
                <View style={styles.metaPill}>
                  <Scale size={12} color={theme.colors.textMuted} />
                  <Text style={styles.metaText}>{batch.grossWeightKg} Kg</Text>
                </View>

                <View style={styles.metaPill}>
                  <ThermometerSnowflake size={12} color={theme.colors.sky} />
                  <Text style={[styles.metaText, styles.tempText]}>{batch.tempReading.toFixed(1)}°C Probe</Text>
                </View>

                <View style={styles.metaPill}>
                  <Clock size={12} color={theme.colors.textMuted} />
                  <Text style={styles.metaText}>{batch.time}</Text>
                </View>
              </View>

              <Text style={styles.originText}>Origin: {batch.origin} • {batch.dock}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  headerSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  logNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  logNewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.navy,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: theme.colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  batchesList: {
    gap: 10,
  },
  batchesTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 4,
  },
  batchCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  batchId: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightSemi,
  },
  batchItem: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginTop: 1,
  },
  gradeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: theme.typography.weightBold,
    color: '#15803d',
  },
  batchMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemi,
  },
  tempText: {
    color: theme.colors.sky,
    fontWeight: theme.typography.weightBold,
  },
  originText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
