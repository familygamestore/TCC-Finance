'use client';

import { useEffect, useState } from 'react';
import { api, Dashboard } from '../lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  Search
} from 'lucide-react';

function formatRupiah(n: number) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

function formatDate(dateStr: string, timeStr: string) {
  const date = new Date(`${dateStr}T${timeStr}`);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const result = await api.getDashboard();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const filteredTransactions = data?.transaksi_terbaru.filter(t => {
    const matchesType = filter === 'all' || t.type === filter;
    const matchesSearch = searchTerm === '' || 
      t.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nominal.toString().includes(searchTerm);
    return matchesType && matchesSearch;
  }) || [];

  // Calculate percentage change (mock - you'd need actual historical data)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Mock previous data - replace with actual data from API
  const previousData = {
    saldo: data?.saldo ? data.saldo * 0.92 : 0,
    total_income: data?.total_income ? data.total_income * 0.88 : 0,
    total_expense: data?.total_expense ? data.total_expense * 0.95 : 0,
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Keuangan</h1>
          <p className="subtitle">Ringkasan keuangan TCC, dihitung langsung dari data transaksi</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`icon ${refreshing ? 'spinning' : ''}`} size={18} />
          {refreshing ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => fetchData()} className="retry-btn">
            Coba Lagi
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Wallet size={20} color="#3B82F6" />
                </div>
                <span className="stat-change positive">
                  <ArrowUpRight size={14} />
                  {calculateChange(data.saldo, previousData.saldo).toFixed(1)}%
                </span>
              </div>
              <div className="stat-label">Saldo</div>
              <div className="stat-value">{formatRupiah(data.saldo)}</div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <TrendingUp size={20} color="#22C55E" />
                </div>
                <span className="stat-change positive">
                  <ArrowUpRight size={14} />
                  {calculateChange(data.total_income, previousData.total_income).toFixed(1)}%
                </span>
              </div>
              <div className="stat-label">Total Pemasukan</div>
              <div className="stat-value">{formatRupiah(data.total_income)}</div>
            </div>

            <div className="stat-card stat-card-danger">
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <TrendingDown size={20} color="#EF4444" />
                </div>
                <span className="stat-change negative">
                  <ArrowDownRight size={14} />
                  {calculateChange(data.total_expense, previousData.total_expense).toFixed(1)}%
                </span>
              </div>
              <div className="stat-label">Total Pengeluaran</div>
              <div className="stat-value">{formatRupiah(data.total_expense)}</div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <Calendar size={20} color="#8B5CF6" />
                </div>
              </div>
              <div className="stat-label">Jumlah Event</div>
              <div className="stat-value">{data.jumlah_event}</div>
              <div className="stat-sub">Total events terdaftar</div>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="transactions-section">
            <div className="transactions-header">
              <h2>Transaksi Terbaru</h2>
              <div className="transactions-controls">
                <div className="search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    Semua
                  </button>
                  <button
                    className={`filter-btn income ${filter === 'income' ? 'active' : ''}`}
                    onClick={() => setFilter('income')}
                  >
                    <TrendingUp size={14} />
                    Masuk
                  </button>
                  <button
                    className={`filter-btn expense ${filter === 'expense' ? 'active' : ''}`}
                    onClick={() => setFilter('expense')}
                  >
                    <TrendingDown size={14} />
                    Keluar
                  </button>
                </div>
              </div>
            </div>

            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Tanggal & Waktu</th>
                    <th>Tipe</th>
                    <th>Kategori</th>
                    <th className="text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                      <tr key={t.transaction_id} className="transaction-row">
                        <td>
                          <div className="transaction-date">
                            <Clock size={14} className="time-icon" />
                            {formatDate(t.tanggal, t.jam)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${t.type}`}>
                            {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td>
                          <span className="category-tag">{t.kategori}</span>
                        </td>
                        <td className="text-right">
                          <span className={`amount ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'} {formatRupiah(t.nominal)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        <div className="empty-state-content">
                          <p>Tidak ada transaksi ditemukan</p>
                          {searchTerm || filter !== 'all' ? (
                            <p className="empty-state-hint">
                              Coba ubah filter atau kata kunci pencarian
                            </p>
                          ) : (
                            <p className="empty-state-hint">
                              Belum ada transaksi yang tercatat
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
