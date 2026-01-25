"use client";

import { useState, useEffect } from "react";

const FALLBACK_PRICE = 2500;
const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Shared hook for ETH price in USD
 * Single source of truth - prevents duplicate API calls across components
 */
export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEthPrice(data.ethereum?.usd || FALLBACK_PRICE);
      } catch {
        // Silently fallback to default price if API fails
        setEthPrice(FALLBACK_PRICE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { ethPrice, isLoading };
}
