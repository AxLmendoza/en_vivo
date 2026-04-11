import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar logout
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Cuenta',
      items: [
        {
          icon: 'person-outline',
          title: 'Perfil',
          subtitle: 'Información personal',
          onPress: () => console.log('Navigate to profile'),
        },
        {
          icon: 'shield-outline',
          title: 'Seguridad',
          subtitle: 'Contraseña y autenticación',
          onPress: () => console.log('Navigate to security'),
        },
      ],
    },
    {
      title: 'Preferencias',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notificaciones',
          subtitle: 'Recibir alertas y recordatorios',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          ),
        },
        {
          icon: 'moon-outline',
          title: 'Modo oscuro',
          subtitle: 'Activar tema oscuro',
          rightComponent: (
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          ),
        },
        {
          icon: 'fingerprint-outline',
          title: 'Biometría',
          subtitle: 'Usar huella o Face ID',
          rightComponent: (
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          ),
        },
      ],
    },
    {
      title: 'Datos y almacenamiento',
      items: [
        {
          icon: 'cloud-outline',
          title: 'Sincronización',
          subtitle: 'Sincronizar datos con la nube',
          onPress: () => console.log('Navigate to sync'),
        },
        {
          icon: 'trash-outline',
          title: 'Limpiar caché',
          subtitle: 'Eliminar datos temporales',
          onPress: () => {
            Alert.alert(
              'Limpiar caché',
              '¿Quieres eliminar todos los datos temporales?',
              [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
                {
                  text: 'Limpiar',
                  style: 'destructive',
                  onPress: () => console.log('Clearing cache...'),
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Ayuda',
          subtitle: 'Centro de ayuda',
          onPress: () => console.log('Navigate to help'),
        },
        {
          icon: 'mail-outline',
          title: 'Contacto',
          subtitle: 'Escribir al soporte',
          onPress: () => console.log('Navigate to contact'),
        },
        {
          icon: 'document-text-outline',
          title: 'Términos y condiciones',
          subtitle: 'Ver términos de uso',
          onPress: () => console.log('Navigate to terms'),
        },
      ],
    },
    {
      title: 'Acerca de',
      items: [
        {
          icon: 'information-circle-outline',
          title: 'Versión',
          subtitle: 'TaskFlow AI v1.0.0',
          disabled: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={item.disabled ? undefined : item.onPress}
      activeOpacity={item.disabled ? 1 : 0.7}
    >
      <Ionicons
        name={item.icon}
        size={22}
        color={item.disabled ? theme.colors.disabled : theme.colors.text}
      />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.disabled && styles.settingDisabled]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.rightComponent || (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={item.disabled ? theme.colors.disabled : theme.colors.secondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
        </View>

        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={itemIndex}>
                {renderSettingItem(item)}
                {itemIndex < section.items.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, styles.section]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  section: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    minHeight: 60,
  },
  settingContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  settingDisabled: {
    opacity: 0.6,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 52,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.card,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 15,
  },
});