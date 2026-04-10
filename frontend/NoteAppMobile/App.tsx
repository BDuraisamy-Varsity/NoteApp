import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AccessibilityProvider} from './src/contexts/AccessibilityContext';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {FlagProvider} from './src/contexts/FlagContext';
import EditNoteScreen from './src/screens/EditNoteScreen';
import FlagsSettingsScreen from './src/screens/FlagsSettingsScreen';
import HomeScreen from './src/screens/HomeScreen';
import {NoteDto} from './src/services/api';

type Screen = 'home' | 'create' | 'edit' | 'settings';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <FlagProvider>
            <Shell />
          </FlagProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const {isDark, colors} = useTheme();
  const [screen, setScreen] = useState<Screen>('home');
  const [editingNote, setEditingNote] = useState<NoteDto | undefined>(undefined);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  const refreshHome = () => setHomeRefreshKey(k => k + 1);

  const goHome = () => {
    setScreen('home');
    setEditingNote(undefined);
  };

  if (screen === 'settings') {
    return (
      <>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
        <FlagsSettingsScreen onBack={goHome} />
      </>
    );
  }

  if (screen === 'create' || screen === 'edit') {
    return (
      <>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
        <EditNoteScreen
          note={editingNote}
          onSave={() => { refreshHome(); goHome(); }}
          onCancel={goHome}
          onDelete={() => { refreshHome(); goHome(); }}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
      <HomeScreen
        key={homeRefreshKey}
        onNotePress={note => { setEditingNote(note); setScreen('edit'); }}
        onCreatePress={() => { setEditingNote(undefined); setScreen('create'); }}
        onEditPress={note => { setEditingNote(note); setScreen('edit'); }}
        onDeletePress={note => { setEditingNote(note); setScreen('edit'); }}
        onSettingsPress={() => setScreen('settings')}
      />
    </>
  );
}
