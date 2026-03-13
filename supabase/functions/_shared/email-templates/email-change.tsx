/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

const translations = {
  en: {
    preview: (siteName: string) => `Confirm your email change for ${siteName}`,
    heading: 'Confirm your email change',
    body: (siteName: string) => `You requested to change your email address for ${siteName} from`,
    bodyTo: 'to',
    confirm: 'Click the button below to confirm this change:',
    button: 'Confirm Email Change',
    footer: "If you didn't request this change, please secure your account immediately.",
  },
  de: {
    preview: (siteName: string) => `E-Mail-Änderung bestätigen für ${siteName}`,
    heading: 'E-Mail-Änderung bestätigen',
    body: (siteName: string) => `Du hast beantragt, deine E-Mail-Adresse für ${siteName} zu ändern von`,
    bodyTo: 'zu',
    confirm: 'Klicke auf den Button, um diese Änderung zu bestätigen:',
    button: 'E-Mail-Änderung bestätigen',
    footer: 'Falls du diese Änderung nicht angefordert hast, sichere bitte sofort dein Konto.',
  },
}

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
  locale?: 'en' | 'de'
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
  locale = 'en',
}: EmailChangeEmailProps) => {
  const t = translations[locale] || translations.en
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{t.preview(siteName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.heading}</Heading>
          <Text style={text}>
            {t.body(siteName)}{' '}
            <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
            {t.bodyTo}{' '}
            <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>
          <Text style={text}>{t.confirm}</Text>
          <Button style={button} href={confirmationUrl}>
            {t.button}
          </Button>
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222.2, 84%, 4.9%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(215.4, 16.3%, 46.9%)', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(24, 91%, 48%)', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
