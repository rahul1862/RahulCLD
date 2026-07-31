import { useCallback, useEffect, useState } from "react";
import { transactionService } from "../services/api";
export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return {
    transactions,
    loading,
    error,
    reload: load,
  };
}
export function usePnl() {
  const [pnl, setPnl] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPnl(await transactionService.pnl());
    } catch {
      setPnl(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return {
    pnl,
    loading,
    reload: load,
  };
}
