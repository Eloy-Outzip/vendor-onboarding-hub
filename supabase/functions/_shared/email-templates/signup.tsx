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
    preview: (siteName: string) => `Welcome to ${siteName} – confirm your email`,
    heading: "You're almost on the map! 🎉",
    thanks: (siteName: string) => `Thanks for joining`,
    confirm: 'Please confirm your email address (',
    confirmEnd: ') to get started:',
    button: 'Confirm & Get Started',
    footer: "If you didn't create an account, you can safely ignore this email.",
  },
  de: {
    preview: (siteName: string) => `Willkommen bei ${siteName} – E-Mail bestätigen`,
    heading: 'Du bist fast auf der Karte! 🎉',
    thanks: (siteName: string) => `Danke, dass du dich bei`,
    confirm: 'Bitte bestätige deine E-Mail-Adresse (',
    confirmEnd: '), um loszulegen:',
    button: 'Bestätigen & loslegen',
    footer: 'Falls du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.',
  },
}

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  locale?: 'en' | 'de'
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  locale = 'en',
}: SignupEmailProps) => {
  const t = translations[locale] || translations.en
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{t.preview(siteName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.heading}</Heading>
          <Text style={text}>
            {t.thanks(siteName)}{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            !
          </Text>
          <Text style={text}>
            {t.confirm}
            <Link href={`mailto:${recipient}`} style={link}>
              {recipient}
            </Link>
            {t.confirmEnd}
          </Text>
          <Button style={button} href={confirmationUrl}>
            {t.button}
          </Button>
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222.2, 84%, 4.9%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(215.4, 16.3%, 46.9%)', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(24, 91%, 48%)', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
