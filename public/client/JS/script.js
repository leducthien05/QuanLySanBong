/* ========== BOOKING PAGE FUNCTIONALITY ========== */

document.addEventListener('DOMContentLoaded', function () {
    const bookingContainer = document.querySelector('.booking-container');
    
    if (!bookingContainer) return;

    // ========== FIELD SELECTION ==========
    const fieldCards = document.querySelectorAll('.booking-field-card');
    let selectedField = null;

    fieldCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove previous selection
            if (selectedField) {
                selectedField.classList.remove('booking-field-card--selected');
            }

            // Select new field
            this.classList.add('booking-field-card--selected');
            selectedField = this;

            // Update summary
            updateSummary();
        });
    });

    // ========== SERVICE SELECTION ==========
    const serviceCards = document.querySelectorAll('.booking-service-card');
    const selectedServices = new Set();

    serviceCards.forEach(card => {
        card.addEventListener('click', function () {
            const serviceId = this.dataset.serviceId;

            if (this.classList.contains('booking-service-card--selected')) {
                // Deselect service
                this.classList.remove('booking-service-card--selected');
                selectedServices.delete(serviceId);
            } else {
                // Select service
                this.classList.add('booking-service-card--selected');
                selectedServices.add(serviceId);
            }

            // Update summary
            updateSummary();
        });
    });

    // ========== SUMMARY UPDATE FUNCTION ==========
    function updateSummary() {
        const selectedFieldElement = document.querySelector('.booking-selected-field');
        const selectedServicesElement = document.querySelector('.booking-selected-services');
        const servicesCountElement = document.querySelector('.booking-services-count');
        const totalPriceElement = document.querySelector('.booking-total-price');

        let fieldName = 'Chưa chọn';
        let fieldPrice = 0;
        let servicesPrice = 0;
        let servicesList = [];

        // Get selected field info
        if (selectedField) {
            const fieldNameElement = selectedField.querySelector('.booking-field-name');
            const priceElement = selectedField.querySelector('.booking-price-number');
            
            fieldName = fieldNameElement ? fieldNameElement.textContent : 'Chưa chọn';
            fieldPrice = parseInt(priceElement?.textContent?.replace(/\D/g, '') || 0);
        }

        // Get selected services info
        selectedServices.forEach(serviceId => {
            const serviceCard = document.querySelector(`.booking-service-card[data-service-id="${serviceId}"]`);
            if (serviceCard) {
                const serviceName = serviceCard.querySelector('.booking-service-name');
                const servicePrice = serviceCard.querySelector('.booking-service-price');
                
                if (serviceName) {
                    servicesList.push(serviceName.textContent);
                }
                
                if (servicePrice) {
                    const price = parseInt(servicePrice.textContent.replace(/\D/g, '') || 0);
                    servicesPrice += price;
                }
            }
        });

        // Update DOM elements
        selectedFieldElement.textContent = fieldName;

        if (servicesList.length > 0) {
            selectedServicesElement.textContent = servicesList.join(', ');
        } else {
            selectedServicesElement.textContent = 'Chưa chọn';
        }

        servicesCountElement.textContent = `(${selectedServices.size} dịch vụ)`;

        // Calculate and display total
        const totalPrice = fieldPrice + servicesPrice;
        totalPriceElement.textContent = totalPrice.toLocaleString('vi-VN');
    }

    // ========== ACTION BUTTONS ==========
    const clearBtn = document.querySelector('.booking-btn--secondary');
    const submitBtn = document.querySelector('.booking-btn--primary');

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            // Clear field selection
            fieldCards.forEach(card => card.classList.remove('booking-field-card--selected'));
            selectedField = null;

            // Clear service selections
            serviceCards.forEach(card => card.classList.remove('booking-service-card--selected'));
            selectedServices.clear();

            // Update summary
            updateSummary();
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            if (!selectedField) {
                alert('Vui lòng chọn một sân bóng');
                return;
            }

            // Prepare booking data
            const bookingData = {
                fieldId: selectedField.dataset.fieldId,
                fieldName: selectedField.querySelector('.booking-field-name').textContent,
                fieldPrice: parseInt(selectedField.querySelector('.booking-price-number').textContent.replace(/\D/g, '')),
                services: Array.from(selectedServices),
                totalServices: selectedServices.size,
                totalPrice: parseInt(document.querySelector('.booking-total-price').textContent.replace(/\D/g, ''))
            };

            // Log booking data (for now)
            console.log('Booking Data:', bookingData);
            
            // You can store this data in localStorage or send it to the server
            localStorage.setItem('bookingData', JSON.stringify(bookingData));
            
            // Redirect to next step or show confirmation
            alert('Đặt sân thành công! Chuyển đến thanh toán...');
            // window.location.href = '/checkout'; // Uncomment when ready
        });
    }

    // ========== INITIALIZE SUMMARY ==========
    updateSummary();
});
