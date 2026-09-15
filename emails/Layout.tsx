import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

const fontFamily = "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ background: "#f3f2f2", color: "#201e1d", fontFamily, margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 520, background: "#ffffff", border: "2px solid #201e1d" }}>
          <Section style={{ padding: "20px 28px", borderBottom: "2px solid #bab6b6" }}>
            <Text style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>klubbies</Text>
          </Section>
          <Section style={{ padding: "28px" }}>{children}</Section>
          <Hr style={{ borderColor: "#bab6b6", margin: 0 }} />
          <Section style={{ padding: "16px 28px" }}>
            <Text style={{ fontSize: 12, color: "#7d7979", margin: 0, lineHeight: 1.5 }}>
              Klubbies keeps club photos private to the people on the member list. If you weren&apos;t expecting
              this email you can ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  kicker: { fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#ae1800", margin: 0 },
  heading: { fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "8px 0 12px" },
  body: { fontSize: 15, lineHeight: 1.55, color: "#444141", margin: "0 0 16px" },
  button: { background: "#ec3013", color: "#f3f2f2", fontWeight: 800, fontSize: 15, padding: "12px 18px", textDecoration: "none", display: "inline-block" },
};
