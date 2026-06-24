import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function InspectionForm({ products, onSubmitSuccess, t }) {
  const getDefectName = (type) => {
    const key = `defect_${type.toLowerCase().replace(/\s+/g, '_')}`;
    return t(key) !== key ? t(key) : type;
  };
  const [productId, setProductId] = useState('');
  const [inspectionDate, setInspectionDate] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  });
  const [totalInspected, setTotalInspected] = useState('');
  const [totalPassed, setTotalPassed] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [vendorName, setVendorName] = useState('PT. Samjin');
  
  // State for defect breakdown
  const [defects, setDefects] = useState({});
  const [activeDefectTypes, setActiveDefectTypes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Define defect types based on product code
  const productDefectsMap = {
    "BS-037A-1": ["tilted spring", "Contamination", "Scrap", "Burry"],
    "BT-120A": ["tilted spring", "Contamination", "Scrap", "Burry"],
    "WV-93440": ["tilted spring", "Contamination", "Scrap", "Burry"],
    "STL-F141A-00": ["tilted spring", "Contamination", "Scrap", "Burry"],
    "11057-1585": ["tilted spring", "Contamination", "Scrap", "Burry"],
    "B74-F1137": ["tilted spring", "Contamination", "Scrap", "Burry"]
  };

  // Reset and load defect fields when selected product changes
  useEffect(() => {
    if (!productId) {
      setActiveDefectTypes([]);
      setDefects({});
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(productId));
    if (selectedProduct) {
      const code = selectedProduct.product_code;
      const defectTypes = productDefectsMap[code] || ["Lain-lain"];
      setActiveDefectTypes(defectTypes);
      
      // Initialize quantities to 0
      const initialDefects = {};
      defectTypes.forEach(type => {
        initialDefects[type] = 0;
      });
      setDefects(initialDefects);
    }
  }, [productId, products]);

  // Calculate failed units automatically
  const totalFailed = Math.max(0, (parseInt(totalInspected) || 0) - (parseInt(totalPassed) || 0));

  // Sum of defect inputs
  const sumDefectQuantities = Object.values(defects).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0);

  const handleDefectChange = (type, value) => {
    const val = Math.max(0, parseInt(value) || 0);
    setDefects(prev => ({
      ...prev,
      [type]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!productId || !inspectionDate || !totalInspected || !totalPassed || !inspectorName || !vendorName) {
      setErrorMsg(t("form_error_required"));
      return;
    }

    if (parseInt(totalPassed) > parseInt(totalInspected)) {
      setErrorMsg(t("form_error_passed_inspected"));
      return;
    }

    if (totalFailed > 0 && sumDefectQuantities !== totalFailed) {
      setErrorMsg(t("form_error_defects_sum", { sum: sumDefectQuantities, failed: totalFailed }));
      return;
    }

    setLoading(true);

    // Format defects array for backend
    const defectsList = Object.entries(defects)
      .filter(([_, qty]) => qty > 0)
      .map(([type, qty]) => ({
        defect_type: type,
        quantity: qty
      }));

    // Combine selected date with current local time
    const selectedDate = new Date(inspectionDate);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const payload = {
      product_id: parseInt(productId),
      total_inspected: parseInt(totalInspected),
      total_passed: parseInt(totalPassed),
      total_failed: totalFailed,
      inspector_name: inspectorName,
      vendor_name: vendorName,
      inspection_date: selectedDate.toISOString(),
      defects: defectsList
    };

    try {
      const response = await fetch('http://localhost:8000/api/qc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menyimpan data.');
      }

      setSuccessMsg(t("form_success"));
      
      // Reset Form fields
      setTotalInspected('');
      setTotalPassed('');
      setVendorName('PT. Samjin');
      setInspectionDate(() => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
      });
      setDefects(prev => {
        const reset = {};
        Object.keys(prev).forEach(k => { reset[k] = 0; });
        return reset;
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>{t("form_title")}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
        {t("form_subtitle")}
      </p>

      {errorMsg && (
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
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
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
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t("form_label_product")}</label>
          <select 
            className="form-select" 
            value={productId} 
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">{t("form_select_product")}</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.product_name} ({p.product_code})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t("form_label_vendor")}</label>
          <select 
            className="form-select" 
            value={vendorName} 
            onChange={(e) => setVendorName(e.target.value)}
            required
          >
            <option value="PT. Samjin">PT. Samjin</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Tanggal Inspeksi</label>
            <input 
              type="date" 
              className="form-input" 
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form_label_inspector")}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder={lang === 'id' ? 'Nama pemeriksa' : 'Inspector name'}
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">{t("form_label_inspected")}</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="0"
              value={totalInspected}
              onChange={(e) => setTotalInspected(e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form_label_passed")}</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="0"
              value={totalPassed}
              onChange={(e) => setTotalPassed(e.target.value)}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("form_label_failed")}</label>
            <input 
              type="number" 
              className="form-input" 
              value={totalFailed}
              disabled
              style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--color-danger)', fontWeight: 'bold' }}
            />
          </div>
        </div>

        {/* Dynamic Defect Breakdown section */}
        {totalFailed > 0 && activeDefectTypes.length > 0 && (
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '18px', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--color-danger)' }}>
              {t("form_defect_breakdown")}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '14px' }}>
              {t("form_defect_desc", { failed: totalFailed, sum: sumDefectQuantities })}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {activeDefectTypes.map((type, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{getDefectName(type)}</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ width: '80px', padding: '6px 10px', fontSize: '0.85rem' }} 
                    value={defects[type] || ''}
                    onChange={(e) => handleDefectChange(type, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? t("form_submitting") : t("form_submit")}
        </button>
      </form>
    </div>
  );
}
