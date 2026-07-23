import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History, ShieldAlert, Award, FileSpreadsheet, Settings, Download, Printer, User, CheckCircle2 } from 'lucide-react';
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
    defect_burry: "Burry (Berduri/Kasar)",
    login_subtitle: "Silakan masuk untuk mencatat atau memantau kualitas produk.",
    login_username: "Username",
    login_password: "Password",
    login_button: "Masuk",
    login_guest_button: "Masuk sebagai Guest (Tamu)",
    login_error: "Username atau password salah!",
    login_error_empty: "Username dan password wajib diisi.",
    logout_button: "Logout",
    role_inspector: "QC Inspektur",
    role_manager: "QC Supervisor",
    tab_profile: "Profil",
    profile_title: "Pengaturan Profil",
    profile_subtitle: "Perbarui informasi profil dan ubah kata sandi akun Anda.",
    profile_username: "Username",
    profile_full_name: "Nama Lengkap",
    profile_role: "Peran",
    profile_save_name: "Perbarui Profil",
    profile_change_pwd: "Ubah Password",
    profile_curr_pwd: "Password Sekarang",
    profile_new_pwd: "Password Baru",
    profile_conf_pwd: "Konfirmasi Password Baru",
    profile_save_pwd: "Ganti Password",
    profile_success_name: "Nama lengkap berhasil diperbarui!",
    profile_success_pwd: "Password berhasil diganti!",
    profile_error_mismatch: "Konfirmasi password baru tidak cocok!",
    profile_error_empty: "Kolom password wajib diisi."
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
    defect_burry: "Burry",
    login_subtitle: "Please sign in to record or monitor product quality.",
    login_username: "Username",
    login_password: "Password",
    login_button: "Sign In",
    login_guest_button: "Login as Guest",
    login_error: "Incorrect username or password!",
    login_error_empty: "Username and password are required.",
    logout_button: "Logout",
    role_inspector: "QC Inspector",
    role_manager: "QC Manager",
    tab_profile: "Profile",
    profile_title: "Profile Settings",
    profile_subtitle: "Update your profile details and change your account password.",
    profile_username: "Username",
    profile_full_name: "Full Name",
    profile_role: "Role",
    profile_save_name: "Update Profile",
    profile_change_pwd: "Change Password",
    profile_curr_pwd: "Current Password",
    profile_new_pwd: "New Password",
    profile_conf_pwd: "Confirm New Password",
    profile_save_pwd: "Change Password",
    profile_success_name: "Full name updated successfully!",
    profile_success_pwd: "Password changed successfully!",
    profile_error_mismatch: "Confirm new password does not match!",
    profile_error_empty: "Password fields are required."
  }
};

export default function App() {
  useEffect(() => {
    document.title = "KAT QC Dashboard";
  }, []);
  const [lang, setLang] = useState(() => localStorage.getItem('qc_lang') || 'id');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('qc_token') || '');
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!localStorage.getItem('qc_token'));
  const [inspectorsList, setInspectorsList] = useState([]);
  const [newInspFullName, setNewInspFullName] = useState('');
  const [newInspUsername, setNewInspUsername] = useState('');
  const [newInspPassword, setNewInspPassword] = useState('');
  const [addingInsp, setAddingInsp] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Profile form state
  const [profileUsername, setProfileUsername] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileCurrPwd, setProfileCurrPwd] = useState('');
  const [profileNewPwd, setProfileNewPwd] = useState('');
  const [profileConfPwd, setProfileConfPwd] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
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

  // Initial data fetch (products & inspectors)
  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchInspectors();
    }
  }, [user]);

  // Fetch dashboard data when tab is 'dashboard' or selected product changes
  useEffect(() => {
    if (user && currentTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [currentTab, user]);

  useEffect(() => {
    if (selectedProductId && currentTab === 'dashboard') {
      fetchChartData(selectedProductId);
    }
  }, [selectedProductId, currentTab]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await apiFetch('/api/products');
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

  const fetchInspectors = async () => {
    try {
      const res = await apiFetch('/api/qc/inspectors');
      if (res.ok) {
        const data = await res.json();
        setInspectorsList(data);
      }
    } catch (err) {
      console.error("Error fetching inspectors:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    if (selectedProductId) {
      setLoadingChart(true);
    }
    try {
      const promises = [
        apiFetch('/api/dashboard/summary').then(async res => {
          if (res.ok) setSummary(await res.json());
        }),
        apiFetch(`/api/dashboard/defect-distribution${selectedProductId ? `?product_id=${selectedProductId}` : ''}`).then(async res => {
          if (res.ok) setDefectDistData(await res.json());
        }),
        apiFetch('/api/dashboard/vendor-ratings').then(async res => {
          if (res.ok) setVendorRatings(await res.json());
        }),
        apiFetch('/api/qc/history').then(async res => {
          if (res.ok) setHistory(await res.json());
        })
      ];

      if (selectedProductId) {
        promises.push(
          apiFetch(`/api/dashboard/control-chart?product_id=${selectedProductId}`).then(async res => {
            if (res.ok) setControlChartData(await res.json());
          })
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingDashboard(false);
      setLoadingChart(false);
    }
  };

  const fetchChartData = async (productId) => {
    setLoadingChart(true);
    try {
      const promises = [
        apiFetch(`/api/dashboard/control-chart?product_id=${productId}`).then(async res => {
          if (res.ok) setControlChartData(await res.json());
        }),
        apiFetch(`/api/dashboard/defect-distribution?product_id=${productId}`).then(async res => {
          if (res.ok) setDefectDistData(await res.json());
        })
      ];
      await Promise.all(promises);
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
      const res = await apiFetch(`/api/products/${editingProductId}`, {
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
      const res = await apiFetch('/api/products', {
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

  const handleCreateInspector = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    
    if (!newInspFullName || !newInspUsername || !newInspPassword) {
      setConfigError('Semua field wajib diisi untuk membuat inspektur baru.');
      return;
    }
    
    setAddingInsp(true);
    const payload = {
      username: newInspUsername,
      password: newInspPassword,
      full_name: newInspFullName,
      role: 'inspector'
    };
    
    try {
      const res = await apiFetch('/api/qc/inspectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal menambahkan inspektur baru.');
      }
      
      setConfigSuccess('Inspektur baru berhasil ditambahkan!');
      setNewInspFullName('');
      setNewInspUsername('');
      setNewInspPassword('');
      fetchInspectors();
    } catch (err) {
      setConfigError(err.message);
    } finally {
      setAddingInsp(false);
    }
  };

  const startEditProduct = (prod) => {
    setEditingProductId(prod.id.toString());
    setEditName(prod.product_name);
    setEditUcl(prod.ucl_limit.toString());
    setEditLcl(prod.lcl_limit.toString());
  };

  const apiFetch = async (endpoint, options = {}) => {
    const headers = {
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(endpoint, {
      ...options,
      headers,
    });
  };

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfileFullName(user.full_name);
      setProfileUsername(user.username);
      setProfileRole(user.role);
    }
  }, [user]);

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Error verifying token:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError(t('login_error_empty'));
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim().toLowerCase(), password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('qc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentTab('dashboard');
      } else {
        setLoginError(t('login_error'));
      }
    } catch (err) {
      setLoginError(t('login_error'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'guest', password: 'guest123' })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('qc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentTab('dashboard');
      } else {
        setLoginError(t('login_error'));
      }
    } catch (err) {
      setLoginError(t('login_error'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    if (!profileUsername.trim() || !profileFullName.trim() || !profileRole) {
      setProfileErrorMsg('Semua kolom profil wajib diisi.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileUsername.trim().toLowerCase(),
          full_name: profileFullName.trim(),
          role: profileRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfileSuccessMsg(t('profile_success_name'));
      } else {
        const err = await res.json();
        setProfileErrorMsg(err.detail || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileErrorMsg('Network error.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    if (!profileCurrPwd || !profileNewPwd || !profileConfPwd) {
      setProfileErrorMsg(t('profile_error_empty'));
      return;
    }
    if (profileNewPwd !== profileConfPwd) {
      setProfileErrorMsg(t('profile_error_mismatch'));
      return;
    }
    setProfileLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: profileCurrPwd,
          new_password: profileNewPwd
        })
      });
      if (res.ok) {
        setProfileSuccessMsg(t('profile_success_pwd'));
        setProfileCurrPwd('');
        setProfileNewPwd('');
        setProfileConfPwd('');
      } else {
        const err = await res.json();
        setProfileErrorMsg(err.detail || 'Failed to change password.');
      }
    } catch (err) {
      setProfileErrorMsg('Network error.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('qc_token');
    setToken('');
    setUser(null);
    setLoginUsername('');
    setLoginPassword('');
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

  if (loadingUser) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#090d16' }}>
        <div className="alert-pulse" style={{ color: 'var(--color-brand)', fontWeight: 600 }}>Loading Q-Shield Pro...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 50%, #0F172A 0%, #020617 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Neon decorative blobs */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(2, 132, 199, 0.15)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          top: '20%',
          left: '20%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          bottom: '20%',
          right: '20%',
          pointerEvents: 'none'
        }} />

        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand), #0284C7)',
            padding: '16px',
            borderRadius: '50%',
            color: '#000',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Award size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Q-Shield Pro</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {t("login_subtitle")}
          </p>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.8rem',
              textAlign: 'left'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">{t("login_username")}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Username" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">{t("login_password")}</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loginLoading}>
              {loginLoading ? '...' : t("login_button")}
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '12px', marginTop: '12px', borderStyle: 'dashed', borderColor: 'var(--color-brand)' }} 
              onClick={handleGuestLogin}
              disabled={loginLoading}
            >
              {loginLoading ? '...' : t("login_guest_button")}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          {user && user.role === 'manager' && (
            <button 
              className={`btn ${currentTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setCurrentTab('config')}
            >
              <Settings size={16} />
              {t("tab_config")}
            </button>
          )}

          {user && user.username !== 'guest' && (
            <button 
              className={`btn ${currentTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setCurrentTab('profile')}
            >
              <User size={16} />
              {t("tab_profile")}
            </button>
          )}

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

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-brand)', fontWeight: 500 }}>
                  {user.role === 'manager' ? t('role_manager') : t('role_inspector')}
                </p>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} 
                onClick={handleLogout}
              >
                {t('logout_button')}
              </button>
            </div>
          )}
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
            inspectorsList={inspectorsList}
            onSubmitSuccess={() => {
              // Redirect to dashboard tab after a small delay to see the success message
              setTimeout(() => {
                setCurrentTab('dashboard');
              }, 1200);
            }} 
            t={t}
            user={user}
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

            {/* Kelola Inspektur Section */}
            <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Kelola Inspektur</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Tambah atau lihat daftar inspektur QC yang bertugas melakukan pengecekan produk.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Kolom 1: Daftar Inspektur */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>Daftar Inspektur Aktif</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {inspectorsList.map((name, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <span style={{ fontWeight: 500 }}>{name}</span>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Aktif</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom 2: Form Tambah Inspektur */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>Tambah Inspektur Baru</h3>
                  <form onSubmit={handleCreateInspector}>
                    <div className="form-group">
                      <label className="form-label">Nama Lengkap (Ditampilkan di Dropdown)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="Contoh: Alpih"
                        value={newInspFullName}
                        onChange={(e) => setNewInspFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Username (Untuk Login)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="Contoh: alpih"
                        value={newInspUsername}
                        onChange={(e) => setNewInspUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input 
                        type="password" 
                        className="form-input"
                        placeholder="Masukkan password akun baru"
                        value={newInspPassword}
                        onChange={(e) => setNewInspPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '10px' }}
                      disabled={addingInsp}
                    >
                      {addingInsp ? 'Menambahkan...' : 'Simpan Akun Inspektur'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>{t("profile_title")}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {t("profile_subtitle")}
            </p>

            {profileErrorMsg && (
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
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {profileSuccessMsg && (
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
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Profile Details & Name Form */}
              <div className="glass-card">
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">{t("profile_username")}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileUsername} 
                        onChange={(e) => setProfileUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("profile_role")}</label>
                      <select 
                        className="form-select" 
                        value={profileRole} 
                        onChange={(e) => setProfileRole(e.target.value)}
                        required
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        <option value="inspector">{t('role_inspector')}</option>
                        <option value="manager">{t('role_manager')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t("profile_full_name")}</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={profileLoading}>
                    {profileLoading ? '...' : t("profile_save_name")}
                  </button>
                </form>
              </div>

              {/* Password Form */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>{t("profile_change_pwd")}</h3>
                <form onSubmit={handleUpdatePassword}>
                  <div className="form-group">
                    <label className="form-label">{t("profile_curr_pwd")}</label>
                    <input 
                      type="password" 
                      className="form-input"
                      value={profileCurrPwd}
                      onChange={(e) => setProfileCurrPwd(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">{t("profile_new_pwd")}</label>
                      <input 
                        type="password" 
                        className="form-input"
                        value={profileNewPwd}
                        onChange={(e) => setProfileNewPwd(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("profile_conf_pwd")}</label>
                      <input 
                        type="password" 
                        className="form-input"
                        value={profileConfPwd}
                        onChange={(e) => setProfileConfPwd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={profileLoading}>
                    {profileLoading ? '...' : t("profile_save_pwd")}
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
