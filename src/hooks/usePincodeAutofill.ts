import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePincodeAutofill = (pincode: string, onFetch: (data: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only trigger if pincode is exactly 6 digits
    if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
      const fetchPincodeData = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`/api/pincode/${pincode}`);
          if (res.data.success) {
            onFetch(res.data.data);
          } else {
            setError(res.data.message || "Invalid pincode");
          }
        } catch (err: any) {
          console.error("Pincode autofill error:", err);
          setError(err.response?.data?.message || "Failed to fetch location data");
        } finally {
          setLoading(false);
        }
      };

      fetchPincodeData();
    }
  }, [pincode]);

  return { loading, error };
};
