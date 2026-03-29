"use client";
import { useRouter } from "next/navigation";

export default function LoginPrompt({ page }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center max-w-sm w-full">

        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">🔒</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Login Required
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Please login to access{" "}
          <span className="text-gray-600 font-medium">{page}</span>
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/login?signup=true")}
            className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all"
          >
            Create Account
          </button>
        </div>

      </div>
    </main>
  );
}