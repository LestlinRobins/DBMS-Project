import React, { useEffect, useState } from "react";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Customer List</h2>
      {products.length > 0 ? (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Customer_ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Address</th>
              <th className="border px-4 py-2">ID Proof</th>
            </tr>
          </thead>
          <tbody>
            {products.map((c) => (
              <tr key={c.Customer_ID || c.customer_id || c.id}>
                <td className="border px-4 py-2">
                  {c.Customer_ID || c.customer_id || c.id}
                </td>
                <td className="border px-4 py-2">{c.Name || c.name}</td>
                <td className="border px-4 py-2">{c.Phone || c.phone}</td>
                <td className="border px-4 py-2">{c.Email || c.email}</td>
                <td className="border px-4 py-2">{c.Address || c.address}</td>
                <td className="border px-4 py-2">
                  {c.ID_Proof || c.id_proof || c.idProof}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  );
};

export default Products;
