import { Link } from "react-router-dom";

export default function AssociationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[400px] text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Association Account
        </h1>
        <p className="text-gray-700 mb-4">
          Welcome to the Association Account page!
        </p>
        <Link to="/">
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg">
            ⬅ Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
