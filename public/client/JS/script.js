/* ========== BOOKING PAGE FUNCTIONALITY ========== */

document.addEventListener('DOMContentLoaded', function () {
    const bookingContainer = document.querySelector('.booking-container');

    if (!bookingContainer) return;
    const formBooking = bookingContainer.querySelector('.booking-form');
    // ========== FIELD SELECTION ==========
    function initFieldSelection() {
        const fieldCards = document.querySelectorAll('.booking-field-card');
        const pricingList = document.querySelector(".booking-slots-grid");
        let selectedField = null;
        fieldCards.forEach(card => {
            card.addEventListener('click', () => {

                // Remove previous selection
                if (selectedField) {
                    selectedField.classList.remove('booking-field-card--selected');
                }

                // Select new field
                card.classList.add('booking-field-card--selected');

                selectedField = card;

                // Create URL
                const url = new URL(window.location.href);

                const id = card.getAttribute("data-field-id");

                let link = `${url.pathname}/field/${id}`;

                // Get date
                let date = searchBox.querySelector("input[name='date']").value;

                // Default today
                if (!date) {
                    date = new Date().toISOString().split('T')[0];
                }

                // Add query
                link += `?date=${date}`;

                // Fetch pricing
                fetch(link)
                    .then(res => res.json())
                    .then(data => {
                        let html = "";
                        data.pricings.forEach(item => {
                            html += `
                                <div class="booking-slot-card" data-slot-id=${item._id}>
                                    <div class="booking-slot-time">
                                        ${item.start_time}
                                    </div>
                                    <div class="booking-slot-duration">
                                        1 giờ
                                    </div>
                                </div>
                            `;
                        });
                        pricingList.innerHTML = html;
                    });
            });
        });
    }
    initFieldSelection();

    // // ========== SERVICE SELECTION ==========
    // const serviceCards = document.querySelectorAll('.booking-service-card');
    // serviceCards.forEach(card => {
    //     card.addEventListener('click', function () {
    //         const serviceId = this.dataset.serviceId;

    //         if (this.classList.contains('booking-service-card--selected')) {
    //             // Deselect service
    //             this.classList.remove('booking-service-card--selected');
    //             selectedServices.delete(serviceId);
    //         } else {
    //             // Select service
    //             this.classList.add('booking-service-card--selected');
    //             selectedServices.add(serviceId);
    //         }

    //         // Update summary
    //         updateSummary();
    //     });
    // });

    // // ========== SUMMARY UPDATE FUNCTION ==========
    // function updateSummary() {
    //     const selectedFieldElement = document.querySelector('.booking-selected-field');
    //     const selectedServicesElement = document.querySelector('.booking-selected-services');
    //     const servicesCountElement = document.querySelector('.booking-services-count');
    //     const totalPriceElement = document.querySelector('.booking-total-price');

    //     let fieldName = 'Chưa chọn';
    //     let fieldPrice = 0;
    //     let servicesPrice = 0;
    //     let servicesList = [];

    //     // Get selected field info
    //     if (selectedField) {
    //         const fieldNameElement = selectedField.querySelector('.booking-field-name');
    //         const priceElement = selectedField.querySelector('.booking-price-number');

    //         fieldName = fieldNameElement ? fieldNameElement.textContent : 'Chưa chọn';
    //         fieldPrice = parseInt(priceElement?.textContent?.replace(/\D/g, '') || 0);
    //     }

    //     // Get selected services info
    //     selectedServices.forEach(serviceId => {
    //         const serviceCard = document.querySelector(`.booking-service-card[data-service-id="${serviceId}"]`);
    //         if (serviceCard) {
    //             const serviceName = serviceCard.querySelector('.booking-service-name');
    //             const servicePrice = serviceCard.querySelector('.booking-service-price');

    //             if (serviceName) {
    //                 servicesList.push(serviceName.textContent);
    //             }

    //             if (servicePrice) {
    //                 const price = parseInt(servicePrice.textContent.replace(/\D/g, '') || 0);
    //                 servicesPrice += price;
    //             }
    //         }
    //     });

    //     // Update DOM elements
    //     selectedFieldElement.textContent = fieldName;

    //     if (servicesList.length > 0) {
    //         selectedServicesElement.textContent = servicesList.join(', ');
    //     } else {
    //         selectedServicesElement.textContent = 'Chưa chọn';
    //     }

    //     servicesCountElement.textContent = `(${selectedServices.size} dịch vụ)`;

    //     // Calculate and display total
    //     const totalPrice = fieldPrice + servicesPrice;
    //     totalPriceElement.textContent = totalPrice.toLocaleString('vi-VN');
    // }

    // // ========== ACTION BUTTONS ==========
    // const clearBtn = document.querySelector('.booking-btn--secondary');
    // const submitBtn = document.querySelector('.booking-btn--primary');

    // if (clearBtn) {
    //     clearBtn.addEventListener('click', function () {
    //         // Clear field selection
    //         fieldCards.forEach(card => card.classList.remove('booking-field-card--selected'));
    //         selectedField = null;

    //         // Clear service selections
    //         serviceCards.forEach(card => card.classList.remove('booking-service-card--selected'));
    //         selectedServices.clear();

    //         // Update summary
    //         updateSummary();
    //     });
    // }

    // if (submitBtn) {
    //     submitBtn.addEventListener('click', function () {
    //         if (!selectedField) {
    //             alert('Vui lòng chọn một sân bóng');
    //             return;
    //         }

    //         // Prepare booking data
    //         const bookingData = {
    //             fieldId: selectedField.dataset.fieldId,
    //             fieldName: selectedField.querySelector('.booking-field-name').textContent,
    //             fieldPrice: parseInt(selectedField.querySelector('.booking-price-number').textContent.replace(/\D/g, '')),
    //             services: Array.from(selectedServices),
    //             totalServices: selectedServices.size,
    //             totalPrice: parseInt(document.querySelector('.booking-total-price').textContent.replace(/\D/g, ''))
    //         };

    //         // Log booking data (for now)
    //         console.log('Booking Data:', bookingData);

    //         // You can store this data in localStorage or send it to the server
    //         localStorage.setItem('bookingData', JSON.stringify(bookingData));

    //         // Redirect to next step or show confirmation
    //         alert('Đặt sân thành công! Chuyển đến thanh toán...');
    //         // window.location.href = '/checkout'; // Uncomment when ready
    //     });
    // }

    // // ========== INITIALIZE SUMMARY ==========
    // updateSummary();

    // Tìm kiếm sân
    const searchBox = document.querySelector(".gf-search-box");

    if (searchBox) {

        const inputs = searchBox.querySelectorAll("input, select");

        const fieldList = document.querySelector(".booking-fields-grid");

        inputs.forEach(input => {

            input.addEventListener("change", async () => {

                const date = searchBox.querySelector(
                    "input[name='date']"
                ).value;

                const type = searchBox.querySelector(
                    "select[name='type']"
                ).value;
                const address = searchBox.querySelector(
                    "select[name='address']"
                ).value;
                dataQuery = {};
                if(date){
                    dataQuery.date = date;
                }
                if(type){
                    dataQuery.type = type;
                }
                if(address){
                    dataQuery.address = address;
                }
                const query = new URLSearchParams(dataQuery);
                console.log(query.toString());
                try {

                    fieldList.classList.add("loading");

                    fetch(
                        `/booking/filter?${query.toString()}`
                    )
                        .then(res => res.json())
                        .then(data => {
                            let html = "";
                            data.fields.forEach(item =>{
                                html += `
                                    <div class="booking-field-card" data-field-id=${item._id}>
                                        <div class="booking-field-image">
                                            <img src=${item.image}>
                                        </div>
                                        <div class="booking-field-content">
                                            <h3 class="booking-field-name">${item.name}</h3>
                                            <div class="booking-field-type">Loại: ${item.type}v${item.type}</div>
                                            <div class="booking-field-location">
                                                <a href=${item.address.googleMapUrl} target="_blank"></a>📍 ${item.address.titleAddress}
                                            </div>
                                            <div class="booking-field-footer">
                                                <div class="booking-field-price">
                                                    <span class="booking-price-number">${item.price.price}</span>
                                                    <span class="booking-price-unit">đ/giờ</span>
                                                </div>
                                                <div class="booking-field-status booking-field-status--available">
                                                    <span>Sẵn sàng</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    `;
                            });
                            fieldList.innerHTML = html;
                            fieldList.classList.remove("loading");
                            initFieldSelection();
                        });

                } catch (error) {

                    console.log(error);

                } finally {
                    fieldList.classList.remove("loading");
                }

            });

        });

    }

    // Cấu hình thời gian tối thiểu cho input date
    const dataInput = document.querySelector("input[name='date']");
    if (dataInput) {
        const today = new Date().toISOString().split('T')[0];
        dataInput.setAttribute("min", today);
    }

    // Chọn sân
    const fieldList = document.querySelectorAll(".booking-field-card");
    if (fieldList) {
        fieldList.forEach(field => {
            field.addEventListener("click", () => {
                fieldList.forEach(f => f.classList.remove("booking-field-card--selected"));
                field.classList.add("booking-field-card--selected");
            });
        });
    }
});


