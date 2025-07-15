import {createId} from "@paralleldrive/cuid2";
import {Chat} from "@/components/chat/chat-interface";
import {auth} from "@/app/(auth)/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await auth();
  const id = createId();

  if (!session?.user || !session?.user.id) {
    return null;
  }

  return (
    <>
      <Chat id={id} initialMessages={[]} session={session}/>
    </>
  );
}
