import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <span className="text-2xl font-bold text-blue-600">LexGraph</span>
        <SignIn />
      </div>
    </div>
  );
}
