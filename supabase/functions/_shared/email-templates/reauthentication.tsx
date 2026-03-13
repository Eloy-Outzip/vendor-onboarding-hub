/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

const translations = {
  en: {
    preview: 'Your verification code',
    heading: 'Confirm your identity',
    body: "Use the code below to verify it's you:",
    footer: "This code will expire shortly. If you didn't request this, you can safely ignore this email.",
  },
  de: {
    preview: 'Dein Bestätigungscode',
    heading: 'Identität bestätigen',
    body: 'Verwende den folgenden Code, um dich zu verifizieren:',
    footer: 'Dieser Code läuft in Kürze ab. Falls du ihn nicht angefordert hast, kannst du diese E-Mail ignorieren.',
  },
}

interface ReauthenticationEmailProps {
  token: string
  locale?: 'en' | 'de'
}

export const ReauthenticationEmail = ({ token, locale = 'en' }: ReauthenticationEmailProps) => {
  const t = translations[locale] || translations.en
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.heading}</Heading>
          <Text style={text}>{t.body}</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222.2, 84%, 4.9%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(215.4, 16.3%, 46.9%)', lineHeight: '1.6', margin: '0 0 24px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: 'hsl(24, 91%, 48%)', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
