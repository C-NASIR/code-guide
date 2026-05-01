import { useState } from "react";
import { loginUser } from "../api/auth";

export function LoginForm() {
  const [username, setUsername] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginUser(username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(event) => setUsername(event.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
