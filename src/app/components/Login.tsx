import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

interface OutletContext {
  setIsLoggedIn: (value: boolean) => void;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext<OutletContext>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 샘플 로그인 (실제로는 백엔드 인증 필요)
    if (email && password) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-3 hover:bg-gray-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
