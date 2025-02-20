"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

const FileUploader = () => {
  const { register, handleSubmit, reset } = useForm();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle File Selection & Preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload File Function
  const onSubmit = async (data) => {
    if (!data.file[0]) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file[0]);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products/1", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("File uploaded successfully!");
        reset();
        setPreview(null);
      } else {
        setMessage(result.detail || "Upload failed.");
      }
    } catch (error) {
      setMessage("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Upload Product Image</h2>

      {preview && (
        <img src={preview} alt="Preview" className="w-full h-40 object-cover mb-4 rounded-md" />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          type="file"
          {...register("file")}
          onChange={handleFileChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={uploading}
          className={`bg-blue-500 text-white py-2 px-4 rounded ${
            uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default FileUploader;
