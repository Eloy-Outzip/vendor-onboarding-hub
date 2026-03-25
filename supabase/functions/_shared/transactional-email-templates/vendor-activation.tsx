import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Outzip"

interface VendorActivationProps {
  vendorName?: string
  profileUrl?: string
}

const VendorActivationEmail = ({ vendorName, profileUrl }: VendorActivationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your profile on {SITE_NAME} is now live!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {vendorName ? `${vendorName}, you're on the map! 🎉` : "You're on the map! 🎉"}
        </Heading>
        <Text style={text}>
          Great news — your profile on {SITE_NAME} has been activated! Customers in your area can now find you on our outdoor rental map.
        </Text>
        {profileUrl && (
          <Button style={button} href={profileUrl}>
            View your profile →
          </Button>
        )}
        <Hr style={hr} />
        <Text style={footer}>
          Best regards, The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: VendorActivationEmail,
  subject: 'Your profile is now live on Outzip!',
  displayName: 'Vendor activation',
  previewData: { vendorName: 'Alpine Rentals', profileUrl: 'https://outzip-signup.lovable.app/vendors/alpine-rentals' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a2e36', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 25px' }
const button = {
  backgroundColor: '#e07800',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
