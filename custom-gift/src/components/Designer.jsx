import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { SketchPicker } from "react-color";

export default function Designer({ product = "tshirt" }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = new fabric.Canvas("fabric-canvas", {
      height: 500,
      width: 500,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    // load base mockup depending on product
    const baseUrlMap = {
      tshirt: "/assets/tshirt_base.png",
      mug: "/assets/mug_base.png",
      keychain: "/assets/keychain_base.png",
    };
    const url = baseUrlMap[product] || baseUrlMap.tshirt;

    fabric.Image.fromURL(url, (img) => {
      // scale/position base image to canvas size
      img.selectable = false;
      img.evented = false;
      // set as background
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    // enable retina scaling fix if needed
    canvas.setBackgroundColor(selectedColor, canvas.renderAll.bind(canvas));

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line
  }, [product]);

  // Upload via dropzone
  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.set({
          left: 120,
          top: 120,
          angle: 0,
          padding: 10,
          cornersize: 10,
        });
        img.scaleToWidth(200);
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "image/*": [] } });

  // Add text
  const addText = () => {
    const text = new fabric.Textbox("Your text", {
      left: 150,
      top: 50,
      width: 200,
      fontSize: 24,
      fill: "#000",
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  // Delete selected
  const deleteSelected = () => {
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.remove(active);
    }
  };

  // Export canvas to PNG and send to backend
  const exportAndUpload = async () => {
    try {
      setIsLoading(true);
      // Deselect objects for cleaner export
      fabricRef.current.discardActiveObject();
      fabricRef.current.renderAll();

      const dataUrl = fabricRef.current.toDataURL({ format: "png", quality: 1 });
      // convert base64 to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("design", blob, "design.png");

      const resp = await axios.post("http://localhost:5000/upload-design", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded! URL: " + resp.data.url);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Change background color (for T-shirt color simulation)
  const changeBgColor = (color) => {
    setSelectedColor(color.hex);
    fabricRef.current.setBackgroundColor(color.hex, fabricRef.current.renderAll.bind(fabricRef.current));
  };

  return (
    <div className="p-4">
      <div className="controls mb-4 flex gap-2">
        <div {...getRootProps()} className="border p-2 cursor-pointer">
          <input {...getInputProps()} />
          Upload Image (drop or click)
        </div>
        <button onClick={addText} className="px-3 py-1 border">Add Text</button>
        <button onClick={deleteSelected} className="px-3 py-1 border">Delete Selected</button>
        <button onClick={exportAndUpload} className="px-3 py-1 border">
          {isLoading ? "Uploading..." : "Save & Upload"}
        </button>
        <div style={{ width: 40 }}>
          <SketchPicker color={selectedColor} onChangeComplete={changeBgColor} />
        </div>
      </div>

      <canvas id="fabric-canvas" ref={canvasRef} style={{ border: "1px solid #ddd" }} />
    </div>
  );
}
