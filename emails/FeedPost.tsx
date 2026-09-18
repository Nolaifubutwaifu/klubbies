import { Link, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./Layout";

export type FeedPostProps = {
  name: string;
  clubName: string;
  author: string;
  body: string;
  feedUrl: string;
  unsubscribeUrl: string;
};

export default function FeedPost({ name, clubName, author, body, feedUrl, unsubscribeUrl }: FeedPostProps) {
  const firstName = name.split(" ")[0] || "there";
  return (
    <EmailLayout preview={`${author} posted in ${clubName}`}>
      <Text style={emailStyles.kicker}>{clubName}</Text>
      <Text style={emailStyles.heading}>{author} posted an update</Text>
      <Text style={emailStyles.body}>Hi {firstName},</Text>
      <Text
        style={{
          ...emailStyles.body,
          borderLeft: "4px solid #ec3013",
          paddingLeft: 12,
          whiteSpace: "pre-wrap" as const,
        }}
      >
        {body}
      </Text>
      <Link href={feedUrl} style={emailStyles.button}>
        Open the club feed
      </Link>
      <Text style={{ ...emailStyles.body, fontSize: 12, marginTop: 24 }}>
        Don&apos;t want these? <Link href={unsubscribeUrl}>Turn off club feed emails</Link>.
      </Text>
    </EmailLayout>
  );
}
