import type { JSX } from "react";

import { Div } from "../components/ui/div";
import { DocumentHead } from "../components/ui/document-head";
import { H1 } from "../components/ui/heading";
import { Link } from "../components/ui/link";
import { Text } from "../components/ui/text";

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
