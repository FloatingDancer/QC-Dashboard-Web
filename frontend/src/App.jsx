import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History, ShieldAlert, Award, FileSpreadsheet, Settings, Download, Printer } from 'lucide-react';
import KPIStats from './components/KPIStats';
import ControlChart from './components/ControlChart';
import ParetoChart from './components/ParetoChart';
import InspectionForm from './components/InspectionForm';
import * as XLSX from 'xlsx';

const translations = {
  id: {
    app_subtitle: "Automated QC Statistical Dashboard",
    tab_dashboard: "Dashboard",
    tab_input: "Input Inspeksi",
    tab_config: "Pengaturan",
    
    today_yield_rate: "Yield Rate Hari Ini",
    today_inspected: "Diperiksa Hari Ini",
    today_defects: "Cacat Hari Ini",
    active_alerts: "Pemberitahuan Aktif",
    yield_desc: "Persentase unit yang lolos",
    inspected_desc: "Lolos: {passed}",
    defects_desc: "Tingkat Gagal: {rate}%",
    alerts_desc: "Di luar batas toleransi (7 hari terakhir)",
    today_title: "Overview Real-time QC",
    today_subtitle_desc: "Pemantauan metrik kualitas produk hari ini",
    refresh: "Refresh",
    
    product_analysis: "Analisis Produk:",
    loading_products: "Memuat produk...",
    print_pdf: "Cetak PDF",
    export_excel: "Ekspor Excel",
    
    chart_ucl: "Batas Atas (UCL)",
    chart_lcl: "Batas Bawah (LCL)",
    chart_cl: "Garis Tengah (CL)",
    chart_no_data: "Tidak ada data batch inspeksi untuk produk ini.",
    control_chart_title: "SPC Control Chart (P-Chart)",
    control_chart_subtitle: "Produk:",
    loading_chart: "Memuat data grafik...",
    pareto_title: "Pareto Analysis",
    pareto_subtitle: "Kontribusi jenis cacat terbesar",
    pareto_qty: "Jumlah Cacat",
    pareto_contribution: "Kontribusi",
    pareto_no_data: "Tidak ada data jenis cacat yang tercatat.",
    loading_pareto: "Memuat analisis cacat...",
    
    vendor_title: "Kinerja Kualitas Vendor",
    vendor_no_data: "Tidak ada data vendor.",
    vendor_ratings_desc: "Inspeksi: {inspected} | Defect: {failed}",
    vendor_yield: "Yield: {rate}%",
    
    log_title: "Log Aktivitas Inspeksi QC",
    log_show: "Tampilkan:",
    log_rows: "{val} Baris",
    log_loading: "Memuat data log aktivitas...",
    log_empty: "Belum ada log inspeksi yang tercatat.",
    log_col_time: "Waktu Inspeksi",
    log_col_batch: "Nomor Batch",
    log_col_vendor: "Vendor",
    log_col_inspector: "Inspektur",
    log_col_inspected: "Diperiksa",
    log_col_passed: "Lolos",
    log_col_failed: "Gagal (Defect)",
    log_col_rate: "Defect Rate",
    log_showing_entries: "Menampilkan {start}-{end} dari {total} data",
    log_prev: "Sebelumnya",
    log_next: "Selanjutnya",
    log_page_info: "Halaman {curr} dari {total}",
    
    config_title: "Konfigurasi QC & Produk",
    config_subtitle: "Kelola daftar Part Number produk dan batas toleransi kendali kualitas (UCL/LCL)",
    config_error_required: "Nama produk dan batas UCL wajib diisi.",
    config_success_update: "Konfigurasi produk berhasil diperbarui!",
    config_success_create: "Produk baru berhasil didaftarkan!",
    config_error_create: "Semua field wajib diisi untuk membuat produk baru.",
    config_edit_title: "Edit Batas Kendali QC",
    config_edit_select: "-- Pilih Produk --",
    config_edit_prod_name: "Nama Produk",
    config_edit_ucl: "Batas Atas (UCL) - Desimal",
    config_edit_lcl: "Batas Bawah (LCL) - Desimal",
    config_edit_ucl_pct: "Persen: {pct}%",
    config_edit_save: "Simpan Perubahan",
    config_new_title: "Daftarkan Produk Baru",
    config_new_code: "Part Number / Kode",
    config_new_code_placeholder: "misal: 11697-1568",
    config_new_name: "Nama Produk",
    config_new_name_placeholder: "misal: Cover Remote 11697-1568",
    config_new_ucl: "Batas Toleransi UCL (Desimal)",
    config_new_ucl_placeholder: "misal: 0.05",
    config_new_save: "Tambah Produk",
    
    form_title: "Form Input Inspeksi QC",
    form_subtitle: "Gunakan form digital ini untuk mencatat hasil pengecekan produk di lapangan.",
    form_error_required: "Semua data utama inspeksi wajib diisi.",
    form_error_passed_inspected: "Jumlah lolos (passed) tidak boleh melebihi jumlah diperiksa (inspected).",
    form_error_defects_sum: "Total rincian cacat ({sum} unit) harus sama dengan jumlah unit gagal ({failed} unit).",
    form_success: "Data inspeksi QC berhasil disimpan ke database!",
    form_select_product: "-- Pilih Produk --",
    form_label_product: "Pilih Produk",
    form_label_vendor: "Pilih Vendor",
    form_label_date: "Tanggal Inspeksi",
    form_label_inspector: "Nama Inspector",
    form_label_inspected: "Total Diperiksa",
    form_label_passed: "Total Lolos (Pass)",
    form_label_failed: "Total Gagal (Defect)",
    form_defect_breakdown: "Rincian Jenis Cacat (Defect Breakdown)",
    form_defect_desc: "Masukkan jumlah unit untuk setiap defect. Jumlah total harus pas {failed} unit (Saat ini: {sum} unit).",
    form_submit: "Simpan Laporan QC",
    form_submitting: "Menyimpan...",
    
    defect_tilted_spring: "Tilted Spring (Pegas Miring)",
    defect_contamination: "Contamination (Kontaminasi)",
    defect_scrap: "Scrap (Sisa Bahan)",
    defect_burry: "Burry (Berduri/Kasar)"
  },
  en: {
    app_subtitle: "Automated QC Statistical Dashboard",
    tab_dashboard: "Dashboard",
    tab_input: "Inspection Input",
    tab_config: "Settings",
    
    today_yield_rate: "Today's Yield Rate",
    today_inspected: "Today's Inspected",
    today_defects: "Today's Defects",
    active_alerts: "Active Alerts",
    yield_desc: "Percentage of passed units",
    inspected_desc: "Passed: {passed}",
    defects_desc: "Fail Rate: {rate}%",
    alerts_desc: "Out of limits (Last 7 days)",
    today_title: "Overview Real-time QC",
    today_subtitle_desc: "Monitoring today's product quality metrics",
    refresh: "Refresh",
    
    product_analysis: "Product Analysis:",
    loading_products: "Loading products...",
    print_pdf: "Print PDF",
    export_excel: "Export Excel",
    
    chart_ucl: "Upper Control Limit (UCL)",
    chart_lcl: "Lower Control Limit (LCL)",
    chart_cl: "Center Line (CL)",
    chart_no_data: "No inspection batch data for this product.",
    control_chart_title: "SPC Control Chart (P-Chart)",
    control_chart_subtitle: "Product:",
    loading_chart: "Loading chart data...",
    pareto_title: "Pareto Analysis",
    pareto_subtitle: "Largest defect type contributions",
    pareto_qty: "Defect Quantity",
    pareto_contribution: "Contribution",
    pareto_no_data: "No recorded defect types.",
    loading_pareto: "Loading defect analysis...",
    
    vendor_title: "Vendor Quality Performance",
    vendor_no_data: "No vendor data.",
    vendor_ratings_desc: "Inspections: {inspected} | Defects: {failed}",
    vendor_yield: "Yield: {rate}%",
    
    log_title: "QC Inspection Activity Log",
    log_show: "Show:",
    log_rows: "{val} Rows",
    log_loading: "Loading activity log data...",
    log_empty: "No inspection logs recorded yet.",
    log_col_time: "Inspection Time",
    log_col_batch: "Batch Number",
    log_col_vendor: "Vendor",
    log_col_inspector: "Inspector",
    log_col_inspected: "Inspected",
    log_col_passed: "Passed",
    log_col_failed: "Failed (Defect)",
    log_col_rate: "Defect Rate",
    log_showing_entries: "Showing {start}-{end} of {total} entries",
    log_prev: "Previous",
    log_next: "Next",
    log_page_info: "Page {curr} of {total}",
    
    config_title: "QC & Product Configuration",
    config_subtitle: "Manage product Part Numbers and quality control tolerance limits (UCL/LCL)",
    config_error_required: "Product name and UCL limit are required.",
    config_success_update: "Product configuration successfully updated!",
    config_success_create: "New product successfully registered!",
    config_error_create: "All fields are required to create a new product.",
    config_edit_title: "Edit QC Control Limits",
    config_edit_select: "-- Select Product --",
    config_edit_prod_name: "Product Name",
    config_edit_ucl: "Upper Limit (UCL) - Decimal",
    config_edit_lcl: "Lower Limit (LCL) - Decimal",
    config_edit_ucl_pct: "Percent: {pct}%",
    config_edit_save: "Save Changes",
    config_new_title: "Register New Product",
    config_new_code: "Part Number / Code",
    config_new_code_placeholder: "e.g. 11697-1568",
    config_new_name: "Product Name",
    config_new_name_placeholder: "e.g. Cover Remote 11697-1568",
    config_new_ucl: "UCL Tolerance Limit (Decimal)",
    config_new_ucl_placeholder: "e.g. 0.05",
    config_new_save: "Add Product",
    
    form_title: "QC Inspection Input Form",
    form_subtitle: "Use this digital form to record product checking results in the field.",
    form_error_required: "All core inspection data are required.",
    form_error_passed_inspected: "Passed quantity cannot exceed inspected quantity.",
    form_error_defects_sum: "Total defect details ({sum} units) must equal failed units ({failed} units).",
    form_success: "QC inspection data successfully saved to database!",
    form_select_product: "-- Select Product --",
    form_label_product: "Select Product",
    form_label_vendor: "Select Vendor",
    form_label_date: "Inspection Date",
    form_label_inspector: "Inspector Name",
    form_label_inspected: "Total Inspected",
    form_label_passed: "Total Passed",
    form_label_failed: "Total Failed",
    form_defect_breakdown: "Defect Breakdown Details",
    form_defect_desc: "Enter quantity for each defect. The total must equal exactly {failed} units (Current: {sum} units).",
    form_submit: "Save QC Report",
    form_submitting: "Saving...",
    
    defect_tilted_spring: "Tilted Spring",
    defect_contamination: "Contamination",
    defect_scrap: "Scrap",
    defect_burry: "Burry"
  }
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('qc_lang') || 'id');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  
  const t = (key, placeholders = {}) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    Object.entries(placeholders).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  useEffect(() => {
    localStorage.setItem('qc_lang', lang);
  }, [lang]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  // Dashboard states
  const [summary, setSummary] = useState({
    total_inspected_today: 0,
    total_passed_today: 0,
    total_failed_today: 0,
    yield_rate_today: 100,
    total_inspected_overall: 0,
    total_passed_overall: 0,
    total_failed_overall: 0,
    yield_rate_overall: 100,
    active_alerts_count: 0
  });
  const [controlChartData, setControlChartData] = useState(null);
  const [defectDistData, setDefectDistData] = useState([]);
  const [history, setHistory] = useState([]);
  const [vendorRatings, setVendorRatings] = useState([]);
  
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  // Config States for Product Management
  const [editingProductId, setEditingProductId] = useState('');
  const [editName, setEditName] = useState('');
  const [editUcl, setEditUcl] = useState('');
  const [editLcl, setEditLcl] = useState('');
  
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newUcl, setNewUcl] = useState('');
  
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page to 1 when history or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [history, pageSize]);

  const totalPages = Math.ceil(history.length / pageSize) || 1;
  const paginatedHistory = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Initial products fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch dashboard data when tab is 'dashboard' or selected product changes
  useEffect(() => {
    if (currentTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [currentTab]);

  useEffect(() => {
    if (selectedProductId && currentTab === 'dashboard') {
      fetchChartData(selectedProductId);
    }
  }, [selectedProductId, currentTab]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('http://localhost:8000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      // 1. Fetch summary
      const summaryRes = await fetch('http://localhost:8000/api/dashboard/summary');
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      // 2. Fetch Pareto data (filtered dynamically if product selected, otherwise overall)
      const defectRes = await fetch(`http://localhost:8000/api/dashboard/defect-distribution${selectedProductId ? `?product_id=${selectedProductId}` : ''}`);
      if (defectRes.ok) {
        const defectData = await defectRes.json();
        setDefectDistData(defectData);
      }

      // 3. Fetch vendor ratings
      const vendorRes = await fetch('http://localhost:8000/api/dashboard/vendor-ratings');
      if (vendorRes.ok) {
        const vendorData = await vendorRes.json();
        setVendorRatings(vendorData);
      }

      // 4. Fetch history log
      const historyRes = await fetch('http://localhost:8000/api/qc/history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }

      // 5. Fetch chart for selected product
      if (selectedProductId) {
        fetchChartData(selectedProductId);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchChartData = async (productId) => {
    setLoadingChart(true);
    try {
      // Fetch Control Chart data
      const res = await fetch(`http://localhost:8000/api/dashboard/control-chart?product_id=${productId}`);
      if (res.ok) {
        const chartData = await res.json();
        setControlChartData(chartData);
      }
      
      // Fetch Dynamic defect Pareto for this product
      const defectRes = await fetch(`http://localhost:8000/api/dashboard/defect-distribution?product_id=${productId}`);
      if (defectRes.ok) {
        const defectData = await defectRes.json();
        setDefectDistData(defectData);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoadingChart(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    
    if (!editingProductId || !editName || !editUcl) {
      setConfigError('Nama produk dan batas UCL wajib diisi.');
      return;
    }
    
    const payload = {
      product_name: editName,
      ucl_limit: parseFloat(editUcl),
      lcl_limit: parseFloat(editLcl) || 0.0
    };
    
    try {
      const res = await fetch(`http://localhost:8000/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Gagal memperbarui konfigurasi produk.');
      
      setConfigSuccess('Konfigurasi produk berhasil diperbarui!');
      fetchProducts(); // Refresh product dropdown & lists
    } catch (err) {
      setConfigError(err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    
    if (!newProductCode || !newProductName || !newUcl) {
      setConfigError('Semua field wajib diisi untuk membuat produk baru.');
      return;
    }
    
    const payload = {
      product_code: newProductCode,
      product_name: newProductName,
      ucl_limit: parseFloat(newUcl),
      lcl_limit: 0.0
    };
    
    try {
      const res = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal menambahkan produk baru.');
      }
      
      setConfigSuccess('Produk baru berhasil didaftarkan!');
      setNewProductCode('');
      setNewProductName('');
      setNewUcl('');
      fetchProducts();
    } catch (err) {
      setConfigError(err.message);
    }
  };

  const startEditProduct = (prod) => {
    setEditingProductId(prod.id.toString());
    setEditName(prod.product_name);
    setEditUcl(prod.ucl_limit.toString());
    setEditLcl(prod.lcl_limit.toString());
  };

  const exportToExcel = () => {
    const excelData = history.map(h => {
      const product = products.find(p => p.id === h.product_id);
      return {
        'Waktu Inspeksi': formatDate(h.inspection_date),
        'Nomor Batch': h.batch_number,
        'Part Number': product ? product.product_code : '',
        'Nama Produk': product ? product.product_name : '',
        'Inspektur': h.inspector_name,
        'Vendor': h.vendor_name,
        'Total Diperiksa': h.total_inspected,
        'Total Lolos': h.total_passed,
        'Total Gagal': h.total_failed,
        'Defect Rate': `${((h.total_failed / h.total_inspected) * 100).toFixed(2)}%`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Aktivitas QC");
    
    worksheet["!cols"] = [ 
      { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, 
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 12 } 
    ];

    XLSX.writeFile(workbook, "QC_Activity_Log_Report.xlsx");
  };

  const printDashboard = () => {
    window.print();
  };

  return (
    <div>
      <style>{`
        @media print {
          header, .btn, .form-select, select, .form-group, span, button, .badge {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .glass-card {
            border: 1px solid #ccc !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            margin-bottom: 20px !important;
          }
          h1, h2, h3, h4, p, span, td, th {
            color: #000 !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
      {/* Navbar Header */}
      <header style={{
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand), #0284C7)',
            padding: '8px',
            borderRadius: '10px',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Q-Shield Pro</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("app_subtitle")}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`btn ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setCurrentTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            {t("tab_dashboard")}
          </button>
          <button 
            className={`btn ${currentTab === 'input' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setCurrentTab('input')}
          >
            <PlusCircle size={16} />
            {t("tab_input")}
          </button>
          <button 
            className={`btn ${currentTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setCurrentTab('config')}
          >
            <Settings size={16} />
            {t("tab_config")}
          </button>

          <select 
            className="form-select" 
            style={{ 
              width: 'auto', 
              padding: '8px 12px', 
              fontSize: '0.85rem', 
              marginLeft: '8px',
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              backgroundPosition: 'right 8px center'
            }}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="id" style={{ background: '#111827' }}>ID</option>
            <option value="en" style={{ background: '#111827' }}>EN</option>
          </select>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ padding: '40px 5%', maxWidth: '1440px', margin: '0 auto' }}>
        
        {currentTab === 'dashboard' && (
          <>
            {/* KPI Cards section */}
            <KPIStats 
              summary={summary} 
              onRefresh={fetchDashboardData} 
              loading={loadingDashboard} 
              t={t}
            />

            {/* Filter & Selector */}
            <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {t("product_analysis")}
                </span>
                {loadingProducts ? (
                  <span style={{ color: 'var(--text-muted)' }}>{t("loading_products")}</span>
                ) : (
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', minWidth: '240px', padding: '8px 12px', fontSize: '0.875rem' }}
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.product_name} ({p.product_code})</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={printDashboard}>
                  <Printer size={15} /> {t("print_pdf")}
                </button>
                <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={exportToExcel}>
                  <Download size={15} /> {t("export_excel")}
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              <ControlChart data={controlChartData} loading={loadingChart} t={t} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ParetoChart data={defectDistData} loading={loadingDashboard} t={t} />
                
                {/* Vendor Performance Leaderboard */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Award size={18} style={{ color: 'var(--color-warning)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{t("vendor_title")}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {vendorRatings.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>{t("vendor_no_data")}</p>
                    ) : (
                      vendorRatings.map((vendor, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${vendor.yield_rate >= 98.0 ? 'var(--color-success)' : 'var(--color-warning)'}`
                        }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{vendor.vendor_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {t("vendor_ratings_desc", { inspected: vendor.total_inspected, failed: vendor.total_failed })}
                            </p>
                          </div>
                          <span className={`badge ${vendor.yield_rate >= 98.0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                            {t("vendor_yield", { rate: vendor.yield_rate })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs Table */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={20} style={{ color: 'var(--color-brand)' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t("log_title")}</h3>
                </div>
                
                {/* Page Size Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>{t("log_show")}</span>
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', backgroundPosition: 'right 8px center' }}
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                  >
                    <option value={10}>{t("log_rows", { val: 10 })}</option>
                    <option value={20}>{t("log_rows", { val: 20 })}</option>
                    <option value={50}>{t("log_rows", { val: 50 })}</option>
                  </select>
                </div>
              </div>

              {loadingDashboard && history.length === 0 ? (
                <p className="alert-pulse" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  {t("log_loading")}
                </p>
              ) : history.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  {t("log_empty")}
                </p>
              ) : (
                <>
                  <div className="table-container" style={{ marginBottom: '18px' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>{t("log_col_time")}</th>
                          <th>{t("log_col_batch")}</th>
                          <th>{t("log_col_vendor")}</th>
                          <th>{t("log_col_inspector")}</th>
                          <th style={{ textAlign: 'right' }}>{t("log_col_inspected")}</th>
                          <th style={{ textAlign: 'right' }}>{t("log_col_passed")}</th>
                          <th style={{ textAlign: 'right' }}>{t("log_col_failed")}</th>
                          <th style={{ textAlign: 'center' }}>{t("log_col_rate")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.map((h) => {
                          const product = products.find(p => p.id === h.product_id);
                          const defectRate = h.total_failed / h.total_inspected;
                          const isOut = product ? defectRate > product.ucl_limit : false;
                          
                          return (
                            <tr key={h.id}>
                              <td>{formatDate(h.inspection_date)}</td>
                              <td style={{ fontWeight: 600 }}>{h.batch_number}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{h.vendor_name}</td>
                              <td>{h.inspector_name}</td>
                              <td style={{ textAlign: 'right' }}>{h.total_inspected}</td>
                              <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>{h.total_passed}</td>
                              <td style={{ textAlign: 'right', color: h.total_failed > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                                {h.total_failed}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${isOut ? 'badge-danger' : 'badge-success'}`}>
                                  {(defectRate * 100).toFixed(1)}% {isOut ? '⚠️' : '✓'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {t("log_showing_entries", { 
                        start: history.length > 0 ? (currentPage - 1) * pageSize + 1 : 0, 
                        end: Math.min(history.length, currentPage * pageSize), 
                        total: history.length 
                      })}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        {t("log_prev")}
                      </button>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {t("log_page_info", { curr: currentPage, total: totalPages })}
                      </span>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        {t("log_next")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {currentTab === 'input' && (
          <InspectionForm 
            products={products} 
            onSubmitSuccess={() => {
              // Redirect to dashboard tab after a small delay to see the success message
              setTimeout(() => {
                setCurrentTab('dashboard');
              }, 1200);
            }} 
            t={t}
          />
        )}

        {currentTab === 'config' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>{t("config_title")}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {t("config_subtitle")}
            </p>

            {configError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--color-danger-glow)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--color-danger)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.875rem'
              }}>
                <ShieldAlert size={18} />
                <span>{configError}</span>
              </div>
            )}

            {configSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--color-success-glow)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--color-success)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.875rem'
              }}>
                <ShieldAlert size={18} style={{ color: 'var(--color-success)' }} />
                <span>{configSuccess}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Form 1: Edit Existing Product */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>{t("config_edit_title")}</h3>
                <form onSubmit={handleUpdateProduct}>
                  <div className="form-group">
                    <label className="form-label">{t("form_label_product")}</label>
                    <select 
                      className="form-select" 
                      value={editingProductId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingProductId(val);
                        const prod = products.find(p => p.id === parseInt(val));
                        if (prod) {
                          setEditName(prod.product_name);
                          setEditUcl(prod.ucl_limit.toString());
                          setEditLcl(prod.lcl_limit.toString());
                        } else {
                          setEditName('');
                          setEditUcl('');
                          setEditLcl('');
                        }
                      }}
                      required
                    >
                      <option value="">{t("config_edit_select")}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.product_name} ({p.product_code})</option>
                      ))}
                    </select>
                  </div>

                  {editingProductId && (
                    <>
                      <div className="form-group">
                        <label className="form-label">{t("config_edit_prod_name")}</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">{t("config_edit_ucl")}</label>
                          <input 
                            type="number" 
                            step="0.001"
                            min="0"
                            max="1"
                            className="form-input"
                            value={editUcl}
                            onChange={(e) => setEditUcl(e.target.value)}
                            required
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t("config_edit_ucl_pct", { pct: (parseFloat(editUcl) * 100 || 0).toFixed(1) })}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="form-label">{t("config_edit_lcl")}</label>
                          <input 
                            type="number" 
                            step="0.001"
                            min="0"
                            max="1"
                            className="form-input"
                            value={editLcl}
                            onChange={(e) => setEditLcl(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        {t("config_edit_save")}
                      </button>
                    </>
                  )}
                </form>
              </div>

              {/* Form 2: Add New Product */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>{t("config_new_title")}</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label className="form-label">{t("config_new_code")}</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder={t("config_new_code_placeholder")}
                      value={newProductCode}
                      onChange={(e) => setNewProductCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("config_edit_prod_name")}</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder={t("config_new_name_placeholder")}
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("config_new_ucl")}</label>
                    <input 
                      type="number" 
                      step="0.001"
                      min="0.001"
                      max="1"
                      className="form-input"
                      placeholder={t("config_new_ucl_placeholder")}
                      value={newUcl}
                      onChange={(e) => setNewUcl(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t("config_edit_ucl_pct", { pct: (parseFloat(newUcl) * 100 || 0).toFixed(1) })}
                    </span>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    {t("config_new_save")}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
