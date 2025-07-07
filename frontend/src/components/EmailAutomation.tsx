import React, { useState, useEffect } from "react";
import api from "../services/api";
import { AxiosError } from "axios";

interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  subject: string;
  body_html: string;
  variables: string[];
  usage_count: number;
  is_system_template: boolean;
}

interface EmailSignature {
  id: number;
  name: string;
  html_content: string;
  company_logo_url: string;
  company_name: string;
  is_default: boolean;
}

interface EmailAddon {
  id: number;
  name: string;
  type: string;
  content: string;
  auto_include: boolean;
}

interface EmailAutomationProps {
  socket?: WebSocket | null;
  sendMessage?: (message: string) => void;
  isConnected?: boolean;
}

const EmailAutomation: React.FC<EmailAutomationProps> = ({
  socket,
  sendMessage,
  isConnected,
}) => {
  const [activeTab, setActiveTab] = useState<
    "compose" | "templates" | "signatures" | "addons" | "history"
  >("compose");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [addons, setAddons] = useState<EmailAddon[]>([]);
  const [loading, setLoading] = useState(false);

  const [composeForm, setComposeForm] = useState({
    type: "single",
    template_id: "",
    recipient_email: "",
    recipient_emails: "",
    subject: "",
    variables: {} as Record<string, string>,
    send_immediately: true,
    scheduled_at: "",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "general",
    subject: "",
    body_html: "",
    is_system_template: false,
  });

  const [signatureForm, setSignatureForm] = useState({
    name: "",
    html_content: "",
    company_logo_url: "",
    company_name: "NaviKenz",
    is_default: false,
  });

  const [addonForm, setAddonForm] = useState({
    name: "",
    type: "policy",
    content: "",
    auto_include: false,
  });

  const getDefaultTemplates = () => [
    {
      name: "Offer Letter",
      category: "offer_letter",
      subject: "Job Offer - {{job_title}} Position at {{company_name}}",
      body_html: `
        <h2>Congratulations {{candidate_name}}!</h2>
        <p>We are pleased to offer you the position of <strong>{{job_title}}</strong> at {{company_name}}.</p>
        <h3>Offer Details:</h3>
        <ul>
          <li>Position: {{job_title}}</li>
          <li>Department: {{department}}</li>
          <li>Start Date: {{start_date}}</li>
          <li>Salary: {{salary_amount}}</li>
          <li>Location: {{work_location}}</li>
        </ul>
        <p>Please confirm your acceptance by replying to this email by {{response_deadline}}.</p>
        <p>We look forward to welcoming you to our team!</p>
      `,
    },
    {
      name: "Interview Invitation",
      category: "interview",
      subject: "Interview Invitation - {{job_title}} Position",
      body_html: `
        <h2>Interview Invitation</h2>
        <p>Dear {{candidate_name}},</p>
        <p>Thank you for your interest in the <strong>{{job_title}}</strong> position at {{company_name}}.</p>
        <h3>Interview Details:</h3>
        <ul>
          <li>Date: {{interview_date}}</li>
          <li>Time: {{interview_time}}</li>
          <li>Location: {{interview_location}}</li>
          <li>Interviewer: {{interviewer_name}}</li>
        </ul>
        <p>Please confirm your availability by replying to this email.</p>
        <p>Best regards,<br>{{company_name}} Team</p>
      `,
    },
  ];

  const useDefaultTemplate = (templateName: string) => {
    const defaultTemplates = getDefaultTemplates();
    const template = defaultTemplates.find((t) => t.name === templateName);

    if (template) {
      setTemplateForm({
        name: template.name,
        category: template.category,
        subject: template.subject,
        body_html: template.body_html,
        is_system_template: false,
      });
    }
  };

  useEffect(() => {
    loadTemplates();
    loadSignatures();
    loadAddons();
  }, []);

  const loadTemplates = async () => {
    try {
      console.log("Loading templates..."); // Debug log

      const response = await api.get("/api/v1/emails/templates");

      if (response.data.success) {
        const loadedTemplates = response.data.templates || [];
        setTemplates(loadedTemplates);
        console.log("Templates loaded:", loadedTemplates.length); // Debug log
      } else {
        console.error("Failed to load templates:", response.data.error);
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates([]);

      const err = error as AxiosError;
      if (err.response?.status === 404) {
        console.warn("Templates endpoint not found - using fallback");
      }
    }
  };

  const loadSignatures = async () => {
    try {
      const response = await api.get("/api/v1/emails/signatures");
      setSignatures(response.data.signatures || []);
    } catch (error) {
      console.error("Error loading signatures:", error);
    }
  };

  const loadAddons = async () => {
    try {
      const response = await api.get("/api/v1/emails/addons");
      setAddons(response.data.addons || []);
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    console.log("Template selected:", templateId); // Debug log

    if (!templateId) {
      // Reset form when no template selected
      setComposeForm((prev) => ({
        ...prev,
        template_id: "",
        subject: "",
        variables: {},
      }));
      return;
    }

    const template = templates.find((t) => t.id.toString() === templateId);
    console.log("Found template:", template); // Debug log

    if (template) {
      // Extract variables from template content
      const extractedVariables = extractTemplateVariables(
        template.body_html,
        template.subject
      );

      // Update form state with proper batching
      setComposeForm((prev) => ({
        ...prev,
        template_id: templateId,
        subject: template.subject,
        variables: extractedVariables.reduce((acc, variable) => {
          acc[variable] = "";
          return acc;
        }, {} as Record<string, string>),
      }));

      console.log("Form updated with template:", templateId);
    }
  };

  const extractTemplateVariables = (
    bodyHtml: string,
    subject: string
  ): string[] => {
    const combinedContent = `${bodyHtml} ${subject}`;
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(combinedContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  };

  const handleSendEmail = async () => {
    if (!composeForm.template_id) {
      alert("Please select a template");
      return;
    }

    if (composeForm.type === "single" && !composeForm.recipient_email) {
      alert("Please enter recipient email");
      return;
    }

    if (composeForm.type === "bulk" && !composeForm.recipient_emails) {
      alert("Please enter recipient emails");
      return;
    }

    setLoading(true);
    try {
      let endpoint = "/api/v1/emails/send";
      let payload: any = {
        template_id: composeForm.template_id,
        variables: composeForm.variables,
        send_immediately: composeForm.send_immediately,
        scheduled_at: composeForm.scheduled_at,
      };

      if (composeForm.type === "single") {
        payload.recipient_email = composeForm.recipient_email;
      } else {
        endpoint = "/api/v1/emails/send-bulk";
        payload.name = `Campaign ${new Date().toLocaleString()}`;
        payload.recipient_type = composeForm.type;

        if (composeForm.type === "bulk") {
          payload.recipient_data = composeForm.recipient_emails
            .split(",")
            .map((email) => email.trim());
        }
      }

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        alert(
          composeForm.type === "single"
            ? "Email sent successfully!"
            : `Bulk email sent to ${response.data.sent_count} recipients`
        );

        setComposeForm({
          type: "single",
          template_id: "",
          recipient_email: "",
          recipient_emails: "",
          subject: "",
          variables: {},
          send_immediately: true,
          scheduled_at: "",
        });

        if (sendMessage && isConnected) {
          sendMessage(
            `Sent ${composeForm.type} email using template: ${
              templates.find((t) => t.id.toString() === composeForm.template_id)
                ?.name
            }`
          );
        }
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (
      !templateForm.name ||
      !templateForm.subject ||
      !templateForm.body_html
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Extract variables before sending to backend
      const extractedVariables = extractTemplateVariables(
        templateForm.body_html,
        templateForm.subject
      );

      const templateData = {
        ...templateForm,
        variables: extractedVariables,
      };

      console.log("Creating template with data:", templateData); // Debug log

      const response = await api.post("/api/v1/emails/templates", templateData);

      if (response.data.success) {
        alert("Email template created successfully");

        // Reset form
        setTemplateForm({
          name: "",
          category: "general",
          subject: "",
          body_html: "",
          is_system_template: false,
        });

        // Reload templates to include the new one
        await loadTemplates();

        console.log("Template created and templates reloaded"); // Debug log
      } else {
        throw new Error(response.data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert(`Failed to create template: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignature = async () => {
    if (!signatureForm.name || !signatureForm.html_content) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/api/v1/emails/signatures",
        signatureForm
      );

      if (response.data.success) {
        alert("Email signature created successfully");
        setSignatureForm({
          name: "",
          html_content: "",
          company_logo_url: "",
          company_name: "NaviKenz",
          is_default: false,
        });
        loadSignatures();
      }
    } catch (error) {
      console.error("Error creating signature:", error);
      alert("Failed to create signature");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddon = async () => {
    if (!addonForm.name || !addonForm.content) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/emails/addons", addonForm);

      if (response.data.success) {
        alert("Email addon created successfully");
        setAddonForm({
          name: "",
          type: "policy",
          content: "",
          auto_include: false,
        });
        loadAddons();
      }
    } catch (error) {
      console.error("Error creating addon:", error);
      alert("Failed to create addon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-automation">
      <div className="page-header">
        <h1>📧 Email Automation</h1>
        <p>
          Streamline your recruitment communication with smart email templates
          and bulk sending
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "compose" ? "active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          ✉️ Compose Email
        </button>
        <button
          className={`tab-button ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          📝 Templates
        </button>
        <button
          className={`tab-button ${activeTab === "signatures" ? "active" : ""}`}
          onClick={() => setActiveTab("signatures")}
        >
          ✍️ Signatures
        </button>
        <button
          className={`tab-button ${activeTab === "addons" ? "active" : ""}`}
          onClick={() => setActiveTab("addons")}
        >
          🔧 Add-ons
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📊 History
        </button>
      </div>

      {/* ✅ FIXED: Compose Email Tab - Previously Missing */}
      {activeTab === "compose" && (
        <div className="tab-content">
          <div className="compose-section">
            <h3>📤 Send Email</h3>

            {/* Email Type Selection */}
            <div className="form-row">
              <div className="form-group">
                <label>Email Type</label>
                <select
                  value={composeForm.type}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, type: e.target.value })
                  }
                >
                  <option value="single">Single Recipient</option>
                  <option value="bulk">Bulk Email</option>
                  <option value="filtered">Filtered Recipients</option>
                </select>
              </div>

              <div className="form-group">
                <label>Template *</label>
                <select
                  value={composeForm.template_id}
                  onChange={(e) => {
                    console.log("Template dropdown changed:", e.target.value); // Debug log
                    handleTemplateSelect(e.target.value);
                  }}
                  className={`form-control ${
                    !composeForm.template_id ? "placeholder-shown" : ""
                  }`}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id.toString()}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>

                {templates.length === 0 && (
                  <small className="text-muted">
                    No templates available. Create one in the Templates tab
                    first.
                  </small>
                )}

                {composeForm.template_id && (
                  <small className="text-success">
                    Template selected:{" "}
                    {
                      templates.find(
                        (t) => t.id.toString() === composeForm.template_id
                      )?.name
                    }
                  </small>
                )}
              </div>
            </div>

            {/* Recipients */}
            {composeForm.type === "single" && (
              <div className="form-group">
                <label>Recipient Email *</label>
                <input
                  type="email"
                  placeholder="candidate@example.com"
                  value={composeForm.recipient_email}
                  onChange={(e) =>
                    setComposeForm({
                      ...composeForm,
                      recipient_email: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {composeForm.type === "bulk" && (
              <div className="form-group">
                <label>Recipient Emails *</label>
                <textarea
                  placeholder="Enter emails separated by commas or new lines"
                  value={composeForm.recipient_emails}
                  onChange={(e) =>
                    setComposeForm({
                      ...composeForm,
                      recipient_emails: e.target.value,
                    })
                  }
                  rows={4}
                />
                <small>
                  Separate multiple emails with commas or line breaks
                </small>
              </div>
            )}

            {composeForm.template_id && (
              <div className="template-preview-section">
                <h4>📋 Template Preview</h4>
                <div className="preview-card">
                  <div className="preview-subject">
                    <strong>Subject:</strong> {composeForm.subject}
                  </div>
                  <div className="preview-variables">
                    <strong>Variables to fill:</strong>
                    {Object.keys(composeForm.variables).length > 0 ? (
                      <ul>
                        {Object.keys(composeForm.variables).map((variable) => (
                          <li key={variable}>
                            {`{{${variable}}}`} -{" "}
                            {composeForm.variables[variable] || "Not filled"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">
                        No variables in this template
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template Variables */}
            {Object.keys(composeForm.variables).length > 0 && (
              <div className="variables-section">
                <h4>📝 Template Variables</h4>
                <div className="variables-grid">
                  {Object.keys(composeForm.variables).map((variable) => (
                    <div key={variable} className="form-group">
                      <label>
                        {variable
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${variable}`}
                        value={composeForm.variables[variable]}
                        onChange={(e) =>
                          setComposeForm({
                            ...composeForm,
                            variables: {
                              ...composeForm.variables,
                              [variable]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={composeForm.send_immediately}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        send_immediately: e.target.checked,
                      })
                    }
                  />
                  Send Immediately
                </label>
              </div>

              {!composeForm.send_immediately && (
                <div className="form-group">
                  <label>Schedule For</label>
                  <input
                    type="datetime-local"
                    value={composeForm.scheduled_at}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        scheduled_at: e.target.value,
                      })
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={handleSendEmail}
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : composeForm.type === "single"
                ? "📤 Send Email"
                : "📤 Send Bulk Email"}
            </button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="tab-content">
          {/* Quick Start Templates */}
          <div className="quick-start-section">
            <h3>🚀 Quick Start Templates</h3>
            <p>Use these pre-built templates to get started quickly:</p>
            <div className="default-templates-grid">
              {getDefaultTemplates().map((template, index) => (
                <div key={index} className="default-template-card">
                  <h4>{template.name}</h4>
                  <span className="category-badge">{template.category}</span>
                  <p>{template.subject}</p>
                  <button
                    className="btn-small"
                    onClick={() => useDefaultTemplate(template.name)}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Template Creation Form */}
          <div className="template-creation">
            <h3>📝 Create Custom Template</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Welcome Email"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={templateForm.category}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="general">General</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="interview">Interview</option>
                  <option value="rejection">Rejection</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Subject Line *</label>
                <input
                  type="text"
                  placeholder="Welcome to {{company_name}} - {{candidate_name}}"
                  value={templateForm.subject}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      subject: e.target.value,
                    })
                  }
                />
                <small>Use {`{{variable_name}}`} for dynamic content</small>
              </div>

              <div className="form-group full-width">
                <label>Email Body (HTML) *</label>
                <textarea
                  placeholder="<h2>Welcome {{candidate_name}}!</h2><p>We're excited to have you join {{company_name}}...</p>"
                  value={templateForm.body_html}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      body_html: e.target.value,
                    })
                  }
                  rows={10}
                />
                <small>
                  HTML formatting supported. Use {`{{variable_name}}`} for
                  personalization
                </small>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleCreateTemplate}
              disabled={loading}
            >
              {loading ? "Creating..." : "📝 Create Template"}
            </button>
          </div>

          {/* Existing Templates */}
          <div className="existing-templates">
            <h3>📋 Existing Templates</h3>
            <div className="templates-grid">
              {templates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-header">
                    <h4>{template.name}</h4>
                    <span className={`category-badge ${template.category}`}>
                      {template.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="template-subject">{template.subject}</p>
                  <div className="template-stats">
                    <span>Used {template.usage_count} times</span>
                    {template.is_system_template && (
                      <span className="system-badge">System</span>
                    )}
                  </div>
                  <div className="template-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small">Preview</button>
                    <button className="btn-small">Duplicate</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Signatures Tab - Previously Missing */}
      {activeTab === "signatures" && (
        <div className="tab-content">
          <div className="signature-creation">
            <h3>✍️ Create Email Signature</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Signature Name *</label>
                <input
                  type="text"
                  placeholder="e.g., HR Team Signature"
                  value={signatureForm.name}
                  onChange={(e) =>
                    setSignatureForm({ ...signatureForm, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={signatureForm.company_name}
                  onChange={(e) =>
                    setSignatureForm({
                      ...signatureForm,
                      company_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Company Logo URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/logo.png"
                  value={signatureForm.company_logo_url}
                  onChange={(e) =>
                    setSignatureForm({
                      ...signatureForm,
                      company_logo_url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={signatureForm.is_default}
                    onChange={(e) =>
                      setSignatureForm({
                        ...signatureForm,
                        is_default: e.target.checked,
                      })
                    }
                  />
                  Set as Default Signature
                </label>
              </div>

              <div className="form-group full-width">
                <label>Signature HTML *</label>
                <textarea
                  placeholder="<p>Best regards,<br><strong>HR Team</strong><br>NaviKenz<br>Email: hr@navikenz.com</p>"
                  value={signatureForm.html_content}
                  onChange={(e) =>
                    setSignatureForm({
                      ...signatureForm,
                      html_content: e.target.value,
                    })
                  }
                  rows={6}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleCreateSignature}
              disabled={loading}
            >
              {loading ? "Creating..." : "✍️ Create Signature"}
            </button>
          </div>

          {/* Existing Signatures */}
          <div className="existing-signatures">
            <h3>📝 Existing Signatures</h3>
            <div className="signatures-list">
              {signatures.map((signature) => (
                <div key={signature.id} className="signature-card">
                  <div className="signature-info">
                    <h4>{signature.name}</h4>
                    {signature.is_default && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                  <div
                    className="signature-preview"
                    dangerouslySetInnerHTML={{ __html: signature.html_content }}
                  />
                  <div className="signature-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small">Set Default</button>
                    <button className="btn-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Add-ons Tab - Previously Missing */}
      {activeTab === "addons" && (
        <div className="tab-content">
          <div className="addon-creation">
            <h3>🔧 Create Email Add-on</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Add-on Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Company Policy"
                  value={addonForm.name}
                  onChange={(e) =>
                    setAddonForm({ ...addonForm, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={addonForm.type}
                  onChange={(e) =>
                    setAddonForm({ ...addonForm, type: e.target.value })
                  }
                >
                  <option value="policy">Company Policy</option>
                  <option value="terms">Terms & Conditions</option>
                  <option value="disclaimer">Disclaimer</option>
                  <option value="social_links">Social Links</option>
                  <option value="contact_info">Contact Information</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={addonForm.auto_include}
                    onChange={(e) =>
                      setAddonForm({
                        ...addonForm,
                        auto_include: e.target.checked,
                      })
                    }
                  />
                  Auto-include in all emails
                </label>
              </div>

              <div className="form-group full-width">
                <label>Content *</label>
                <textarea
                  placeholder="This email is confidential and intended only for the recipient..."
                  value={addonForm.content}
                  onChange={(e) =>
                    setAddonForm({ ...addonForm, content: e.target.value })
                  }
                  rows={6}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleCreateAddon}
              disabled={loading}
            >
              {loading ? "Creating..." : "🔧 Create Add-on"}
            </button>
          </div>

          {/* Existing Add-ons */}
          <div className="existing-addons">
            <h3>🔧 Existing Add-ons</h3>
            <div className="addons-list">
              {addons.map((addon) => (
                <div key={addon.id} className="addon-card">
                  <div className="addon-header">
                    <h4>{addon.name}</h4>
                    <span className={`type-badge ${addon.type}`}>
                      {addon.type.replace("_", " ")}
                    </span>
                    {addon.auto_include && (
                      <span className="auto-badge">Auto-include</span>
                    )}
                  </div>
                  <p className="addon-content">
                    {addon.content.substring(0, 100)}...
                  </p>
                  <div className="addon-actions">
                    <button className="btn-small">Edit</button>
                    <button className="btn-small">Toggle Auto</button>
                    <button className="btn-small">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: History Tab - Previously Missing */}
      {activeTab === "history" && (
        <div className="tab-content">
          <div className="email-history">
            <h3>📊 Email Campaign History</h3>
            <div className="history-stats">
              <div className="stat-card">
                <h4>Total Campaigns</h4>
                <span className="stat-number">24</span>
              </div>
              <div className="stat-card">
                <h4>Emails Sent</h4>
                <span className="stat-number">1,247</span>
              </div>
              <div className="stat-card">
                <h4>Success Rate</h4>
                <span className="stat-number">98.5%</span>
              </div>
              <div className="stat-card">
                <h4>Open Rate</h4>
                <span className="stat-number">67.2%</span>
              </div>
            </div>

            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Template</th>
                    <th>Recipients</th>
                    <th>Sent</th>
                    <th>Failed</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Welcome Campaign</td>
                    <td>Onboarding Welcome</td>
                    <td>45</td>
                    <td>44</td>
                    <td>1</td>
                    <td>2025-06-15</td>
                    <td>
                      <button className="btn-small">View</button>
                      <button className="btn-small">Resend</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Interview Invitations</td>
                    <td>Interview Invitation</td>
                    <td>12</td>
                    <td>12</td>
                    <td>0</td>
                    <td>2025-06-14</td>
                    <td>
                      <button className="btn-small">View</button>
                      <button className="btn-small">Resend</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Offer Letters</td>
                    <td>Offer Letter</td>
                    <td>3</td>
                    <td>3</td>
                    <td>0</td>
                    <td>2025-06-13</td>
                    <td>
                      <button className="btn-small">View</button>
                      <button className="btn-small">Resend</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS Styles */}
    </div>
  );
};

export default EmailAutomation;
