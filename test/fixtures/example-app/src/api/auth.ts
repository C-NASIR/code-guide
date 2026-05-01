export async function loginUser(username: string) {
  return fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ username })
  });
}
