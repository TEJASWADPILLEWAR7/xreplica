import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn
        path="/sign-in"
        routing="path"
        appearance={{
          elements: {
            footer: "hidden",
          },
        }}
        signUpUrl="/sign-up"
        unsafeMetadata={{
          strategy: "password",
        }}
      />
    </div>
  );
}
