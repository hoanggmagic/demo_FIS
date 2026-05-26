import { useEffect, useState } from "react";

function Wallet() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    // fake data trước (chưa nối API)
    setWallet({
      balance: 680000,
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Author Wallet</h2>

      <div
        style={{
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 10,
          width: 300,
        }}
      >
        <h3>Số dư</h3>
        <h1 style={{ color: "green" }}>
          {wallet?.balance?.toLocaleString()} VND
        </h1>
      </div>
    </div>
  );
}

export default Wallet;
