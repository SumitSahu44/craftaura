import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useDropzone } from "react-dropzone";
import { SketchPicker } from "react-color";

const products = [
  {
    id: 1,
    name: "T-Shirt",
    colors: [
      { name: "White", image: "/images/tshirt-white.png" },
      { name: "Black", image: "/images/tshirt-black.png" },
      { name: "Blue", image: "/images/tshirt-blue.png" },
    ],
  },
  {
    id: 2,
    name: "Mug",
    colors: [
      { name: "White", image: "/images/mug-white.png" },
      { name: "Red", image: "/images/mug-red.png" },
      { name: "Black", image: "/images/mug-black.png" },
    ],
  },
  {
    id: 3,
    name: "Keychain",
    colors: [{ name: "Silver", image: "/images/keychain.png" }],
  },
  {
    id: 4,
    name: "Photo Frame",
    colors: [
      { name: "Wooden", image: "/images/frame-wood.jpg" },
      { name: "Black", image: "/images/frame-black.png" },
      { name: "Golden", image: "/images/frame-gold.png" },
    ],
  },
  {
    id: 5,
    name: "Cushion",
    colors: [
      { name: "White", image: "/images/cushion-white.png" },
      { name: "Pink", image: "/images/cushion-pink.jpg" },
      { name: "Gray", image: "/images/cushion-gray.png" },
    ],
  },
];

const Designer = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0]);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [isCircular, setIsCircular] = useState(false);

  useEffect(() => {
    const newCanvas = new fabric.Canvas("canvas", {
      height: 380,
      width: 350,
      backgroundColor: "#f9f9f9",
    });
    setCanvas(newCanvas);

    return () => newCanvas.dispose();
  }, []);

  // Load background image
  useEffect(() => {
    if (canvas && selectedColor?.image) {
      fabric.Image.fromURL(selectedColor.image, (img) => {
        img.set({ selectable: false, evented: false });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        });
      });
    }
  }, [canvas, selectedColor]);

  // Upload image
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          img.scaleToWidth(150);
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    },
  });

  // Add text
  const handleAddText = () => {
    if (!text.trim()) return;
    const textObj = new fabric.Textbox(text, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: fontSize,
      fill: color,
      originX: "center",
      originY: "center",
      fontFamily: "Poppins, sans-serif",
      fontWeight: "600",
      editable: true,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    setText("");
  };

 
  // Download
  const handleDownload = () => {
    const dataURL = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${selectedProduct.name}-custom.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 sm:px-6 md:px-10 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-poppins">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center tracking-wide">
        Design Your Own {selectedProduct.name}
      </h2>

      {/* Product Buttons */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 justify-center">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setSelectedColor(product.colors[0]);
            }}
            className={`px-4 sm:px-5 py-2 rounded-lg border text-sm sm:text-base font-semibold transition-all duration-300 ${
              selectedProduct.id === product.id
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:shadow-md"
            }`}
          >
            {product.name}
          </button>
        ))}
      </div>

      {/* Color Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 justify-center">
        {selectedProduct.colors.map((clr, index) => (
          <button
            key={index}
            onClick={() => setSelectedColor(clr)}
            className={`px-3 py-1 rounded-md border text-sm font-medium transition-all duration-300 ${
              selectedColor.name === clr.name
                ? "border-indigo-500 bg-indigo-100 shadow-inner"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {clr.name}
          </button>
        ))}
      </div>

      {/* Canvas + Tools */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start justify-center w-full max-w-5xl">
        {/* Canvas Section */}
        <div className="p-4 bg-white rounded-2xl shadow-2xl flex justify-center w-full md:w-[370px]">
          <canvas
            id="canvas"
            ref={canvasRef}
            className="rounded-xl border w-full"
          />
        </div>

        {/* Tools Section */}
        <div className="w-full md:w-80 bg-white p-5 sm:p-6 rounded-2xl shadow-2xl">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Customize
          </h3>

          {/* Upload Image (moved up & enlarged) */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 mb-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-shadow shadow-sm"
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-500 font-medium">
              Drag & Drop or Click to Upload Image
            </p>
          </div>

          {/* Add Text */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Add Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
              placeholder="Enter your text"
            />
            <button
              onClick={handleAddText}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold shadow-md"
            >
              Add Text
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Font Size
            </label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              min="10"
              max="100"
            />
          </div>

          {/* Text Color */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Text Color
            </label>
            <SketchPicker color={color} onChangeComplete={(c) => setColor(c.hex)} />
          </div>

        
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all font-semibold shadow-md"
          >
            Download Design
          </button>
        </div>
      </div>
    </div>
  );
};

export default Designer;
