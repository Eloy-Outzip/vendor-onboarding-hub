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
    preview: (siteName: string) => `You've been invited to join ${siteName}`,
    heading: "You've been invited! 🎉",
    body: (siteName: string) => `You've been invited to join`,
    bodyEnd: '. Click the button below to accept and create your account.',
    button: 'Accept Invitation',
    footer: "If you weren't expecting this invitation, you can safely ignore this email.",
  },
  de: {
    preview: (siteName: string) => `Du wurdest eingeladen, ${siteName} beizutreten`,
    heading: 'Du wurdest eingeladen! 🎉',
    body: (siteName: string) => `Du wurdest eingeladen,`,
    bodyEnd: ' beizutreten. Klicke auf den Button, um die Einladung anzunehmen und dein Konto zu erstellen.',
    button: 'Einladung annehmen',
    footer: 'Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.',
  },
}

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
  locale?: 'en' | 'de'
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
  locale = 'en',
}: InviteEmailProps) => {
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
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            {t.bodyEnd}
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

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222.2, 84%, 4.9%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(215.4, 16.3%, 46.9%)', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = { backgroundColor: 'hsl(24, 91%, 48%)', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
