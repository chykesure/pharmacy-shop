import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Receipt() {
  const receiptRef = useRef();
  const printedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const [printedBy, setPrintedBy] = useState("");

  // -----------------------------------------
  // PRINT STYLES (works for XP-80)
  // -----------------------------------------
  const printStyles = `
  @media print {
    body, .receipt-container, * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
      color: #000 !important;
      background: #fff !important;
    }

    /* FIXED WIDTH – fits XP-80 (72mm) without cutting */
    .receipt-container {
      width: 100% !important;
      max-width: 300px !important;   /* reduced for thermal printer */
      margin: 0 auto !important;
      padding: 5px !important;
    }

    /* Table always fully visible and shifted left */

table {
  width: 100% !important;          /* Full width inside container */
  border-collapse: collapse !important;
  border: 1px solid #000 !important;
  margin: 0px;
}

th, td {
  border: 1px solid #000 !important;
  padding: 3px 4px !important;
  font-size: 16px !important;      /* Larger, clear font */
  text-align: left !important;
}

th {
  font-weight: 800 !important;
  background: #eee !important;
}

    /* Reduce header size so width fits */
    .receipt-header svg {
      width: 50px !important;
      height: 50px !important;
    }

    .receipt-header h2 {
      font-size: 20px !important;
      font-weight: 900 !important;
    }

    .receipt-header p {
      font-size: 14px !important;
      font-weight: 600 !important;
    }

    .receipt-footer {
      text-align: center !important;
      margin-top: 10px !important;
      font-size: 11px !important;
    }

    /* Make totals section print aligned left */
.totals-container {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 300px !important;
  background: #f3f3f3 !important;
  padding: 12px !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  font-size: 14px !important;

  /* align left for print */
  margin:0 !important;
  text-align: left !important;
}


    .totals-container > div {
      display: flex !important;
      justify-content: space-between !important;
      margin-bottom: 6px !important;
    }

    .totals-container > div:last-child {
      border-top: 1px solid #000 !important;
      padding-top: 4px !important;
      margin-bottom: 0 !important;
    }
      .shopping{
      text-align: center !important;
      }

    button { display: none !important; }
    @page { margin: 5mm; }
  }
`;


  // -----------------------------------------
  // FETCH SALE BY INVOICE
  // -----------------------------------------
  const fetchSale = async (number) => {
    if (!number) return;
    try {
      const res = await axios.get(
        `http://192.168.0.79:8080/api/sales/invoice/${number}`
      );
      console.log(res.data.items);
      setSale(res.data);
      setError("");
    } catch (err) {
      setSale(null);
      setError("Sale not found");
    }
  };

  const handleSearch = () => fetchSale(invoiceNumber);

  // -----------------------------------------
  // PRINT RECEIPT — PROFESSIONAL HEADER
  // -----------------------------------------
  const handlePrint = () => {
    if (!receiptRef.current) return;

    const content = receiptRef.current.innerHTML;
    const currentDate = sale?.date
      ? new Date(sale.date).toLocaleString()
      : "";

    const printedHeader = `
      <div style="text-align:center; margin-bottom:2px;">
        <svg width="65" height="65" viewBox="0 0 24 24" fill="#000" style={{ marginBottom: '5px' }} xmlns="http://www.w3.org/2000/svg">
  <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM7.25 14l.75-2h9l3-6H6.21l-.94-2H0v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.48 16 7 16h12v-2H7.25z"/>
</svg>
        <h2 style="font-size:22px; font-weight:900; margin:3px 0;">
          Beloved Pharmacy Store
        </h2>
        <p style="font-size:16px; font-weight:600; margin:2px 0;">
           Ilesha, Osun State
        </p>
        <p style="font-size:15px; margin:2px 0;">${currentDate}</p>
      </div>
    `;

    const html = `
      <html>
        <head>
          <title>Receipt</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="receipt-container">
            ${printedHeader}
            ${content}
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=600,height=600");
    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  // -----------------------------------------
  // AUTOPRINT ONCE AFTER LOADING SALE
  // -----------------------------------------
  useEffect(() => {
    if (sale && receiptRef.current && !printedRef.current) {
      printedRef.current = true;
      setTimeout(() => handlePrint(), 500);
    }
  }, [sale]);

  // -----------------------------------------
  // LOAD INVOICE FROM PREVIOUS PAGE
  // -----------------------------------------
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setPrintedBy(username);

    if (location.state?.invoiceNumber) {
      const inv = location.state.invoiceNumber;
      setInvoiceNumber(inv);
      fetchSale(inv);

      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // -----------------------------------------
  // VALUES
  // -----------------------------------------
  const subtotal =
    sale?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const amountPaid = sale?.total || 0;
  const paymentMethod = sale?.paymentMode || "-";

  return (
    <div className="flex flex-col items-center bg-gray-900 text-gray-200 p-6 min-h-screen">

      {/* SEARCH INPUT */}
      <div className="flex mb-6 space-x-2">
        <input
          type="text"
          placeholder="Enter invoice number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="px-3 py-2 rounded text-gray-900"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              printedRef.current = false;
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
        >
          Search
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-semibold"
        >
          Print
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* RECEIPT BODY */}
      {sale && (
        <div
          ref={receiptRef}
          className="receipt-container w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-xl text-gray-200"
        >
          {/* Invoice + Cashier */}
          <div className="flex justify-between mb-4">
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded font-semibold shadow-sm">
              🧾 Invoice #: {sale.invoiceNumber}
            </span>
            <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded font-medium shadow-sm">
              👤 Cashier: {sale.cashier}
            </span>
          </div>

          {/* TABLE */}
          <table className="w-full mb-4 border-collapse border border-gray-600 text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-2 py-1 text-center">S/N</th>
                <th className="px-2 py-1">Item</th>
                <th className="px-2 py-1 text-center">Qty / Packs</th>
                <th className="px-2 py-1 text-right">Price</th>
                <th className="px-2 py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="px-2 py-1 text-center">{index + 1}</td>
                  <td className="px-2 py-1">{item.productName}</td>
                  <td className="px-2 py-1 text-center">
                    {item.type === "wholesale"
                      ? `${item.packCount} pack(s) (${item.quantity} pcs)`
                      : `${item.quantity} pcs`}
                  </td>
                  <td className="px-2 py-1 text-right">
                    ₦{item.price.toLocaleString()}
                  </td>
                  <td className="px-2 py-1 text-right">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="totals-container w-full max-w-md mx-auto mt-4 p-4 pb-6 bg-gray-700 rounded-lg shadow-md">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 font-medium">
                Subtotal: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₦{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 font-medium">Amount Paid: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₦{amountPaid.toLocaleString()}</span>

            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 font-medium">Payment Method: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{paymentMethod}</span>

            </div>

            <div className="flex justify-between border-t border-gray-600 pt-2">
              <span className="text-gray-400 font-medium">Printed By: {printedBy}</span>

            </div>
          </div>

          <p className="shopping text-center mt-6 font-medium text-gray-400">
            Thank you for shopping with us!
          </p>
        </div>
      )}
    </div>
  );
}

export default Receipt;
