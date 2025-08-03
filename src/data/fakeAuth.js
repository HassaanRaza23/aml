export const fakeLogin = async (email, password) => {
  // Simulated delay and validation
  await new Promise((r) => setTimeout(r, 1000));
  return email === "admin@example.com" && password === "password123";
};
