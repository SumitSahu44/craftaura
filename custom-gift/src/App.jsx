import React, { useState } from "react";
import Designer from "./components/Designer.jsx";

function App() {
  const [product, setProduct] = useState("tshirt");
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Custom Gift Designer</h1>

      <div className="mb-4">
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="border p-2">
          <option value="tshirt">T-shirt</option>
          <option value="mug">Mug</option>
          <option value="keychain">Keychain</option>
        </select>
      </div>

      <Designer product={product} />
    </div>
  );
}

export default App;
