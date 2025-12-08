import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn
        path="/sign-in"
        routing="path"
        appearance={{
          elements: {
            footerAction: "hidden",
          },
        }}
        signUpUrl="/sign-up"
      />
    </div>
  );
}
