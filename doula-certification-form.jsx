import React, { useState, useRef } from "react";

// --- Salesforce Configuration ---
const SF_ENDPOINT = 'https://findraya--uitpartial.sandbox.my.site.com/services/apexrest/DoulaIntake/v1/';

// --- Data Constants ---
const pronounOptions = ["she/her/hers", "he/him/his", "they/them", "Other"];

const additionalCertOptions = [
  "Lactation Counselor/Consultant",
  "Childbirth Educator",
  "Postpartum Care Specialist",
  "Infant Massage",
  "Placenta Encapsulation",
  "Other",
];

const careTypesOptions = [
  "In Person Labor / Birth",
  "Virtual Labor / Birth",
  "Postpartum",
  "Prenatal/Antepartum",
  "Miscarriage",
  "Abortion",
  "IVF Support",
  "Other",
];

const insuranceOrganizations = [
  "Medi-Cal",
  "Kaiser Permanente",
  "Anthem Blue Cross",
  "Blue Shield of California",
  "Health Net",
  "Molina Healthcare",
  "L.A. Care Health Plan",
  "Inland Empire Health Plan",
  "Other",
];

const engagementOptions = [
  "In person",
  "At their residence",
  "Virtually",
  "At the hospital",
];

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const referralSources = [
  "Word of mouth",
  "Social media",
  "Raya website",
  "Community event",
  "Healthcare provider referral",
  "Other",
];

// --- Utility Functions ---
const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const text = typeof result === "string" ? result : "";
      const base64 = text.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });

// --- Sub-Components ---
const DateInputWithPicker = ({ label, value, onChange, error }) => {
  const pickerRef = useRef(null);

  const handleTextChange = (e) => {
    let text = e.target.value;
    text = text.replace(/[^0-9/]/g, "");
    if (text.length === 2 && value.length === 1) text += "/";
    if (text.length === 5 && value.length === 4) text += "/";
    if (text.length <= 10) onChange(text);
  };

  const handlePickerChange = (e) => {
    const dateVal = e.target.value;
    if (dateVal) {
      const [year, month, day] = dateVal.split("-");
      onChange(`${month}/${day}/${year}`);
    }
  };

  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.dateFieldWrapper}>
        <input
          style={{
            ...styles.input,
            paddingRight: 52,
            ...(error ? styles.inputError : {}),
          }}
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="mm/dd/yyyy"
          maxLength={10}
        />
        <input
          type="date"
          ref={pickerRef}
          onChange={handlePickerChange}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 40,
            height: "100%",
            opacity: 0,
            zIndex: 0,
          }}
          tabIndex={-1}
        />
        <span
          style={{
            ...styles.dateIcon,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
          onClick={() => {
            try {
              pickerRef.current.showPicker();
            } catch {
              pickerRef.current.focus();
            }
          }}
        >
          📅
        </span>
      </div>
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
};

const NavigationButtons = ({
  canContinue = true,
  onNext,
  showBack = true,
  nextLabel = "Continue →",
  onBack,
  isLoading = false,
  step,
  setStep,
}) => (
  <div style={styles.navButtons}>
    {step > 0 && showBack && (
      <button
        style={styles.backButton}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (onBack) {
            onBack();
          } else {
            setStep((s) => s - 1);
          }
        }}
        disabled={isLoading}
      >
        ← Back
      </button>
    )}
    <button
      style={{ ...styles.nextButton, opacity: canContinue ? 1 : 0.5 }}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (onNext) {
          onNext();
        } else {
          setStep((s) => s + 1);
        }
      }}
      disabled={!canContinue || isLoading}
    >
      {isLoading && <span style={styles.buttonSpinner} />}
      <span>{nextLabel}</span>
    </button>
  </div>
);

const ProgressBar = ({ step, totalSteps }) => (
  <div style={styles.progressContainer}>
    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          width: `${(step / (totalSteps - 1)) * 100}%`,
        }}
      />
    </div>
    <span style={styles.progressText}>
      Step {step + 1} of {totalSteps}
    </span>
  </div>
);

const FileUploadBox = ({
  id,
  label,
  fileName,
  onFileSelect,
  accept = "*/*",
  hint,
}) => (
  <div style={{ flex: 1 }}>
    <input
      type="file"
      accept={accept}
      id={id}
      style={{ display: "none" }}
      onChange={(e) => {
        if (e.target.files?.[0]) {
          onFileSelect(e.target.files[0]);
        }
      }}
    />
    <label htmlFor={id} style={styles.uploadLabel}>
      <span style={styles.uploadIcon}>{fileName ? "✓" : "📄"}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#2D3A2D" }}>
        {fileName || label}
      </span>
      <span style={styles.uploadHint}>{hint || "Click to upload"}</span>
    </label>
  </div>
);

// --- Main Component ---
export default function DoulaCertificationForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pronouns: [],
    pronounsOther: "",
    dob: "",
    websiteOrInstagram: "",
    citiesServed: "",
    ethnicity: "",
    yearsExperience: "",
    certifications: "",
    certificationFile: null,
    certificationFileBase64: null,
    additionalCerts: [],
    additionalCertsOther: "",
    additionalCertFiles: [], // Array of {file, base64} for multiple file uploads
    specialties: "",
    cprCertified: null,
    cprFile: null,
    cprFileBase64: null,
    hipaaTrained: null,
    hipaaFile: null,
    hipaaFileBase64: null,
    npiNumber: "",
    insuranceFiles: [], // Changed to array for multiple insurance files
    inNetworkOrgs: [],
    inNetworkOrgsOther: "",
    mediCalApprovalFile: null,
    mediCalApprovalFileBase64: null,
    wantMediCalAssistance: null,
    familiesSupported: "",
    careTypes: [], // In Person Labor/Birth, Virtual Labor/Birth, Postpartum, etc.
    careTypesOther: "", // NEW: For "Other" option
    languages: "",
    engagementPreferences: [], // Changed to array for multiple options
    inPersonLaborSupport: null, // NEW: Yes/No for in-person labor support
    bio: "",
    philosophy: "",
    availableMonths: [], // NEW: Array of months
    headshotFile: null,
    headshotFileBase64: null,
    vaccinationComfort: "",
    vaccinationEncouragement: "", // NEW: For "Encouraging vaccinations" question
    vaccinationComfortOther: "", // NEW: For "Other" option
    referralSource: "",
    referralSourceOther: "",
    finalComments: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 7;

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const formatPhoneInput = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length < 4) return `(${digits}`;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (!formData.firstName.trim())
          newErrors.firstName = "First name is required";
        if (!formData.lastName.trim())
          newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!isValidEmail(formData.email))
          newErrors.email = "Please enter a valid email";
        if (!formData.phone.trim())
          newErrors.phone = "Phone number is required";
        break;
      case 1:
        if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
        if (!formData.citiesServed.trim())
          newErrors.citiesServed = "Please enter cities/counties served";
        break;
      case 2:
        if (!formData.yearsExperience.trim())
          newErrors.yearsExperience = "Years of experience is required";
        if (!formData.certifications.trim())
          newErrors.certifications = "Please describe your certifications";
        break;
      case 3:
        if (!formData.specialties.trim())
          newErrors.specialties = "Please list your specialties";
        if (formData.cprCertified === null)
          newErrors.cprCertified = "Please select an option";
        if (formData.hipaaTrained === null)
          newErrors.hipaaTrained = "Please select an option";
        break;
      case 4:
        if (formData.npiNumber && !/^\d{10}$/.test(formData.npiNumber.trim())) {
           newErrors.npiNumber = "NPI must be exactly 10 digits";
        }
        break;
      case 5:
        if (!formData.bio.trim()) newErrors.bio = "Please provide a short bio";
        if (formData.careTypes.length === 0)
          newErrors.careTypes = "Please select at least one care type";
        if (formData.engagementPreferences.length === 0)
          newErrors.engagementPreferences = "Please select at least one preference";
        if (formData.availableMonths.length === 0)
          newErrors.availableMonths = "Please select at least one month";
        break;
      case 6:
        if (!formData.vaccinationEncouragement)
          newErrors.vaccinationEncouragement = "Please select an option";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    
    try {
      // Helper function to create file data object for Salesforce
      const createFileData = (file, base64Data) => {
        if (!file || !base64Data) return null;
        return {
          fileName: file.name,
          base64Data: base64Data,
          contentType: file.type || 'application/octet-stream'
        };
      };

      // Prepare payload for Salesforce with file data as objects
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        pronouns: formData.pronouns,
        pronounsOther: formData.pronounsOther,
        dob: formData.dob,
        websiteOrInstagram: formData.websiteOrInstagram,
        citiesServed: formData.citiesServed,
        ethnicity: formData.ethnicity,
        yearsExperience: formData.yearsExperience,
        certifications: formData.certifications,
        certificationFile: createFileData(formData.certificationFile, formData.certificationFileBase64),
        additionalCerts: formData.additionalCerts,
        additionalCertsOther: formData.additionalCertsOther,
        // Map multiple additional cert files
        additionalCertFiles: formData.additionalCertFiles.map(item => 
          createFileData(item.file, item.base64)
        ).filter(f => f !== null),
        specialties: formData.specialties,
        cprCertified: formData.cprCertified === "yes", // ensures boolean
        cprFile: createFileData(formData.cprFile, formData.cprFileBase64),
        hipaaTrained: formData.hipaaTrained === "yes", // ensures boolean
        hipaaFile: createFileData(formData.hipaaFile, formData.hipaaFileBase64),
        npiNumber: formData.npiNumber,
        // Map multiple insurance files
        insuranceFiles: formData.insuranceFiles.map(item => 
          createFileData(item.file, item.base64)
        ).filter(f => f !== null),
        inNetworkOrgs: formData.inNetworkOrgs,
        inNetworkOrgsOther: formData.inNetworkOrgsOther,
        mediCalApprovalFile: createFileData(formData.mediCalApprovalFile, formData.mediCalApprovalFileBase64),
        wantMediCalAssistance: formData.wantMediCalAssistance,
        familiesSupported: formData.familiesSupported,
        careTypes: formData.careTypes,
        careTypesOther: formData.careTypesOther,
        languages: formData.languages,
        engagementPreferences: formData.engagementPreferences,
        inPersonLaborSupport: formData.inPersonLaborSupport === true, // ensures boolean
        bio: formData.bio,
        philosophy: formData.philosophy,
        availableMonths: formData.availableMonths,
        headshotFile: createFileData(formData.headshotFile, formData.headshotFileBase64),
        vaccinationComfort: formData.vaccinationEncouragement, // Fixed mismatch
        vaccinationComfortOther: formData.vaccinationEncouragementOther, // Fixed mismatch
        referralSource: formData.referralSource,
        referralSourceOther: formData.referralSourceOther,
        finalComments: [
          formData.finalComments,
          formData.cprCertified === "in_process" ? "CPR Certification: In Process" : "",
          formData.hipaaTrained === "in_process" ? "HIPAA Training: In Process" : ""
        ].filter(Boolean).join("\n"),
      };

      console.log('Submitting to Salesforce:', payload);

      const response = await fetch(SF_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Salesforce error (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Response not JSON
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Salesforce submission successful:', result);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Salesforce submission error:', error);
      setIsSubmitting(false);
      alert(error.message || 'Something went wrong. Please try again.');
    }
  };

  const renderStep = () => {
    if (isSubmitted) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <span style={{ fontSize: 56, display: "block", marginBottom: 24 }}>
            🎉
          </span>
          <h2 style={styles.stepTitle}>Thank You!</h2>
          <p style={styles.stepSubtitle}>
            Your certification form has been submitted successfully. Our team
            will review your qualifications and get back to you within 3-5
            business days.
          </p>
          <div
            style={{
              background: "rgba(74,93,74,0.1)",
              borderRadius: 12,
              padding: 24,
              textAlign: "left",
              marginTop: 24,
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#2D3A2D",
                marginBottom: 16,
                marginTop: 0,
              }}
            >
              What's Next?
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "We'll verify your certifications and credentials",
                "You'll receive an email with next steps",
                "Schedule an onboarding call with our team",
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 14,
                    color: "#5A6B5A",
                  }}
                >
                  <span style={{ color: "#4A5D4A", fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div style={styles.stepContent}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span
                style={{ fontSize: 48, display: "block", marginBottom: 16 }}
              >
                
              </span>
              <h2 style={{ ...styles.stepTitle, textAlign: "center" }}>
                Doula Intake Form
              </h2>
              <p style={{ ...styles.stepSubtitle, textAlign: "center" }}>
                Please complete this form to provide your qualifications.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={styles.label}>First Name *</label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.firstName ? styles.inputError : {}),
                  }}
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p style={styles.errorText}>{errors.firstName}</p>
                )}
              </div>
              <div>
                <label style={styles.label}>Last Name *</label>
                <input
                  style={{
                    ...styles.input,
                    ...(errors.lastName ? styles.inputError : {}),
                  }}
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p style={styles.errorText}>{errors.lastName}</p>
                )}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {}),
                }}
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.phone ? styles.inputError : {}),
                }}
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  updateForm("phone", formatPhoneInput(e.target.value))
                }
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p style={styles.errorText}>{errors.phone}</p>}
            </div>

            <NavigationButtons
              canContinue={
                !!(
                  formData.firstName &&
                  formData.lastName &&
                  formData.email &&
                  formData.phone
                )
              }
              onNext={handleNext}
              step={step}
              setStep={setStep}
              showBack={false}
            />
          </div>
        );

      case 1:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Personal Details</h2>
            <p style={styles.stepSubtitle}>
              Tell us a bit more about yourself.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Preferred Pronouns</label>
              <div style={styles.checkboxGrid}>
                {pronounOptions.map((pronoun) => (
                  <button
                    key={pronoun}
                    type="button"
                    onClick={() => toggleArrayItem("pronouns", pronoun)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.pronouns.includes(pronoun)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.pronouns.includes(pronoun)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.pronouns.includes(pronoun) && "✓"}
                    </span>
                    {pronoun}
                  </button>
                ))}
              </div>
              {formData.pronouns.includes("Other") && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.pronounsOther}
                  onChange={(e) => updateForm("pronounsOther", e.target.value)}
                  placeholder="Please specify your pronouns"
                />
              )}
            </div>

            <DateInputWithPicker
              label="Date of Birth *"
              value={formData.dob}
              onChange={(val) => updateForm("dob", val)}
              error={errors.dob}
            />

            <div style={styles.inputGroup}>
              <label style={styles.label}>Website or Instagram Profile</label>
              <input
                style={styles.input}
                type="text"
                value={formData.websiteOrInstagram}
                onChange={(e) =>
                  updateForm("websiteOrInstagram", e.target.value)
                }
                placeholder="https://... or @handle"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>What is your ethnicity?</label>
              <input
                style={styles.input}
                type="text"
                value={formData.ethnicity}
                onChange={(e) => updateForm("ethnicity", e.target.value)}
                placeholder="Optional - helps match you to patients"
              />
              <p style={styles.inputHint}>
                We ask only to help match you to patients per their preferences.
              </p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Cities/Counties Served *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.citiesServed ? styles.inputError : {}),
                }}
                type="text"
                value={formData.citiesServed}
                onChange={(e) => updateForm("citiesServed", e.target.value)}
                placeholder="e.g., Los Angeles County, Orange County"
              />
              {errors.citiesServed && (
                <p style={styles.errorText}>{errors.citiesServed}</p>
              )}
            </div>

            <NavigationButtons
              canContinue
              onNext={handleNext}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      case 2:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Professional Qualifications</h2>
            <p style={styles.stepSubtitle}>
              Share your training and experience.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Years of Experience *</label>
              <input
                style={{
                  ...styles.input,
                  ...(errors.yearsExperience ? styles.inputError : {}),
                }}
                type="text"
                value={formData.yearsExperience}
                onChange={(e) => updateForm("yearsExperience", e.target.value)}
                placeholder="e.g., 5 years"
              />
              {errors.yearsExperience && (
                <p style={styles.errorText}>{errors.yearsExperience}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                What doula certification(s) do you hold? *
              </label>
              <div
                style={{
                  background: "rgba(74,93,74,0.08)",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  border: "1px solid rgba(74,93,74,0.2)",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: "#5A6B5A",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  <strong>Note:</strong> We are currently only allowed to accept
                  full-spectrum doulas who completed either:
                </p>
                <ul
                  style={{
                    fontSize: 14,
                    color: "#5A6B5A",
                    marginTop: 8,
                    paddingLeft: 20,
                  }}
                >
                  <li style={{ marginBottom: 8 }}>
                    <strong>1. Training Pathway:</strong> 16+ hours of training
                    (topics must include Lactation support, Childbirth
                    education, Foundations on anatomy of pregnancy and
                    childbirth, Nonmedical comfort measures, prenatal support,
                    and labor support techniques, Developing a community
                    resource list) and supported 3 births
                  </li>
                  <li>
                    <strong>2. Experience Pathway:</strong> Five years of paid
                    or volunteer doula experience within the last seven years,
                    attested by three letters of recommendation
                  </li>
                </ul>
                <p
                  style={{
                    fontSize: 14,
                    color: "#4A5D4A",
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  Email sobia@findraya.com if you would like to do the
                  experience pathway.
                </p>
              </div>
              <textarea
                style={{
                  ...styles.input,
                  minHeight: 100,
                  ...(errors.certifications ? styles.inputError : {}),
                }}
                value={formData.certifications}
                onChange={(e) => updateForm("certifications", e.target.value)}
                placeholder="Describe your certifications..."
              />
              {errors.certifications && (
                <p style={styles.errorText}>{errors.certifications}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload Certification(s)</label>
              <FileUploadBox
                id="certification-upload"
                label="Upload your certification proof"
                fileName={formData.certificationFile?.name}
                hint="PDF, JPG, or PNG (max 10MB)"
                accept=".pdf,.jpg,.jpeg,.png"
                onFileSelect={async (file) => {
                  updateForm("certificationFile", file);
                  updateForm(
                    "certificationFileBase64",
                    await convertToBase64(file)
                  );
                }}
              />
            </div>

            <NavigationButtons
              canContinue
              onNext={handleNext}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      case 3:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Additional Certifications</h2>
            <p style={styles.stepSubtitle}>
              Tell us about any other credentials you hold.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Additional Certifications</label>
              <div style={styles.checkboxGrid}>
                {additionalCertOptions.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleArrayItem("additionalCerts", cert)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.additionalCerts.includes(cert)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.additionalCerts.includes(cert)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.additionalCerts.includes(cert) && "✓"}
                    </span>
                    {cert}
                  </button>
                ))}
              </div>
              {formData.additionalCerts.includes("Other") && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.additionalCertsOther}
                  onChange={(e) =>
                    updateForm("additionalCertsOther", e.target.value)
                  }
                  placeholder="Please specify other certifications"
                />
              )}
            </div>

            {/* Multi-file upload for additional certifications */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Upload additional certification files (optional)
              </label>
              <p style={styles.inputHint}>
                Upload up to 5 files. Max 100 MB per file.
              </p>
              
              {/* Display uploaded files */}
              {formData.additionalCertFiles.map((item, index) => (
                <div 
                  key={index} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: '#E8F0E8',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 14, color: '#4A5D4A' }}>✓</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#2D3A2D' }}>
                    {item.file?.name || `File ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...formData.additionalCertFiles];
                      newFiles.splice(index, 1);
                      updateForm("additionalCertFiles", newFiles);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {/* Add file button */}
              {formData.additionalCertFiles.length < 5 && (
                <div>
                  <input
                    type="file"
                    id="additional-cert-files"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const base64 = await convertToBase64(file);
                        updateForm("additionalCertFiles", [
                          ...formData.additionalCertFiles,
                          { file, base64 }
                        ]);
                        e.target.value = ''; // Reset input
                      }
                    }}
                  />
                  <label 
                    htmlFor="additional-cert-files" 
                    style={{
                      ...styles.uploadLabel,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={styles.uploadIcon}>📄</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#2D3A2D' }}>
                      + Add File
                    </span>
                    <span style={styles.uploadHint}>PDF, JPG, or PNG</span>
                  </label>
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                What are your specialties? Please list all of them. *
              </label>
              <p style={styles.inputHint}>
                Plus-Size, LGBTQ+, IVF, high-risk pregnancies, VBAC, first-time
                parents, etc.
              </p>
              <textarea
                style={{
                  ...styles.input,
                  minHeight: 80,
                  ...(errors.specialties ? styles.inputError : {}),
                }}
                value={formData.specialties}
                onChange={(e) => updateForm("specialties", e.target.value)}
                placeholder="e.g., Plus-Size, LGBTQ+, IVF, high-risk pregnancies, VBAC, first-time parents..."
              />
              {errors.specialties && (
                <p style={styles.errorText}>{errors.specialties}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Are you CPR certified from the American Red Cross (ARC) or
                American Heart Association (AHA)? *
              </label>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { value: "yes", label: "Yes", icon: "✓" },
                  { value: "no", label: "No", icon: "✗" },
                  { value: "in_process", label: "In the process", icon: "⏳" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("cprCertified", opt.value)}
                    style={{
                      ...styles.optionCard,
                      ...(formData.cprCertified === opt.value
                        ? styles.optionCardActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {opt.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#2D3A2D",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.cprCertified && (
                <p style={styles.errorText}>{errors.cprCertified}</p>
              )}
              {formData.cprCertified === "no" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#FEF3C7",
                    border: "1px solid #F59E0B",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ fontSize: 14, color: "#92400E", margin: 0 }}>
                    If you are not CPR certified, please get certified here:{" "}
                    <a
                      href="https://www.redcross.org/local/california/take-a-class/cpr"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4A5D4A", textDecoration: "underline" }}
                    >
                      American Red Cross CPR Classes
                    </a>
                  </p>
                </div>
              )}
              {formData.cprCertified === "yes" && (
                <div style={{ marginTop: 16 }}>
                  <FileUploadBox
                    id="cpr-upload"
                    label="Upload CPR Certificate"
                    fileName={formData.cprFile?.name}
                    hint="PDF, JPG, or PNG"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={async (file) => {
                      updateForm("cprFile", file);
                      updateForm("cprFileBase64", await convertToBase64(file));
                    }}
                  />
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Do you have HIPAA training certification? *
              </label>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { value: "yes", label: "Yes", icon: "✓" },
                  { value: "no", label: "No", icon: "✗" },
                  { value: "in_process", label: "In the process", icon: "⏳" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("hipaaTrained", opt.value)}
                    style={{
                      ...styles.optionCard,
                      ...(formData.hipaaTrained === opt.value
                        ? styles.optionCardActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {opt.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#2D3A2D",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.hipaaTrained && (
                <p style={styles.errorText}>{errors.hipaaTrained}</p>
              )}
              {formData.hipaaTrained === "no" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#FEF3C7",
                    border: "1px solid #F59E0B",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ fontSize: 14, color: "#92400E", margin: 0 }}>
                    If you do not have HIPAA Training, please complete this FREE
                    course:{" "}
                    <a
                      href="https://www.nephtc.org/enrol/index.php?id=178"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4A5D4A", textDecoration: "underline" }}
                    >
                      NEPHTC HIPAA Training
                    </a>
                  </p>
                </div>
              )}
              {formData.hipaaTrained === "yes" && (
                <div style={{ marginTop: 16 }}>
                  <FileUploadBox
                    id="hipaa-upload"
                    label="Upload HIPAA Certificate"
                    fileName={formData.hipaaFile?.name}
                    hint="PDF, JPG, or PNG"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={async (file) => {
                      updateForm("hipaaFile", file);
                      updateForm(
                        "hipaaFileBase64",
                        await convertToBase64(file)
                      );
                    }}
                  />
                </div>
              )}
            </div>

            <NavigationButtons
              canContinue
              onNext={handleNext}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      case 4:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Business & Insurance</h2>
            <p style={styles.stepSubtitle}>
              Help us understand your business setup.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Please list your National Provider Identifier (NPI) for yourself below.
              </label>
              <p style={styles.inputHint}>
                If you do not have one, please take 5 minutes and get one using this
                website:{" "}
                <a
                  href="https://nppes.cms.hhs.gov/#/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4A5D4A", textDecoration: "underline" }}
                >
                  https://nppes.cms.hhs.gov/#/
                </a>
              </p>
              <input
                style={styles.input}
                type="text"
                value={formData.npiNumber}
                onChange={(e) => updateForm("npiNumber", e.target.value.replace(/\D/g, '').slice(0, 10))} // Enforce numeric only and max length
                placeholder="10-digit NPI Number"
                maxLength={10}
              />
              {errors.npiNumber && (
                <p style={styles.errorText}>{errors.npiNumber}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                If you have any kind of insurance associated with your practice, please upload them below.
              </label>
              <FileUploadBox
                id="insurance-upload"
                label="Add File"
                hint="Upload up to 5 supported files. Max 100 MB per file."
                accept=".pdf,.jpg,.jpeg,.png"
                onFileSelect={async (file) => {
                  const base64 = await convertToBase64(file);
                  const newFile = { file, base64, name: file.name };
                  updateForm("insuranceFiles", [
                    ...formData.insuranceFiles,
                    newFile,
                  ]);
                }}
              />
              {formData.insuranceFiles.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {formData.insuranceFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: "#2D3A2D",
                        marginTop: 4,
                      }}
                    >
                      <span>✓</span>
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...formData.insuranceFiles];
                          newFiles.splice(index, 1);
                          updateForm("insuranceFiles", newFiles);
                        }}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#D93025",
                          cursor: "pointer",
                          fontSize: 18,
                          padding: 0,
                          marginLeft: 4,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>In-Network Organizations</label>
              <p style={styles.inputHint}>
                Select all insurance organizations you are currently in-network
                with:
              </p>
              <div style={styles.checkboxGrid}>
                {insuranceOrganizations.map((org) => (
                  <button
                    key={org}
                    type="button"
                    onClick={() => toggleArrayItem("inNetworkOrgs", org)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.inNetworkOrgs.includes(org)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.inNetworkOrgs.includes(org)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.inNetworkOrgs.includes(org) && "✓"}
                    </span>
                    {org}
                  </button>
                ))}
              </div>
              {formData.inNetworkOrgs.includes("Other") && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.inNetworkOrgsOther}
                  onChange={(e) =>
                    updateForm("inNetworkOrgsOther", e.target.value)
                  }
                  placeholder="Please specify other organizations"
                />
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                If you are Medi-Cal Approved, please upload your Medi-Cal/DHCS
                approval letter.
              </label>
              <FileUploadBox
                id="medicalApproval-upload"
                label="Upload Medi-Cal/DHCS Approval Letter"
                fileName={formData.mediCalApprovalFile?.name}
                hint="PDF only (max 1MB)"
                accept=".pdf"
                onFileSelect={async (file) => {
                  updateForm("mediCalApprovalFile", file);
                  updateForm(
                    "mediCalApprovalFileBase64",
                    await convertToBase64(file)
                  );
                }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                If you are not Medi-Cal Approved, would you like Raya Health to
                assist you in getting Medi-Cal Approved?
              </label>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {["yes", "no", "learn_more"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateForm("wantMediCalAssistance", val)}
                    style={{
                      ...styles.radioButton,
                      ...(formData.wantMediCalAssistance === val
                        ? styles.radioButtonActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#2D3A2D",
                      }}
                    >
                      {val === "yes" && "Yes"}
                      {val === "no" && "No"}
                      {val === "learn_more" &&
                        "I want to learn more about the process"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <NavigationButtons
              canContinue
              onNext={handleNext}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      case 5:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Service Approach</h2>
            <p style={styles.stepSubtitle}>
              Tell us about your practice and philosophy.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Approximately how many families have you supported?
              </label>
              <input
                style={styles.input}
                type="text"
                value={formData.familiesSupported}
                onChange={(e) =>
                  updateForm("familiesSupported", e.target.value)
                }
                placeholder="e.g., 50+ families"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                What type of Doula Care do you offer? (Check all that apply) *
              </label>
              <p style={styles.inputHint}>Please check ALL that apply</p>
              <div style={styles.checkboxGrid}>
                {careTypesOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleArrayItem("careTypes", type)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.careTypes.includes(type)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.careTypes.includes(type)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.careTypes.includes(type) && "✓"}
                    </span>
                    {type}
                  </button>
                ))}
              </div>
              {formData.careTypes.includes("Other") && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.careTypesOther}
                  onChange={(e) => updateForm("careTypesOther", e.target.value)}
                  placeholder="Please specify..."
                />
              )}
              {errors.careTypes && (
                <p style={styles.errorText}>{errors.careTypes}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                What months are you available to take on patients? *
              </label>
              <div style={styles.checkboxGrid}>
                {monthOptions.map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleArrayItem("availableMonths", month)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.availableMonths.includes(month)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.availableMonths.includes(month)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.availableMonths.includes(month) && "✓"}
                    </span>
                    {month}
                  </button>
                ))}
              </div>
              {errors.availableMonths && (
                <p style={styles.errorText}>{errors.availableMonths}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Languages Spoken</label>
              <input
                style={styles.input}
                type="text"
                value={formData.languages}
                onChange={(e) => updateForm("languages", e.target.value)}
                placeholder="e.g., English, Spanish, Mandarin"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                How do you prefer to engage with your patients? (Check all that apply) *
              </label>
              <div style={styles.checkboxGrid}>
                {engagementOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayItem("engagementPreferences", option)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.engagementPreferences.includes(option)
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.engagementPreferences.includes(option)
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.engagementPreferences.includes(option) && "✓"}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
              {errors.engagementPreferences && (
                <p style={styles.errorText}>{errors.engagementPreferences}</p>
              )}

            </div>
            <div style={{ ...styles.inputGroup, marginTop: 24 }}>
              <label style={styles.label}>
                Will you support patients IN-PERSON during labor + delivery?
              </label>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { value: true, label: "Yes", icon: "✓" },
                  { value: false, label: "No", icon: "✗" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() =>
                      updateForm("inPersonLaborSupport", opt.value)
                    }
                    style={{
                      ...styles.optionCard,
                      ...(formData.inPersonLaborSupport === opt.value
                        ? styles.optionCardActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.inPersonLaborSupport === opt.value
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                        fontSize: 16,
                        marginRight: 0,
                        marginBottom: 4,
                      }}
                    >
                      {formData.inPersonLaborSupport === opt.value && "✓"}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#2D3A2D",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Short Bio *</label>
              <textarea
                style={{
                  ...styles.input,
                  minHeight: 100,
                  ...(errors.bio ? styles.inputError : {}),
                }}
                value={formData.bio}
                onChange={(e) => updateForm("bio", e.target.value)}
                placeholder="Tell families about yourself and your background..."
              />
              {errors.bio && <p style={styles.errorText}>{errors.bio}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Care Philosophy</label>
              <textarea
                style={{ ...styles.input, minHeight: 100 }}
                value={formData.philosophy}
                onChange={(e) => updateForm("philosophy", e.target.value)}
                placeholder="Describe your approach to doula care..."
              />
            </div>

            <NavigationButtons
              canContinue
              onNext={handleNext}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      case 6:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Final Details</h2>
            <p style={styles.stepSubtitle}>
              Just a few more things before we finish.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Professional Headshot</label>
              <FileUploadBox
                id="headshot-upload"
                label="Upload your headshot"
                fileName={formData.headshotFile?.name}
                hint="JPG or PNG, professional quality preferred"
                accept=".jpg,.jpeg,.png"
                onFileSelect={async (file) => {
                  updateForm("headshotFile", file);
                  updateForm("headshotFileBase64", await convertToBase64(file));
                }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Are you comfortable encouraging vaccinations for both mom, child,
                and family members? *
              </label>
              <p style={styles.inputHint}>
                We encourage and educate patients to stay up to-date on their
                vaccinations, so want to understand if you are aligned with our
                mission.
              </p>
              <div style={styles.checkboxGrid}>
                {["Yes", "No", "Other"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateForm("vaccinationEncouragement", opt)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.vaccinationEncouragement === opt
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.checkbox,
                        ...(formData.vaccinationEncouragement === opt
                          ? { border: "2px solid #4A5D4A", color: "#4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.vaccinationEncouragement === opt && "✓"}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
              {formData.vaccinationEncouragement === "Other" && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.vaccinationEncouragementOther}
                  onChange={(e) =>
                    updateForm("vaccinationEncouragementOther", e.target.value)
                  }
                  placeholder="Please specify..."
                />
              )}
              {errors.vaccinationEncouragement && (
                <p style={styles.errorText}>{errors.vaccinationEncouragement}</p>
              )}
            </div>



            <div style={styles.inputGroup}>
              <label style={styles.label}>How did you hear about Raya?</label>
              <div style={styles.checkboxGrid}>
                {referralSources.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => updateForm("referralSource", source)}
                    style={{
                      ...styles.checkboxButton,
                      ...(formData.referralSource === source
                        ? styles.checkboxActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.radioCircle,
                        ...(formData.referralSource === source
                          ? { border: "2px solid #4A5D4A" }
                          : {}),
                      }}
                    >
                      {formData.referralSource === source && (
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#4A5D4A",
                          }}
                        />
                      )}
                    </span>
                    {source}
                  </button>
                ))}
              </div>
              {formData.referralSource === "Other" && (
                <input
                  style={{ ...styles.input, marginTop: 12 }}
                  type="text"
                  value={formData.referralSourceOther}
                  onChange={(e) =>
                    updateForm("referralSourceOther", e.target.value)
                  }
                  placeholder="Please specify"
                />
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Final Comments or Questions</label>
              <textarea
                style={{ ...styles.input, minHeight: 80 }}
                value={formData.finalComments}
                onChange={(e) => updateForm("finalComments", e.target.value)}
                placeholder="Anything else you'd like us to know?"
              />
            </div>

            <NavigationButtons
              canContinue
              onNext={handleSubmit}
              nextLabel="Submit Application →"
              isLoading={isSubmitting}
              step={step}
              setStep={setStep}
            />
          </div>
        );

      default:
        return null;
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
            style={{ 
              height: 24,
              filter: "brightness(0)" // Ensure it renders as black
            }} 
          />
        </div>
      </header>
      <main style={styles.main}>
        {!isSubmitted && <ProgressBar step={step} totalSteps={totalSteps} />}
        <div style={styles.card}>{renderStep()}</div>
      </main>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #E8EFE6 0%, #C5D9BE 50%, #9EC981 100%)",
    fontFamily: '"General Sans", -apple-system, sans-serif',
  },
  header: { padding: "20px 32px", borderBottom: "1px solid rgba(0,0,0,0.08)" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  main: { maxWidth: 640, margin: "0 auto", padding: "32px 24px" },
  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 4px 24px rgba(45,58,45,0.08)",
    animation: "fadeIn 0.4s ease",
  },
  stepContent: { animation: "fadeIn 0.3s ease" },
  stepTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 28,
    fontWeight: 400,
    color: "#2D3A2D",
    marginBottom: 8,
    marginTop: 0,
  },
  stepSubtitle: {
    fontSize: 15,
    color: "#5A6B5A",
    marginBottom: 28,
    lineHeight: 1.5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#3D4D3D",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 16,
    border: "1px solid #C5D4C2",
    borderRadius: 8,
    background: "#FFFFFF",
    color: "#2D3A2D",
    outline: "none",
    boxSizing: "border-box",
  },
  inputError: { border: "1px solid #D93025" },
  errorText: { fontSize: 12, color: "#D93025", marginTop: 4, margin: 0 },
  inputHint: { fontSize: 12, color: "#5A6B5A", marginTop: 6 },
  dateFieldWrapper: { position: "relative" },
  dateIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid #C5D4C2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    background: "#FFFFFF",
  },
  progressContainer: {
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "rgba(45,58,45,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4A5D4A, #2D3A2D)",
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  progressText: { fontSize: 13, color: "#5A6B5A", whiteSpace: "nowrap" },
  navButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 32,
    gap: 16,
  },
  backButton: {
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    border: "1px solid #C5D4C2",
    borderRadius: 8,
    background: "transparent",
    color: "#3D4D3D",
    cursor: "pointer",
  },
  nextButton: {
    padding: "14px 32px",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 8,
    background: "#2D3A2D",
    color: "#FFFFFF",
    cursor: "pointer",
    marginLeft: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  buttonSpinner: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.5)",
    borderTopColor: "#FFFFFF",
    animation: "spin 0.8s linear infinite",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  checkboxButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    border: "1px solid #C5D4C2",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "pointer",
    fontSize: 14,
    color: "#2D3A2D",
    textAlign: "left",
  },
  checkboxActive: {
    border: "1px solid #4A5D4A",
    background: "rgba(74,93,74,0.08)",
    boxShadow: "0 0 0 1px #4A5D4A",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: "2px solid rgba(74,93,74,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  optionCard: {
    flex: 1,
    padding: "16px 24px",
    border: "1px solid #C5D4C2",
    borderRadius: 12,
    background: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  optionCardActive: {
    border: "1px solid #4A5D4A",
    background: "rgba(74,93,74,0.08)",
    boxShadow: "0 0 0 1px #4A5D4A",
  },
  radioButton: {
    width: "100%",
    padding: "16px 24px",
    border: "1px solid #C5D4C2",
    borderRadius: 12,
    background: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  radioButtonActive: {
    border: "1px solid #4A5D4A",
    background: "rgba(74,93,74,0.08)",
    boxShadow: "0 0 0 1px #4A5D4A",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2px solid rgba(74,93,74,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 32,
    border: "2px dashed rgba(74,93,74,0.6)",
    borderRadius: 12,
    background: "rgba(74,93,74,0.04)",
    cursor: "pointer",
    textAlign: "center",
  },
  uploadIcon: { fontSize: 36 },
  uploadHint: { fontSize: 12, color: "#5A6B5A" },
};
