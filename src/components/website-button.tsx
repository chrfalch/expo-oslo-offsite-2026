import { Button, Text } from '@expo/ui';
import { useState } from 'react';
import { Linking } from 'react-native';

import { useOffsiteTheme } from '@/theme';

export function WebsiteButton({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const { colors } = useOffsiteTheme();

  async function open() {
    setFailed(false);
    try {
      await Linking.openURL(url);
    } catch {
      setFailed(true);
    }
  }

  return (
    <>
      <Button label={label} variant="outlined" onPress={() => { void open(); }} />
      {failed ? (
        <Text textStyle={{ color: colors.secondaryText }}>
          {`Could not open this link. Try again when connected: ${url}`}
        </Text>
      ) : null}
    </>
  );
}
