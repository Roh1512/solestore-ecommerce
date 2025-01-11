import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const apiRes = async () => {
      const response = await fetch("/api/server");
      const data = await response.json();
      setMessage(data.message);
      return;
    };
    apiRes();
  }, []);
  return (
    <>
      <header>Header</header>
      <main>
        {message && <h1>{message}</h1>}
        <button className="btn">Button</button>
      </main>
      <footer>Footer</footer>
    </>
  );
}

export default App;
