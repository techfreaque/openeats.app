import { Div } from "next-vibe-ui/ui/div";
import { DocumentHead } from "next-vibe-ui/ui/document-head";
import { H1 } from "next-vibe-ui/ui/heading";
import { Link } from "next-vibe-ui/ui/link";
import { Text } from "next-vibe-ui/ui/text";
import type { JSX } from "react";

export default function NotFoundScreen(): JSX.Element {
  return (
    <>
      <DocumentHead title="Oops!" />

      <Div className="flex flex-1 items-center justify-center p-5">
        <Div>
          <H1>{"This screen doesn't exist."}</H1>
          <Link href="/">
            <Text>Go to home screen!</Text>
          </Link>
        </Div>
      </Div>
    </>
  );
}
