export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🏥 CareLink QR
        </h1>
        <p className="text-xl text-center mb-4">
          Real-Time Patient Transparency System
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/api/docs"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
          >
            API Docs
          </a>
          <a
            href="https://github.com/H4D3ZS/carelink"
            className="rounded-lg bg-gray-800 px-6 py-3 text-white hover:bg-gray-900 transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}