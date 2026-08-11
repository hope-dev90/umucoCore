import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Screen } from '../../components/Screen';
import { Button, Chip, Input, Subtitle, Title } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { submitContribution, ContributionType } from '../../services/contributeService';
import { validateContribution } from '../../utils/validation';
import { colors } from '../../theme/colors';

const TYPES: ContributionType[] = ['oral_history', 'audio', 'photo', 'video'];

type PickedFile = { uri: string; name: string; type: string };

export default function ContributeScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [type, setType] = useState<ContributionType>('oral_history');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const pickFile = async () => {
    try {
      if (type === 'photo') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(t('common.error'), 'Photo library permission is required');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.85,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });
        return;
      }

      if (type === 'video') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(t('common.error'), 'Media library permission is required');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || `video-${Date.now()}.mp4`,
          type: asset.mimeType || 'video/mp4',
        });
        return;
      }

      if (type === 'audio') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['audio/*'],
          copyToCacheDirectory: true,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name || `audio-${Date.now()}.mp3`,
          type: asset.mimeType || 'audio/mpeg',
        });
      }
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Could not pick file');
    }
  };

  const onSubmit = async () => {
    const next = validateContribution({ name, email, description });
    setErrors(next);
    if (Object.keys(next).length) return;
    if (type !== 'oral_history' && !file) {
      Alert.alert(t('common.error'), 'Please attach a file for this contribution type');
      return;
    }
    setLoading(true);
    try {
      await submitContribution({
        type,
        name: name.trim(),
        email: email.trim(),
        description: description.trim(),
        title: title.trim() || undefined,
        file,
      });
      setDone(true);
      setDescription('');
      setTitle('');
      setFile(null);
      Alert.alert('Thank you', t('contribute.success'));
    } catch (err) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>{t('contribute.title')}</Title>
      <Subtitle>{t('contribute.subtitle')}</Subtitle>

      <Text style={styles.label}>Contribution type</Text>
      <View style={styles.chips}>
        {TYPES.map((item) => (
          <Chip
            key={item}
            label={item.replace('_', ' ')}
            active={type === item}
            onPress={() => {
              setType(item);
              setFile(null);
            }}
          />
        ))}
      </View>

      <Input label="Name" value={name} onChangeText={setName} error={errors.name} />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label="Title (optional)"
        value={title}
        onChangeText={setTitle}
        autoCapitalize="sentences"
      />
      <Input
        label="Description / oral history"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
      />

      {type !== 'oral_history' ? (
        <View style={styles.attach}>
          <Button
            label={file ? `Attached: ${file.name}` : `Attach ${type} file`}
            variant="secondary"
            onPress={pickFile}
          />
        </View>
      ) : null}

      <Button label={t('contribute.submit')} onPress={onSubmit} loading={loading} />
      {done ? <Text style={styles.success}>{t('contribute.success')}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attach: { marginBottom: 4 },
  success: { color: colors.success, fontWeight: '700' },
});
