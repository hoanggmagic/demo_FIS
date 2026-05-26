import { useEffect, useState } from "react";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // fake data trước
    setTransactions([
      {
        id: 1,
        type: "SALE_INCOME",
        amount: 68000,
        desc: "Thu nhập từ đơn hàng #12",
      },
      {
        id: 2,
        type: "WITHDRAW",
        amount: -100000,
        desc: "Rút tiền về ngân hàng",
      },
    ]);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Lịch sử giao dịch</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.type}</td>
              <td>{t.amount}</td>
              <td>{t.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionHistory;
