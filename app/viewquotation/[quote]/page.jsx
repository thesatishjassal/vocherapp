"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

const viewquotation = () => {
  const { quote } = useParams();

  return (
    <div className="card tm_container my-4">
        <div className="card-header pb-0">
            <h6>View quotation</h6>
        </div>
        <div className="card-body py-0 pt-0 pb-2">
            {quote}
        </div>
    </div>
  );
};

export default viewquotation;
