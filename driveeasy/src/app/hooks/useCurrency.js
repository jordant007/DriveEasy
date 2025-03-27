"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const currencyMap = { US: "USD", GB: "GBP", EU: "EUR" };

export default function useCurrency() {
  const [currency, setCurrency] = useState("USD");
  useEffect(() => {
    axios.get("https://ipapi.co/json/").then((res) => {
      const country = res.data.country_code;
      setCurrency(currencyMap[country] || "USD");
    }).catch(() => setCurrency("USD"));
  }, []);
  return currency;
}