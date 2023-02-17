import { GetServerSideProps } from "next";
import { api } from "../utils/api";
import { isAuthenticated, redirect } from "../utils/server";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";
import { appRouter } from "../server/api/root";
import { createTRPCContext } from "../server/api/trpc";

const Dashboard = () => {
  const account = api.appwrite.getAccount.useQuery();

  return (
    <form method="POST" action="/api/logout">
      <h1 className="heading-level-3">Welcome {account.data?.account?.name}</h1>
      <button className="button u-margin-block-start-16" type="submit">
        logout
      </button>
    </form>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx as any),
    transformer: superjson,
  });

  await ssg.appwrite.getAccount.prefetch();

  if (!(await isAuthenticated(ctx))) {
    return redirect("login");
  }
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
