import { Link } from "react-router-dom";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-green-600">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold text-gray-800">
          Page Not Found
        </h2>

        <p className="mt-3 text-gray-600">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          <Home size={20} />
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;