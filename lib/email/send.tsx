import "server-only";
import { render } from "@react-email/render";
import { Resend } from "resend";
import GraceNotice, { type GraceNoticeProps } from "@/emails/GraceNotice";
import SignInCode, { type SignInCodeProps } from "@/emails/SignInCode";
import { serverEnv } from "@/lib/env";

let client: Resend | undefined;

async function send(to: string, subject: string, element: React.ReactElement): Promise<void> {
  const env = serverEnv();
  client ??= new Resend(env.RESEND_API_KEY);
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  const { error } = await client.emails.send({ from: env.EMAIL_FROM, to, subject, html, text });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}

export function sendSignInCode(to: string, props: SignInCodeProps) {
  return send(to, `${props.code} is your Klubbies code`, <SignInCode {...props} />);
}

export function sendGraceNotice(to: string, props: GraceNoticeProps) {
  return send(to, `Your access to ${props.clubName} ends on ${props.endsOn}`, <GraceNotice {...props} />);
}
