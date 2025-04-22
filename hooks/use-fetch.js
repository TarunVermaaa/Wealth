import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    try {
      setLoading(true);
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error);
      toast.error(error.message || "Something went wrong!")
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
