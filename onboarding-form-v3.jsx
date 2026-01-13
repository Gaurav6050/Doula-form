import React, { useState, useRef } from 'react';

// --- Data Constants ---
const sampleDoulas = [
  { id: 1, name: 'Maria Santos', specialty: 'First-time Mothers', experience: '8 years', languages: 'English, Spanish', photo: '👩🏽‍⚕️' },
  { id: 2, name: 'Keisha Williams', specialty: 'High-risk Pregnancies', experience: '12 years', languages: 'English', photo: '👩🏿‍⚕️' },
  { id: 3, name: 'Sarah Chen', specialty: 'Natural Birth Support', experience: '6 years', languages: 'English, Mandarin', photo: '👩🏻‍⚕️' },
  { id: 4, name: 'Aisha Patel', specialty: 'Postpartum Care', experience: '10 years', languages: 'English, Hindi, Gujarati', photo: '👩🏾‍⚕️' },
  { id: 5, name: 'Jennifer Moore', specialty: 'VBAC Support', experience: '9 years', languages: 'English', photo: '👩🏼‍⚕️' },
  { id: 6, name: 'Rosa Martinez', specialty: 'Teen Mothers', experience: '7 years', languages: 'English, Spanish', photo: '👩🏽‍⚕️' },
];

const services = {
  birth: ['Prenatal Visits', 'Labor & Delivery Support', 'Postpartum Care', 'Lactation Support', 'Childbirth Education', 'Emotional Support'],
  postpartum: ['Postpartum Recovery Support', 'Lactation Support', 'Newborn Care Education', 'Emotional Support', 'Sleep Support', 'Return To Work Planning'],
  loss: ['Emotional Support During Loss', 'Hospital Accompaniment', 'Postpartum Recovery Support', 'Grief Counseling Referrals', 'Return To Work Support'],
  abortion: ['Pre-procedure Support', 'Procedure Accompaniment', 'Post-procedure Care', 'Emotional Support', 'Recovery Planning'],
};

const insuranceProviders = [
  { value: 'kaiser', label: 'Kaiser Permanente', type: 'All Patients' },
  { value: 'anthem', label: 'Anthem Blue Cross', type: 'All Patients' },
  { value: 'blueshield', label: 'Blue Shield of California', type: 'Medi-Cal & Commercial (with prior auth)' },
  { value: 'blueshield-promise', label: 'Blue Shield Promise Plan', type: 'Medi-Cal Only' },
  { value: 'healthnet', label: 'Health Net', type: 'Medi-Cal Only' },
  { value: 'molina', label: 'Molina Healthcare', type: 'All Patients' },
  { value: 'lacare', label: 'L.A. Care Health Plan', type: 'Medi-Cal, LACC & LACC Direct' },
  { value: 'aetna', label: 'Aetna', type: 'All Patients' },
  { value: 'cigna', label: 'Cigna', type: 'All Patients' },
  { value: 'united', label: 'United Healthcare', type: 'All Patients' },
  { value: 'bcbs', label: 'Blue Cross Blue Shield', type: 'All Patients' },
  { value: 'iehp', label: 'Inland Empire Health Plan', type: 'Medi-Cal Only' },
  { value: 'ccah', label: 'Central California Alliance for Health', type: 'Medi-Cal Only' },
  { value: 'hpsj', label: 'Health Plan of San Joaquin', type: 'Medi-Cal Only' },
  { value: 'partnership', label: 'Partnership Health Plan', type: 'Medi-Cal Only' },
  { value: 'cchp', label: 'Contra Costa Health Plan', type: 'All Patients' },
  { value: 'calviva', label: 'CalViva Health', type: 'Medi-Cal Only' },
  { value: 'sharp', label: 'SHARP', type: 'Prior Auth Required' },
  { value: 'sutter', label: 'Sutter Health Plus', type: 'Select Patients with Doula Coverage' },
  { value: 'medi-cal', label: 'Medi-Cal (Fee-for-Service)', type: 'All Medi-Cal Patients' },
  { value: 'other', label: 'Other', type: '' },
];

const featuredLogos = ['Kaiser', 'Anthem', 'Health Net', 'Molina', 'L.A. Care', 'Blue Shield'];

const coverageDetails = {
  default: {
    title: 'Typical Doula Benefit Coverage',
    description: 'Most insurance plans that cover doula services include:',
    visits: [
      { name: 'One initial visit', desc: '90 minutes' },
      { name: 'Up to 8 additional visits', desc: 'Any combination of prenatal and postpartum visits (minimum 1 hour each)' },
      { name: 'Support during labor and delivery', desc: 'Including labor and delivery resulting in a stillbirth, abortion, or miscarriage' },
      { name: 'Up to 2 extended postpartum visits', desc: '3 hour visits after delivery' },
    ],
    note: 'Coverage varies by plan. Raya Health will verify your specific benefits.',
  },
  'medi-cal': {
    title: 'Medi-Cal Doula Benefit',
    description: 'California Medi-Cal covers comprehensive doula services:',
    visits: [
      { name: 'One initial visit', desc: '90 minutes' },
      { name: 'Up to 8 additional visits', desc: 'Any combination of prenatal and postpartum visits (minimum 1 hour each)' },
      { name: 'Support during labor and delivery', desc: 'Including labor and delivery resulting in a stillbirth, abortion, or miscarriage' },
      { name: 'Up to 2 extended postpartum visits', desc: '3 hour visits after delivery' },
      { name: '9 additional postpartum visits', desc: 'With provider recommendation (Medi-Cal exclusive benefit)' },
    ],
    note: 'No prior authorization required. Standing recommendation from DHCS Medical Director covers initial services.',
  },
};

const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const text = typeof result === 'string' ? result : '';
      const base64 = text.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });

// --- Helper Component: Date Input with Picker ---
const DateInputWithPicker = ({ label, value, onChange, error }) => {
  const pickerRef = useRef(null);

  // 1. Handle Manual Typing (Display Format: MM/DD/YYYY)
  const handleTextChange = (e) => {
    let text = e.target.value;
    // Allow numbers and slashes only
    text = text.replace(/[^0-9/]/g, '');
    
    // Auto-formatting slashes
    if (text.length === 2 && value.length === 1) text += '/';
    if (text.length === 5 && value.length === 4) text += '/';
    
    if (text.length <= 10) onChange(text);
  };

  // 2. Handle Calendar Selection (Browser returns YYYY-MM-DD)
  const handlePickerChange = (e) => {
    const dateVal = e.target.value; // YYYY-MM-DD
    if (dateVal) {
      const [year, month, day] = dateVal.split('-');
      // Convert to Display Format: MM/DD/YYYY
      onChange(`${month}/${day}/${year}`);
    }
  };

  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.dateFieldWrapper}>
        <input
          style={{ ...styles.input, paddingRight: 52, ...(error ? styles.inputError : {}) }}
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="mm/dd/yyyy"
          maxLength={10}
        />
        
        {/* Hidden Date Picker (Triggers via Ref) */}
        <input
          type="date"
          ref={pickerRef}
          onChange={handlePickerChange}
          style={{ 
            position: 'absolute', right: 0, bottom: 0, 
            width: 40, height: '100%', opacity: 0, zIndex: 0 
          }}
          tabIndex={-1}
        />

        <span 
          style={{ ...styles.dateIcon, cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={() => {
             // Try/Catch for browser compatibility
             try { pickerRef.current.showPicker(); } 
             catch { pickerRef.current.focus(); }
          }}
        >
          📅
        </span>
      </div>
      {error ? <p style={styles.errorText}>{error}</p> : null}
    </div>
  );
};

// --- Main Component ---
export default function PatientOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    supportType: null,
    address: '', city: '', state: '', zip: '',
    deliveryLocation: '', deliveryUnknown: null, deliveryNotes: '',
    dob: '', babyDueDate: '',
    wantInsuranceCheck: null,
    insuranceProvider: '', otherInsurance: '', memberId: '',
    insuranceFront: null, insuranceBack: null,
    insuranceFrontBase64: null, insuranceBackBase64: null,
    selectedServices: [], doulaPreferences: '',
    rankedDoulas: [],
    otp: ''
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showMoreDoulas, setShowMoreDoulas] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // New state for partial saves
  const [isSaving, setIsSaving] = useState(false);
  
  const [showNotAFitMessage, setShowNotAFitMessage] = useState(false);
  const [showCoverageDetails, setShowCoverageDetails] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [salesforceAccountId, setSalesforceAccountId] = useState(null);
  const [dateErrors, setDateErrors] = useState({ dob: '', babyDueDate: '' });

  const totalSteps = 11; 

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const simulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStatus('verified'); // Force verified for demo
    }, 2500);
  };

  // ... (Ranking logic omitted for brevity, logic remains same)

  const handleNotAFit = () => {
    setShowNotAFitMessage(true);
    console.log("Triggering email to Care Coordinator: Patient dislikes options.");
  };

  const SF_ENDPOINT = 'https://findraya--uitpartial.sandbox.my.site.com/services/apexrest/PatientIntake/v1/';

  function parseDateParts(dateStr) {
    if (!dateStr) return null;
    if (!dateStr.includes('/')) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [mmStr, ddStr, yyyyStr] = parts.map((p) => p.trim());
    if (!mmStr || !ddStr || !yyyyStr) return null;
    if (yyyyStr.length !== 4) return null;
    const month = Number(mmStr);
    const day = Number(ddStr);
    const year = Number(yyyyStr);
    if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) return null;
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return { date, year, month, day };
  }

  function validateDob(dob) {
    if (!dob) return 'Date of birth is required';
    const parsed = parseDateParts(dob);
    if (!parsed) return 'Enter a valid date in MM/DD/YYYY format';
    const { date, year } = parsed;
    const today = new Date();
    if (year < 1900 || year > today.getFullYear()) return 'Enter a realistic birth year';
    if (date > today) return 'Birth date cannot be in the future';
    return '';
  }

  function validateRelevantDate(value) {
    if (!value) return 'This date is required';
    const parsed = parseDateParts(value);
    if (!parsed) return 'Enter a valid date in MM/DD/YYYY format';
    const { year } = parsed;
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) return 'Enter a realistic year';
    return '';
  }

  const formatDateForSF = (dateStr) => {
    const parsed = parseDateParts(dateStr);
    if (!parsed) return null;
    const { year, month, day } = parsed;
    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const saveProgress = async () => {
    setIsSaving(true);
    console.log("Attempting partial save...");
    
    // Prepare Payload
    const payload = {
      ...formData,
      dob: formatDateForSF(formData.dob),
      babyDueDate: formatDateForSF(formData.babyDueDate),
      selectedServices: formData.selectedServices,
      // Pass the ID if we have it. If null, Salesforce uses Email to deduplicate.
      accountId: salesforceAccountId,
    };

    try {
      const response = await fetch(SF_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Salesforce error (${response.status})`;
        try {
          const text = await response.text();
          if (text) {
            try {
              const body = JSON.parse(text);
              if (body && body.message) {
                errorMessage = body.message;
              } else {
                errorMessage = text;
              }
            } catch {
              errorMessage = text;
            }
          }
        } catch {
        }
        console.error("Salesforce saveProgress error", errorMessage);
        setIsSaving(false);
        return { error: true, message: errorMessage };
      }

      const data = await response.json().catch(() => null);
      console.log("Salesforce saveProgress response body", data);
      if (data && data.id) {
        setSalesforceAccountId(data.id);
        console.log("Partial save success. SF ID:", data.id);
        if (formData.insuranceFrontBase64 || formData.insuranceBackBase64) {
          setFormData(prev => ({
            ...prev,
            insuranceFrontBase64: null,
            insuranceBackBase64: null,
          }));
        }
      }
      setIsSaving(false);
      return data || { status: 'success' };
    } catch (error) {
      console.error("saveProgress error", error);
      setIsSaving(false);
      return { error: true, message: error instanceof Error ? error.message : 'Network error' };
    }
  };

  const handleSubmit = async () => {
    if (accountCreated) {
      window.location.href = 'https://care.findraya.com/';
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveProgress();

      if (!result || result.error) {
        setIsSubmitting(false);
        const msg = result && result.message
          ? result.message
          : "Something went wrong sending your information. Please try again.";
        alert(msg);
        return;
      }

      setAccountCreated(true);
      window.location.href = 'https://care.findraya.com/';
    } catch (error) {
      console.error("Submission error", error);
      setIsSubmitting(false);
      alert("Something went wrong sending your information. Please try again.");
    }
  };

  const isMediCal = () => {
    const provider = formData.insuranceProvider.toLowerCase();
    return provider.includes('medi-cal') || 
           provider === 'healthnet' || 
           provider === 'lacare' ||
           provider === 'blueshield-promise' ||
           provider === 'iehp' ||
           provider === 'ccah' ||
           provider === 'hpsj' ||
           provider === 'partnership' ||
           provider === 'calviva';
  };

  const getDateLabel = () => {
    switch (formData.supportType) {
      case 'birth': return "Baby's Due Date";
      case 'postpartum': return "Baby's Birth Date";
      case 'loss': return 'Date of Loss';
      case 'abortion': return 'Procedure Date';
      default: return 'Relevant Date';
    }
  };

  const isValidEmail = (email) => {
    if (!email) return false;
    const trimmed = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(trimmed);
  };

  const formatPhoneInput = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length < 4) return `(${digits}`;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const isValidPhone = (phone) => {
    if (!phone) return false;
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return regex.test(phone.trim());
  };

  const formatCityInput = (value) => {
    return value.replace(/[^a-zA-Z\s'-]/g, '');
  };

  const formatZipInput = (value) => {
    return value.replace(/\D/g, '').slice(0, 5);
  };

  // --- Subcomponents ---

  const ProgressBar = () => (
    <div style={styles.progressContainer}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${(step / (totalSteps - 1)) * 100}%` }} />
      </div>
      <span style={styles.progressText}>Step {step + 1} of {totalSteps}</span>
    </div>
  );

  const NavigationButtons = ({ canContinue = true, onNext, showBack = true, nextLabel = "Continue →", onBack, isLoading = false }) => (
    <div style={styles.navButtons}>
      {step > 0 && showBack && (
        <button
          style={styles.backButton}
          onClick={onBack || (() => setStep(s => s - 1))}
          disabled={isLoading}
        >
          ← Back
        </button>
      )}
      <button 
        style={{ ...styles.nextButton, opacity: canContinue ? 1 : 0.5 }}
        onClick={onNext || (() => setStep(s => s + 1))}
        disabled={!canContinue || isLoading}
      >
        {isLoading && (
          <span style={styles.buttonSpinner} />
        )}
        <span>{nextLabel}</span>
      </button>
    </div>
  );

  const InsuranceLogos = () => (
    <div style={styles.logoSection}>
      <p style={styles.logoLabel}>We accept major health plans including:</p>
      <div style={styles.logoGrid}>
        {featuredLogos.map((logo, idx) => (
          <div key={idx} style={styles.logoItem}>{logo}</div>
        ))}
      </div>
    </div>
  );

  const CoverageDropdown = () => {
    const isMediCalPlan = isMediCal();
    const coverage = isMediCalPlan ? coverageDetails['medi-cal'] : coverageDetails['default'];
    return (
      <div style={styles.coverageSection}>
         <button style={styles.coverageToggle} onClick={() => setShowCoverageDetails(!showCoverageDetails)}>
            <span>View typical coverage details</span>
            <span>{showCoverageDetails ? '▲' : '▼'}</span>
         </button>
         {showCoverageDetails && (
           <div style={styles.coverageDetails}>
              <h4 style={styles.coverageTitle}>{coverage.title}</h4>
              <p style={styles.coverageDesc}>{coverage.description}</p>
              <div style={styles.coverageList}>
                {coverage.visits.map((visit, idx) => (
                  <div key={idx} style={styles.coverageItem}>
                    <span style={styles.coverageCheck}>✓</span>
                    <div><span style={styles.coverageItemName}>{visit.name}</span><span style={styles.coverageItemDesc}>{visit.desc}</span></div>
                  </div>
                ))}
              </div>
              <p style={styles.coverageNote}>{coverage.note}</p>
           </div>
         )}
      </div>
    );
  };

  // --- Render Steps ---

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={styles.stepContent}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 48 }}>🌸</span>
            </div>
            <h2 style={{ ...styles.stepTitle, textAlign: 'center' }}>Welcome</h2>
            <p style={{ ...styles.stepSubtitle, textAlign: 'center' }}>Let's get you set up with personalized doula care and support.</p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name</label>
              <input style={styles.input} type="text" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} placeholder="Enter your first name" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input style={styles.input} type="text" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} placeholder="Enter your last name" />
            </div>
            <NavigationButtons canContinue={formData.firstName && formData.lastName} />
          </div>
        );

      case 1:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What type of support are you looking for?</h2>
            <p style={styles.stepSubtitle}>Doulas provide care for many different journeys.</p>
            <div style={styles.supportTypeCards}>
              {[
                { type: 'birth', icon: '👶', title: 'Birth Support', desc: 'Pregnancy, labor, delivery & postpartum care' },
                { type: 'postpartum', icon: '🤱', title: 'Postpartum Support', desc: 'Support after delivery, recovery & newborn care' },
                { type: 'loss', icon: '🤍', title: 'Pregnancy Loss', desc: 'Support for miscarriage or stillbirth' },
                { type: 'abortion', icon: '💜', title: 'Abortion Support', desc: 'Care before, during & after your procedure' },
              ].map(({ type, icon, title, desc }) => (
                <button key={type} style={{ ...styles.supportCard, ...(formData.supportType === type ? styles.supportCardActive : {}) }} onClick={() => { updateForm('supportType', type); setTimeout(() => setStep(2), 300); }}>
                  <span style={styles.supportIcon}>{icon}</span>
                  <div><span style={styles.supportTitle}>{title}</span><span style={styles.supportDesc}>{desc}</span></div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2: {
        // --- STEP 2: EMAIL & PHONE (Partial Save Trigger) ---
        const email = formData.email.trim();
        const phone = formData.phone.trim();
        const hasEmail = email.length > 0;
        const hasPhone = phone.length > 0;
        const emailOk = !hasEmail || isValidEmail(email);
        const phoneOk = !hasPhone || isValidPhone(phone);
        const hasAny = hasEmail || hasPhone;
        const canContinue = hasAny && emailOk && phoneOk;
        const showEmailError = hasEmail && !emailOk;
        const showPhoneError = hasPhone && !phoneOk;

        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>How can we reach you?</h2>
            <p style={styles.stepSubtitle}>We will send you access to the platform via email and text.</p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>✉️ Email Address</label>
              <input
                style={{ ...styles.input, ...(showEmailError ? styles.inputError : {}) }}
                type="email"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                placeholder="you@example.com"
              />
              {showEmailError && (
                <p style={styles.errorText}>Email address is invalid</p>
              )}
            </div>
            <div style={styles.andOrDivider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.andOrText}>AND/OR</span>
              <div style={styles.dividerLine}></div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>📱 Mobile Phone Number</label>
              <input
                style={{ ...styles.input, ...(showPhoneError ? styles.inputError : {}) }}
                type="tel"
                value={formData.phone}
                onChange={(e) => updateForm('phone', formatPhoneInput(e.target.value))}
                placeholder="(555) 123-4567"
              />
              <p style={styles.inputHint}>We'll text you appointment reminders and updates</p>
              {showPhoneError && (
                <p style={styles.errorText}>Phone number must be in format (xxx) xxx-xxxx</p>
              )}
            </div>
            {/* UPDATED NAVIGATION:
              1. Triggers saveProgress()
              2. Passes isLoading state to disable button while saving
            */}
            <NavigationButtons 
              canContinue={canContinue}
              isLoading={isSaving}
              onNext={async () => {
                const result = await saveProgress();
                
                if (!result || result.error) {
                  const msg = result && result.message
                    ? result.message
                    : "We could not save your info. Please try again.";
                  alert(msg);
                  return;
                }
                
                setStep(3);
              }}
            />
          </div>
        );
      }

      case 3:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Where are you located?</h2>
            <p style={styles.stepSubtitle}>We need this to verify your insurance coverage and find doulas in your area.</p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Street Address</label>
              <input style={styles.input} type="text" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Start typing to search your address..." />
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.inputGroup, flex: 2 }}>
                <label style={styles.label}>City</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateForm('city', formatCityInput(e.target.value))}
                  placeholder="City"
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>State</label>
                <select style={styles.select} value={formData.state} onChange={(e) => updateForm('state', e.target.value)}>
                  <option value="">Select</option>
                  <option value="CA">California</option>
                  <option value="AZ">Arizona</option>
                  <option value="NV">Nevada</option>
                  <option value="OR">Oregon</option>
                  <option value="WA">Washington</option>
                </select>
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>ZIP</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.zip}
                  onChange={(e) => updateForm('zip', formatZipInput(e.target.value))}
                  placeholder="Zip"
                  maxLength={5}
                />
              </div>
            </div>
            <NavigationButtons
              canContinue={formData.address && formData.city && formData.state && formData.zip}
              onNext={() => {
                setStep(4);
              }}
            />
          </div>
        );

      case 4:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Where do you plan to receive care?</h2>
            <p style={styles.stepSubtitle}>Hospital, birth center, or other</p>
            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>📍 Location</label>
                {formData.deliveryLocation && !formData.deliveryUnknown && (
                  <button
                    type="button"
                    style={styles.clearLink}
                    onClick={() => {
                      updateForm('deliveryLocation', '');
                      updateForm('deliveryNotes', '');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={styles.mapInputWrapper}>
                <input
                  style={{ ...styles.input, ...styles.mapInput, opacity: formData.deliveryUnknown ? 0.5 : 1 }}
                  type="text"
                  value={formData.deliveryLocation}
                  onChange={(e) => updateForm('deliveryLocation', e.target.value)}
                  placeholder="Search hospital or birth center..."
                  disabled={formData.deliveryUnknown}
                  list="hospitals"
                />
                <datalist id="hospitals">
                  <option value="Cedars-Sinai Medical Center, Los Angeles" />
                  <option value="UCLA Medical Center, Los Angeles" />
                  <option value="Kaiser Permanente Los Angeles Medical Center" />
                  <option value="Providence Saint John's Health Center, Santa Monica" />
                  <option value="Good Samaritan Hospital, Los Angeles" />
                  <option value="Huntington Hospital, Pasadena" />
                  <option value="Long Beach Memorial Medical Center" />
                  <option value="Hoag Hospital, Newport Beach" />
                  <option value="Sharp Mary Birch Hospital, San Diego" />
                  <option value="UCSD Medical Center, San Diego" />
                  <option value="Stanford Health Care, Palo Alto" />
                  <option value="UCSF Medical Center, San Francisco" />
                  <option value="Sutter Health CPMC, San Francisco" />
                  <option value="Kaiser Permanente San Francisco" />
                  <option value="John Muir Medical Center, Walnut Creek" />
                  <option value="Community Regional Medical Center, Fresno" />
                  <option value="UC Davis Medical Center, Sacramento" />
                  <option value="Loma Linda University Medical Center" />
                  <option value="Riverside Community Hospital" />
                  <option value="Kaiser Permanente Riverside" />
                  <option value="Birth Center (specify in notes)" />
                  <option value="Home Birth" />
                  <option value="Other (specify in notes)" />
                </datalist>
      </div>
      <p style={styles.inputHint}>Start typing to search hospitals and birth centers near you</p>
            </div>
            {formData.deliveryLocation && formData.deliveryLocation.toLowerCase().includes('specify in notes') && (
              <div style={{ ...styles.inputGroup, marginTop: 16 }}>
                <label style={styles.label}>Notes (optional)</label>
                <textarea
                  style={{ ...styles.input, minHeight: 80 }}
                  value={formData.deliveryNotes}
                  onChange={(e) => updateForm('deliveryNotes', e.target.value)}
                  placeholder="Add any details about your hospital, birth center, or other location"
                />
              </div>
            )}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.deliveryUnknown}
                onChange={(e) => {
                  updateForm('deliveryUnknown', e.target.checked);
                  if (e.target.checked) updateForm('deliveryLocation', '');
                }}
                style={styles.checkboxInput}
              />
              <span style={styles.checkboxCustom}>{formData.deliveryUnknown && '✓'}</span>
              <span style={styles.checkboxText}>I don't know yet</span>
            </label>
            <NavigationButtons
              canContinue={formData.deliveryLocation || formData.deliveryUnknown}
              onNext={() => {
                setStep(5);
              }}
            />
          </div>
        );

      case 5: {
        const dobError = dateErrors.dob;
        const babyDueDateError = dateErrors.babyDueDate;
        const canContinue = Boolean(formData.dob && formData.babyDueDate);

        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Tell us about you</h2>
            
            <DateInputWithPicker 
              label="👩🏻 Your Date of Birth"
              value={formData.dob}
              onChange={(val) => {
                updateForm('dob', val);
                if (dateErrors.dob) {
                  setDateErrors((prev) => ({ ...prev, dob: '' }));
                }
              }}
              error={dobError}
            />

            <DateInputWithPicker 
              label={`👶🏻 ${getDateLabel()}`}
              value={formData.babyDueDate}
              onChange={(val) => {
                updateForm('babyDueDate', val);
                if (dateErrors.babyDueDate) {
                  setDateErrors((prev) => ({ ...prev, babyDueDate: '' }));
                }
              }}
              error={babyDueDateError}
            />

            <NavigationButtons
              canContinue={canContinue}
              onNext={() => {
                const dobValidation = validateDob(formData.dob);
                const babyDateValidation = validateRelevantDate(formData.babyDueDate);
                if (dobValidation || babyDateValidation) {
                  setDateErrors({
                    dob: dobValidation,
                    babyDueDate: babyDateValidation,
                  });
                  return;
                }
                setStep(6);
              }}
            />
          </div>
        );
      }

      case 6:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Would you like us to check if your insurance covers the doula benefit?</h2>
            <p style={styles.stepSubtitle}>Many insurance plans, including Medi-Cal, cover doula services at no cost to you.</p>
            <div style={styles.optionCards}>
              <button style={{ ...styles.optionCard, ...(formData.wantInsuranceCheck === true ? styles.optionCardActive : {}) }} onClick={() => updateForm('wantInsuranceCheck', true)}>
                <span style={styles.optionEmoji}>✓</span><span style={styles.optionText}>Yes, check my coverage</span>
              </button>
              <button style={{ ...styles.optionCard, ...(formData.wantInsuranceCheck === false ? styles.optionCardActive : {}) }} onClick={() => updateForm('wantInsuranceCheck', false)}>
                <span style={styles.optionEmoji}>→</span><span style={styles.optionText}>No, I'll self-pay</span>
              </button>
            </div>
            <NavigationButtons
              canContinue={formData.wantInsuranceCheck !== null}
              onNext={() => {
                setStep(formData.wantInsuranceCheck ? 7 : 10);
              }}
            />
          </div>
        );

      case 7:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Please add your Health Insurance Details Below</h2>
            <p style={styles.stepSubtitle}>This step is optional, but helps us verify your coverage faster.</p>
            <InsuranceLogos />
            <div style={styles.inputGroup}>
              <label style={styles.label}>Insurance Provider</label>
              <select 
                style={styles.select} 
                value={formData.insuranceProvider} 
                onChange={(e) => {
                  const value = e.target.value;
                  updateForm('insuranceProvider', value);
                  if (value) {
                    setShowCoverageDetails(true);
                  }
                }}
              >
                <option value="">Select your provider</option>
                {insuranceProviders.map(provider => (
                  <option key={provider.value} value={provider.value}>{provider.label} {provider.type ? `(${provider.type})` : ''}</option>
                ))}
              </select>
            </div>
            {formData.insuranceProvider === 'other' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Please specify your insurance</label>
                <input style={styles.input} type="text" value={formData.otherInsurance} onChange={(e) => updateForm('otherInsurance', e.target.value)} placeholder="Enter your insurance provider name" />
              </div>
            )}
            
            {formData.insuranceProvider && <CoverageDropdown />}

            <NavigationButtons
              canContinue={true}
              onNext={() => {
                setStep(8);
              }}
            />
            <button style={styles.skipLink} onClick={() => setStep(10)}>Skip this step →</button>
          </div>
        );

      case 8: // Upload & Verification
        const isMandatory = formData.wantInsuranceCheck === true;
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Insurance Verification</h2>
            <p style={styles.stepSubtitle}>Please provide your Member ID or upload the front of your insurance card.</p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Member ID</label>
              <input style={styles.input} type="text" value={formData.memberId} onChange={(e) => updateForm('memberId', e.target.value)} placeholder="Enter your member ID" />
            </div>
            <div style={styles.andOrDivider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.andOrText}>OR</span>
              <div style={styles.dividerLine}></div>
            </div>
            <div style={styles.uploadArea}>
              <div style={styles.uploadBox}>
                <input type="file" accept="image/*" id="front-upload" style={{ display: 'none' }} 
                  onChange={async (e) => {
                     if(e.target.files?.[0]) {
                       updateForm('insuranceFront', e.target.files[0].name);
                       updateForm('insuranceFrontBase64', await convertToBase64(e.target.files[0]));
                     }
                  }} 
                />
                <label htmlFor="front-upload" style={styles.uploadLabel}>
                  <span style={styles.uploadIcon}>{formData.insuranceFront ? '✓' : '📄'}</span>
                  <span>{formData.insuranceFront || 'Front of Card'}</span>
                  <span style={styles.uploadHint}>Click to upload</span>
                </label>
              </div>
              <div style={styles.uploadBox}>
                <input type="file" accept="image/*" id="back-upload" style={{ display: 'none' }} 
                   onChange={async (e) => {
                     if(e.target.files?.[0]) {
                       updateForm('insuranceBack', e.target.files[0].name);
                       updateForm('insuranceBackBase64', await convertToBase64(e.target.files[0]));
                     }
                  }} 
                />
                <label htmlFor="back-upload" style={styles.uploadLabel}>
                  <span style={styles.uploadIcon}>{formData.insuranceBack ? '✓' : '📄'}</span>
                  <span>{formData.insuranceBack || 'Back of Card (optional)'}</span>
                  <span style={styles.uploadHint}>Click to upload</span>
                </label>
              </div>
            </div>
            <NavigationButtons 
              canContinue={!isMandatory || (formData.memberId || formData.insuranceFront)} 
              onNext={async () => {
                setStep(9);
                simulateVerification();
              }} 
            />
          </div>
        );

      case 9:
        if (isVerifying) {
          return (
            <div style={styles.stepContent}>
              <div style={styles.verifyingBox}>
                <div style={styles.spinner}></div>
                <h2 style={styles.stepTitle}>Verifying Your Benefit...</h2>
                <p style={styles.verifyingText}>We're checking your coverage for doula services.</p>
              </div>
            </div>
          );
        }
        if (verificationStatus === 'verified') {
          return (
            <div style={styles.stepContent}>
              <div style={styles.successBox}>
                <span style={styles.successIcon}>🎉</span>
                <h2 style={styles.stepTitle}>Congratulations!</h2>
                <p style={styles.successText}>You're covered for the doula benefit!</p>
                <div style={styles.benefitsList}>
                  <h4 style={styles.benefitsTitle}>This is what you get:</h4>
                  <div style={styles.benefitsGrid}>
                    <div style={styles.benefitItem}><span style={styles.benefitCheck}>✓</span><div><span style={styles.benefitName}>One initial visit</span><span style={styles.benefitDesc}>90 minutes</span></div></div>
                    <div style={styles.benefitItem}><span style={styles.benefitCheck}>✓</span><div><span style={styles.benefitName}>8 additional visits</span><span style={styles.benefitDesc}>Prenatal and postpartum visits</span></div></div>
                    <div style={styles.benefitItem}><span style={styles.benefitCheck}>✓</span><div><span style={styles.benefitName}>Support during labor and delivery</span><span style={styles.benefitDesc}>Including stillbirth, abortion, or miscarriage</span></div></div>
                    <div style={styles.benefitItem}><span style={styles.benefitCheck}>✓</span><div><span style={styles.benefitName}>Up to 2 extended postpartum visits</span><span style={styles.benefitDesc}>3 Hour visits after delivery</span></div></div>
                    {isMediCal() && (
                      <div style={styles.benefitItem}><span style={styles.benefitCheck}>✓</span><div><span style={styles.benefitName}>9 additional postpartum visits</span><span style={styles.benefitDesc}>Medi-Cal exclusive benefit</span></div></div>
                    )}
                  </div>
                </div>
              </div>
              <NavigationButtons
                onNext={() => {
                  setStep(10);
                }}
              />
            </div>
          );
        }
        return null;

      case 10: {
        const currentServices = services[formData.supportType || 'birth'];

        const handleBackFromServices = () => {
          if (formData.wantInsuranceCheck === false) {
            setStep(6);
          } else if (verificationStatus === 'verified') {
            setStep(9);
          } else {
            setStep(7);
          }
        };

        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What services are you interested in?</h2>
            <p style={styles.stepSubtitle}>Select all that apply</p>
            <div style={styles.checkboxGrid}>
              {currentServices.map(service => (
                <button key={service} style={{ ...styles.checkboxButton, ...(formData.selectedServices.includes(service) ? styles.checkboxActive : {}) }} onClick={() => toggleService(service)}>
                  <span style={styles.checkbox}>{formData.selectedServices.includes(service) ? '✓' : ''}</span>
                  {service}
                </button>
              ))}
            </div>
            <div style={{ ...styles.inputGroup, marginTop: 24 }}>
              <label style={styles.label}>What are you looking for in a doula?</label>
              <textarea style={{ ...styles.input, minHeight: 100 }} value={formData.doulaPreferences} onChange={(e) => updateForm('doulaPreferences', e.target.value)} placeholder="Tell us what's important to you..." />
            </div>
            <NavigationButtons 
              canContinue={formData.selectedServices.length > 0} 
              onNext={handleSubmit}
              nextLabel="Continue to Care Portal →"
              onBack={handleBackFromServices}
              isLoading={isSubmitting} // Use submitting state here
            />
          </div>
        );
      }
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/general-sans');
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <header style={styles.header}>
        <div style={styles.logo}>
          <img
            src="/raya-logo-black.png"
            alt="Raya Health"
            style={styles.logoImage}
          />
        </div>
      </header>
      <main style={styles.main}>
        {step < totalSteps && <ProgressBar />}
        <div style={styles.card}>{renderStep()}</div>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(180deg, #E8EFE6 0%, #C5D9BE 50%, #9EC981 100%)', fontFamily: '"General Sans", -apple-system, sans-serif' },
  header: { padding: '20px 32px', borderBottom: '1px solid rgba(0,0,0,0.08)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoImage: { height: 32, filter: 'invert(1)' },
  main: { maxWidth: 640, margin: '0 auto', padding: '32px 24px' },
  progressContainer: { marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 },
  progressTrack: { flex: 1, height: 6, background: 'rgba(45,58,45,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #4A5D4A, #2D3A2D)', borderRadius: 3, transition: 'width 0.4s ease' },
  progressText: { fontSize: 13, color: '#5A6B5A', whiteSpace: 'nowrap' },
  card: { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: 40, boxShadow: '0 4px 24px rgba(45,58,45,0.08)', animation: 'fadeIn 0.4s ease', position: 'relative' },
  stepContent: { animation: 'fadeIn 0.3s ease' },
  stepTitle: { fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#2D3A2D', marginBottom: 8, marginTop: 0 },
  stepSubtitle: { fontSize: 15, color: '#5A6B5A', marginBottom: 28, lineHeight: 1.5 },
  inputGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#3D4D3D', marginBottom: 8 },
  input: { width: '100%', padding: '14px 16px', fontSize: 16, border: '1px solid #C5D4C2', borderRadius: 8, background: '#FFFFFF', color: '#2D3A2D', outline: 'none', boxSizing: 'border-box' },
  inputError: { borderColor: '#D93025' },
  errorText: { fontSize: 12, color: '#D93025', marginTop: 4 },
  inputHint: { fontSize: 12, color: '#5A6B5A', marginTop: 6 },
  mapInputWrapper: { position: 'relative' },
  mapInput: { paddingLeft: 16 },
  select: { width: '100%', padding: '14px 16px', fontSize: 16, border: '1px solid #C5D4C2', borderRadius: 8, background: '#FFFFFF', color: '#2D3A2D', cursor: 'pointer' },
  row: { display: 'flex', gap: 12 },
  dateInputRow: { display: 'flex', alignItems: 'center', gap: 8 },
  dateInput: { flex: 1, padding: '14px 12px', fontSize: 16, border: '1px solid #C5D4C2', borderRadius: 8, background: '#FFFFFF', color: '#2D3A2D', textAlign: 'center' },
  dateSeparator: { fontSize: 20, color: '#5A6B5A' },
  dateFieldWrapper: { position: 'relative' },
  dateIcon: { position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 8, border: '1px solid #E8DDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#D4A59A', background: '#FFFFFF', pointerEvents: 'none' },
  supportTypeCards: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  supportCard: { padding: 20, border: '1px solid #C5D4C2', borderRadius: 12, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' },
  supportCardActive: { borderColor: '#4A5D4A', background: 'rgba(74,93,74,0.08)', boxShadow: '0 0 0 1px #4A5D4A' },
  supportIcon: { fontSize: 32, flexShrink: 0 },
  supportTitle: { fontSize: 16, fontWeight: 600, color: '#2D3A2D', display: 'block' },
  supportDesc: { fontSize: 13, color: '#5A6B5A', display: 'block', marginTop: 4 },
  optionCards: { display: 'flex', gap: 16, marginBottom: 24 },
  optionCard: { flex: 1, padding: 24, border: '1px solid #C5D4C2', borderRadius: 12, background: '#FFFFFF', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  optionCardActive: { borderColor: '#4A5D4A', background: 'rgba(74,93,74,0.08)', boxShadow: '0 0 0 1px #4A5D4A' },
  optionEmoji: { fontSize: 28 },
  optionText: { fontSize: 15, fontWeight: 500, color: '#2D3A2D' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginTop: 16 },
  checkboxInput: { display: 'none' },
  checkboxCustom: { width: 24, height: 24, borderRadius: 6, border: '2px solid #4A5D4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#4A5D4A', background: '#FFFFFF' },
  checkboxText: { fontSize: 15, color: '#2D3A2D' },
  navButtons: { display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 16 },
  backButton: { padding: '14px 28px', fontSize: 15, fontWeight: 600, border: '1px solid #C5D4C2', borderRadius: 8, background: 'transparent', color: '#3D4D3D', cursor: 'pointer' },
  nextButton: { padding: '14px 32px', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2D3A2D', color: '#FFFFFF', cursor: 'pointer', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 },
  submitButton: { width: '100%', padding: '16px 32px', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2D3A2D', color: '#FFFFFF', cursor: 'pointer' },
  buttonSpinner: { width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#FFFFFF', animation: 'spin 0.8s linear infinite' },
  logoSection: { marginBottom: 24, padding: 16, background: 'rgba(74,93,74,0.06)', borderRadius: 12 },
  logoLabel: { fontSize: 13, color: '#3D4D3D', marginBottom: 12, textAlign: 'center' },
  logoGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  logoItem: { padding: '8px 14px', background: '#FFFFFF', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#3D4D3D', border: '1px solid #C5D4C2' },
  uploadArea: { display: 'flex', gap: 16 },
  uploadBox: { flex: 1 },
  uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32, border: '2px dashed #4A5D4A', borderRadius: 12, background: 'rgba(74,93,74,0.04)', cursor: 'pointer', textAlign: 'center' },
  uploadIcon: { fontSize: 36 },
  uploadHint: { fontSize: 12, color: '#5A6B5A' },
  coverageToggle: { width: '100%', padding: '12px 16px', border: '1px solid #C5D4C2', borderRadius: 8, background: '#FFFFFF', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#3D4D3D' },
  coverageDetails: { marginTop: 12, padding: 20, background: 'rgba(74,93,74,0.06)', borderRadius: 12 },
  coverageTitle: { fontSize: 15, fontWeight: 600, color: '#2D3A2D', marginTop: 0, marginBottom: 8 },
  coverageDesc: { fontSize: 13, color: '#5A6B5A', marginBottom: 16 },
  coverageList: { display: 'flex', flexDirection: 'column', gap: 12 },
  coverageItem: { display: 'flex', gap: 10 },
  coverageCheck: { color: '#4A5D4A', fontWeight: 700, flexShrink: 0 },
  coverageItemName: { display: 'block', fontSize: 14, fontWeight: 600, color: '#2D3A2D' },
  coverageItemDesc: { display: 'block', fontSize: 13, color: '#5A6B5A' },
  coverageNote: { fontSize: 12, color: '#5A6B5A', marginTop: 16, marginBottom: 0, fontStyle: 'italic' },
  skipLink: { display: 'block', margin: '16px auto 0', padding: '10px 20px', border: 'none', background: 'transparent', color: '#5A6B5A', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  checkboxButton: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid #C5D4C2', borderRadius: 8, background: '#FFFFFF', cursor: 'pointer', fontSize: 14, color: '#2D3A2D', textAlign: 'left' },
  checkboxActive: { borderColor: '#4A5D4A', background: 'rgba(74,93,74,0.08)' },
  checkbox: { width: 22, height: 22, borderRadius: 6, border: '2px solid #4A5D4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#4A5D4A' },
  verifyingBox: { textAlign: 'center', padding: '32px 0' },
  spinner: { width: 56, height: 56, border: '4px solid #C5D4C2', borderTopColor: '#4A5D4A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' },
  verifyingText: { fontSize: 15, color: '#5A6B5A', marginBottom: 24 },
  successBox: { textAlign: 'center', padding: '24px 0' },
  successIcon: { fontSize: 56, display: 'block', marginBottom: 16 },
  successText: { fontSize: 18, color: '#2D3A2D', marginBottom: 24 },
  benefitsList: { background: 'rgba(74,93,74,0.08)', borderRadius: 12, padding: 24, textAlign: 'left' },
  benefitsTitle: { fontSize: 14, fontWeight: 600, color: '#3D4D3D', marginBottom: 16, marginTop: 0 },
  benefitsGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  benefitItem: { display: 'flex', gap: 12 },
  benefitCheck: { color: '#4A5D4A', fontWeight: 700, flexShrink: 0 },
  benefitName: { display: 'block', fontSize: 14, fontWeight: 600, color: '#2D3A2D' },
  benefitDesc: { display: 'block', fontSize: 13, color: '#5A6B5A' },
  andOrDivider: { display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0 20px 0' },
  andOrText: { fontSize: 18, fontWeight: 700, color: '#3D4D3D', whiteSpace: 'nowrap' },
  dividerLine: { flex: 1, height: 1, background: '#C5D4C2' },
  primaryButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '18px 24px', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 8, background: '#2D3A2D', color: '#FFFFFF', cursor: 'pointer', width: '100%' },
  doulaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  doulaCard: { padding: 20, border: '1px solid #C5D4C2', borderRadius: 12, background: '#FFFFFF', cursor: 'pointer', textAlign: 'center', position: 'relative' },
  doulaCardSelected: { borderColor: '#4A5D4A', background: 'rgba(74,93,74,0.08)', boxShadow: '0 0 0 1px #4A5D4A' },
  rankBadge: { position: 'absolute', top: -10, right: -10, width: 28, height: 28, background: '#2D3A2D', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 },
  doulaPhoto: { fontSize: 40, display: 'block', marginBottom: 12 },
  doulaName: { fontSize: 15, fontWeight: 600, color: '#2D3A2D', marginBottom: 8, marginTop: 0 },
  doulaDetail: { fontSize: 12, color: '#5A6B5A', margin: '4px 0' },
  showMoreButton: { display: 'block', margin: '16px auto 0', padding: '10px 20px', border: 'none', background: 'transparent', color: '#4A5D4A', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  notAFitButton: { display: 'block', margin: '16px auto 0', padding: '10px 20px', border: '1px solid #C5D4C2', borderRadius: 8, background: 'transparent', color: '#5A6B5A', fontSize: 13, cursor: 'pointer' },
  notAFitMessage: { marginTop: 20, padding: 20, background: 'rgba(74,93,74,0.08)', borderRadius: 12, textAlign: 'center' },
  rankingItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#FFFFFF', border: '1px solid #C5D4C2', borderRadius: 8, marginBottom: 8 },
  rankNumber: { width: 28, height: 28, background: '#4A5D4A', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 },
  rankButton: { width: 28, height: 28, border: '1px solid #C5D4C2', borderRadius: 6, background: '#FFFFFF', cursor: 'pointer', fontSize: 12 },
  iframeContainer: { marginBottom: 24 },
  overlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(45, 58, 45, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: 20 },
  clearLink: { fontSize: 12, color: '#4A5D4A', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
};
