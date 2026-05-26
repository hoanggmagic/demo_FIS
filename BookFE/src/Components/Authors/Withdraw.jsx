import { useState } from "react";

function Withdraw() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const handleWithdraw = () => {
    console.log({
      userId: user.id,
      amount,
      bankName,
      accountNumber,
      accountHolder,
    });

    alert("Tạo yêu cầu rút tiền (chưa gọi API)");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Withdraw Money</h2>

      <input
        placeholder="Số tiền"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />

      <input
        placeholder="Ngân hàng"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
      />
      <br />

      <input
        placeholder="Số tài khoản"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />
      <br />

      <input
        placeholder="Tên chủ tài khoản"
        value={accountHolder}
        onChange={(e) => setAccountHolder(e.target.value)}
      />
      <br />

      <button onClick={handleWithdraw}>Gửi yêu cầu rút tiền</button>
    </div>
  );
}

export default Withdraw;
