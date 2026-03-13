/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

const translations = {
  en: {
    preview: (siteName: string) => `Reset your password for ${siteName}`,
    heading: 'Reset your password',
    body: (siteName: string) => `We received a request to reset your password for ${siteName}. Click the button below to choose a new password.`,
    button: 'Reset Password',
    footer: "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.",
  },
  de: {
    preview: (siteName: string) => `Passwort zurücksetzen für ${siteName}`,
    heading: 'Passwort zurücksetzen',
    body: (siteName: string) => `Wir haben eine Anfrage erhalten, dein Passwort für ${siteName} zurückzusetzen. Klicke auf den Button, um ein neues Passwort zu wählen.`,
    button: 'Passwort zurücksetzen',
    footer: 'Falls du kein Passwort-Reset angefordert hast, kannst du diese E-Mail ignorieren. Dein Passwort wird nicht geändert.',
  },
}

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  locale?: 'en' | 'de'
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
  locale = 'en',
}: RecoveryEmailProps) => {
  const t = translations[locale] || translations.en
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{t.preview(siteName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.heading}</Heading>
          <Text style={text}>{t.body(siteName)}</Text>
          <Button style={button} href={confirmationUrl}>
            {t.button}
          </Button>
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222.2, 84%, 4.9%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(215.4, 16.3%, 46.9%)', lineHeight: '1.6', margin: '0 0 24px' }
const button = { backgroundColor: 'hsl(24, 91%, 48%)', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
