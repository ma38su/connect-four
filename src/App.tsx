import { ConnectFourBoard } from "./connect-four/ConnectFourBoard";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <h1 className="pt-12 text-center text-3xl font-bold">Connect Four</h1>
      <hr className="my-4 border-gray-300" />
      <ConnectFourBoard />
    </main>
  );
}
