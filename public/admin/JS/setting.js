// ========================================
// SETTINGS PAGE - JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    initializePaymentMethodToggles();
    initializeImagePreview();
    initializeFormSubmission();
});

// ========================================
// PAYMENT METHOD TOGGLES
// ========================================

function initializePaymentMethodToggles() {
    const toggles = document.querySelectorAll('.payment-toggle');

    toggles.forEach(toggle => {
        // Get the ID without "Toggle" suffix to find the corresponding content
        const contentId = toggle.id.replace('Toggle', 'Content');
        const contentElement = document.getElementById(contentId);

        // Set initial state
        if (toggle.checked && contentElement) {
            contentElement.classList.add('active');
        }

        // Add change event listener
        toggle.addEventListener('change', function () {
            if (contentElement) {
                if (this.checked) {
                    contentElement.classList.add('active');
                } else {
                    contentElement.classList.remove('active');
                }
            }
        });
    });
}

// ========================================
// IMAGE PREVIEW
// ========================================

function initializeImagePreview() {
    // Logo preview
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.addEventListener('change', function (event) {
            previewImage(event, 'logo');
        });
    }

    // Favicon preview
    const faviconInput = document.getElementById('faviconInput');
    if (faviconInput) {
        faviconInput.addEventListener('change', function (event) {
            previewImage(event, 'favicon');
        });
    }

    // QR Code previews
    const qrInputs = document.querySelectorAll('.qr-input');
    qrInputs.forEach(input => {
        input.addEventListener('change', function (event) {
            const filename = this.name;
            previewQRCode(event, filename);
        });
    });
}

function previewImage(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'File size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const previewWrapper = document.querySelector(`.${type}-preview-wrapper`);
        if (previewWrapper) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = `${type}-preview`;
            img.alt = `${type} preview`;

            // Remove existing content
            previewWrapper.innerHTML = '';
            previewWrapper.appendChild(img);
        }
    };
    reader.readAsDataURL(file);
}

function previewQRCode(event, fieldName) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file');
        return;
    }

    // Validate file size (max 2MB for QR)
    if (file.size > 2 * 1024 * 1024) {
        showAlert('error', 'QR code file size must be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        // Map field name to the closest preview wrapper
        let previewWrapper = null;
        
        if (fieldName === 'bankingQr') {
            previewWrapper = document.getElementById('bankingContent')?.querySelector('.qr-preview-wrapper');
            if (!previewWrapper) {
                const contentId = document.getElementById('bankingContent');
                if (contentId) {
                    previewWrapper = document.createElement('div');
                    previewWrapper.className = 'qr-preview-wrapper';
                    contentId.appendChild(previewWrapper);
                }
            }
        } else if (fieldName === 'momoQr') {
            previewWrapper = document.getElementById('momoContent')?.querySelector('.qr-preview-wrapper');
            if (!previewWrapper) {
                const contentId = document.getElementById('momoContent');
                if (contentId) {
                    previewWrapper = document.createElement('div');
                    previewWrapper.className = 'qr-preview-wrapper';
                    contentId.appendChild(previewWrapper);
                }
            }
        } else if (fieldName === 'zalopayQr') {
            previewWrapper = document.getElementById('zalopayContent')?.querySelector('.qr-preview-wrapper');
            if (!previewWrapper) {
                const contentId = document.getElementById('zalopayContent');
                if (contentId) {
                    previewWrapper = document.createElement('div');
                    previewWrapper.className = 'qr-preview-wrapper';
                    contentId.appendChild(previewWrapper);
                }
            }
        }

        if (previewWrapper) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'qr-preview';
            img.alt = 'QR Code preview';

            // Remove existing content
            previewWrapper.innerHTML = '';
            previewWrapper.appendChild(img);
        }
    };
    reader.readAsDataURL(file);
}

// ========================================
// FORM VALIDATION & SUBMISSION
// ========================================

function initializeFormSubmission() {
    const form = document.getElementById('settingForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
        if (!validateForm()) {
            event.preventDefault();
            showAlert('error', 'Please fill in all required fields correctly');
            return;
        }

        setSubmitButtonLoading(true);
    });
}

function validateForm() {
    const titleInput = document.querySelector('input[name="title"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const paginationInput = document.querySelector('input[name="paginationLimit"]');

    let isValid = true;

    // Validate title
    if (!titleInput.value.trim()) {
        highlightError(titleInput);
        isValid = false;
    } else {
        removeError(titleInput);
    }

    // Validate email if provided
    if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
        highlightError(emailInput);
        isValid = false;
    } else if (emailInput.value.trim()) {
        removeError(emailInput);
    }

    // Validate phone if provided
    if (phoneInput.value.trim() && !isValidPhone(phoneInput.value)) {
        highlightError(phoneInput);
        isValid = false;
    } else if (phoneInput.value.trim()) {
        removeError(phoneInput);
    }

    // Validate pagination limit
    if (!paginationInput.value || paginationInput.value < 1) {
        highlightError(paginationInput);
        isValid = false;
    } else {
        removeError(paginationInput);
    }

    // Validate social media URLs if provided
    const socialMediaInputs = document.querySelectorAll('input[name*="facebook"], input[name*="youtube"], input[name*="tiktok"], input[name*="instagram"], input[name*="zalo"]');
    socialMediaInputs.forEach(input => {
        if (input.value.trim() && !isValidURL(input.value)) {
            highlightError(input);
            isValid = false;
        } else if (input.value.trim()) {
            removeError(input);
        }
    });

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Vietnamese phone number format or international
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{7,}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function highlightError(input) {
    input.classList.add('is-invalid');
    input.style.borderColor = '#ff6b6b';
}

function removeError(input) {
    input.classList.remove('is-invalid');
    input.style.borderColor = '';
}

function setSubmitButtonLoading(isLoading) {
    const submitBtn = document.querySelector('.btn-submit');
    if (!submitBtn) return;

    if (isLoading) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving...</span>';
    } else {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Save Changes</span>';
    }
}

// ========================================
// ALERT NOTIFICATIONS
// ========================================

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <strong>${type === 'error' ? 'Error' : 'Success'}!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const container = document.querySelector('.settings-container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', function (event) {
    // Ctrl+S or Cmd+S to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const form = document.getElementById('settingForm');
        if (form) {
            form.submit();
        }
    }

    // Escape to cancel
    if (event.key === 'Escape') {
        const cancelBtn = document.querySelector('.btn-secondary');
        if (cancelBtn) {
            window.location.href = cancelBtn.href;
        }
    }
});

// ========================================
// PAGE LOAD ENHANCEMENTS
// ========================================

window.addEventListener('load', function () {
    // Smooth scroll to first error field if any
    const firstErrorField = document.querySelector('.is-invalid');
    if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
    }

    // Initialize tooltips if Bootstrap tooltips are available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// ========================================
// PREVENT ACCIDENTAL NAVIGATION
// ========================================

let formDirty = false;

document.getElementById('settingForm')?.addEventListener('change', function () {
    formDirty = true;
});

window.addEventListener('beforeunload', function (event) {
    if (formDirty) {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }
});

// Mark form as clean after successful submission
document.getElementById('settingForm')?.addEventListener('submit', function () {
    formDirty = false;
});
