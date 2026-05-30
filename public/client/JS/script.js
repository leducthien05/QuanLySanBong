/* ========== BOOKING PAGE FUNCTIONALITY ========== */

document.addEventListener('DOMContentLoaded', function () {
    const bookingContainer = document.querySelector('.booking-container');

    if (!bookingContainer) return;
    const formBooking = bookingContainer.querySelector('.booking-form');
    const bookingData = {}
    // ========== FIELD SELECTION ==========
    function initFieldSelection() {
        const fieldCards = document.querySelectorAll('.booking-field-card');
        const pricingList = document.querySelector(".booking-slots-grid");
        let selectedField = null;
        fieldCards.forEach(card => {
            card.addEventListener('click', () => {
                // Reset data
                bookingData.pricing = [];
                bookingData.price = 0;

                bookingData.date = "";
                bookingData.type = "";
                bookingData.address = "";
                bookingData.field_id = "";
                bookingData.field_name = "";

                bookingData.service = [];
                bookingData.payment = null;
                // Thêm id và tên sân
                bookingData.field_id = card.getAttribute("data-field-id");
                const dataField = JSON.parse(card.getAttribute("data-field"));
                bookingData.field_name = dataField.name;
                // Remove previous selection
                if (selectedField) {
                    selectedField.classList.remove('booking-field-card--selected');
                }
                // Lấy địa chỉ
                const address = dataField.address.titleAddress
                bookingData.address = address;
                // Lấy loại sân
                const type = dataField.type;
                bookingData.type = type;
                // Select new field
                card.classList.add('booking-field-card--selected');

                selectedField = card;
                // Thời gian đã chọn
                const divTime = document.querySelector(".booking-selected-time");
                const timeText = divTime.querySelector("#selectedTimeText");
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
                        timeText.textContent = data.date ? `${data.date}` : "Chưa chọn khung giờ";
                        let html = "";
                        data.pricings.forEach(item => {
                            if (item.feature == "1") {
                                if (item.status == "booked") {
                                    html += `
                                        <div class="booking-slot-card booked vip" data-slot-id=${item._id}>
                                            <div class="booking-slot-time">
                                                ${item.start_time}
                                            </div>
                                            <div class="booking-slot-duration">
                                                1 giờ
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    html += `
                                        <div class="booking-slot-card vip" data-slot-id=${item._id}>
                                            <div class="booking-slot-time">
                                                ${item.start_time}
                                            </div>
                                            <div class="booking-slot-duration">
                                                1 giờ
                                            </div>
                                        </div>
                                    `;
                                }
                            } else {
                                if (item.status == "booked") {
                                    html += `
                                        <div class="booking-slot-card booked" data-slot-id=${item._id}>
                                            <div class="booking-slot-time">
                                                ${item.start_time}
                                            </div>
                                            <div class="booking-slot-duration">
                                                1 giờ
                                            </div>
                                        </div>
                                    `;
                                } else {
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
                                }

                            }

                        });
                        pricingList.innerHTML = html;
                        const listSlot = document.querySelectorAll(".booking-slot-card");
                        bookingData.pricing = [];
                        bookingData.price = 0;
                        if (listSlot.length > 0) {
                            listSlot.forEach(item => {
                                item.addEventListener("click", (e) => {
                                    if (item.classList.contains("booked")) {
                                        return;
                                    }
                                    const id = item.getAttribute("data-slot-id");
                                    const pricing = item.querySelector(".booking-slot-time");
                                    const dataField = JSON.parse(card.getAttribute("data-field"));
                                    const textTime = pricing.textContent;

                                    const index = bookingData.pricing.findIndex(
                                        item => item.pricing_id === id
                                    );

                                    if (index !== -1) {
                                        bookingData.pricing.splice(index, 1);

                                        item.classList.remove("selected");

                                        if (item.classList.contains("vip")) {
                                            bookingData.price -= dataField.price.priceVip;
                                        } else {
                                            bookingData.price -= dataField.price.price;
                                        }
                                    } else {
                                        bookingData.pricing.push({
                                            pricing_id: id,
                                            time: textTime
                                        });

                                        item.classList.add("selected");

                                        if (item.classList.contains("vip")) {
                                            bookingData.price += dataField.price.priceVip;
                                        } else {
                                            bookingData.price += dataField.price.price;
                                        }
                                    }
                                });
                            });
                        }
                    });
            });
        });
    }
    initFieldSelection();

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
                if (date) {
                    dataQuery.date = date;
                    bookingData.date = date
                } else {
                    const today = new Date().toISOString().split("T")[0];
                    bookingData.data = today;
                }
                if (type) {
                    dataQuery.type = type;
                    bookingData.type = type
                }
                if (address) {
                    dataQuery.address = address;
                    bookingData.address = address
                }
                const query = new URLSearchParams(dataQuery);
                try {

                    fieldList.classList.add("loading");

                    fetch(
                        `/booking/filter?${query.toString()}`
                    )
                        .then(res => res.json())
                        .then(data => {
                            let html = "";
                            data.fields.forEach(item => {
                                const dataField = JSON.stringify(item);
                                html += `
                                    <div class="booking-field-card" data-field-id=${item._id} data-field='${dataField}'>
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

    // // ========== SERVICE SELECTION ==========
    const serviceCards = document.querySelectorAll('.booking-service-card');
    bookingData.service = [];
    serviceCards.forEach(card => {
        card.addEventListener('click', function () {
            const serviceId = card.getAttribute("data-service-id");
            if (bookingData.service.includes(serviceId)) {
                // xóa khỏi mảng
                const index = bookingData.service.indexOf(serviceId);
                bookingData.service.splice(index, 1);
                // bỏ class UI
                card.classList.remove("booking-service-card--selected");
            } else {
                bookingData.service.push(serviceId);
                card.classList.add("booking-service-card--selected");
            }
        });
    });

    // Mở model
    const btnOpenModel = document.querySelector(".booking-confirm-button");
    if (btnOpenModel) {
        const modelForm = document.querySelector(".booking-modal-overlay.hidden");
        const valueField = modelForm.querySelector(".booking-modal-field-name");
        const valueLocation = modelForm.querySelector(".booking-modal-field-location");
        const valueType = modelForm.querySelector(".booking-modal-field-type");
        const valueDate = modelForm.querySelector(".booking-modal-field-date");
        const valueTime = modelForm.querySelector(".booking-modal-field-times");
        const valueAmount = modelForm.querySelector(".booking-modal-total-amount");
        btnOpenModel.addEventListener("click", () => {
            if (bookingData.field_name) {
                valueField.textContent = bookingData.field_name;
            }
            if (bookingData.address) {
                valueLocation.textContent = bookingData.address;
            }
            if (bookingData.type) {
                valueType.textContent = bookingData.type;
            }
            if (bookingData.date) {
                valueDate.textContent = bookingData.date;
            } else {
                const today = new Date().toISOString().split("T")[0];
                valueDate.textContent = today;
            }
            if (bookingData.pricing && bookingData.pricing.length > 0) {
                let string = "";
                bookingData.pricing.forEach(item => {
                    string += item.time;
                });
                valueTime.textContent = string;
            }
            if (bookingData.price) {
                valueAmount.textContent = bookingData.price.toLocaleString("vi-VN") + " đ";;
            }
            modelForm.classList.remove("hidden");
            modelForm.classList.add("active");
        });
        const btnCloseForm = modelForm.querySelector(".booking-modal-close");
        if (btnCloseForm) {
            btnCloseForm.addEventListener("click", () => {
                modelForm.classList.remove("active");
                modelForm.classList.add("hidden");
            });
        }
    }

    // Payment method
    const paymentCard = document.querySelector(".booking-payment-grid");

    if (paymentCard) {

        bookingData.payment = null;

        const listPayment = paymentCard.querySelectorAll(".payment-method-card");

        if (listPayment.length > 0) {

            listPayment.forEach(item => {

                item.addEventListener("click", () => {

                    // remove active cũ
                    listPayment.forEach(card => {
                        card.classList.remove("payment-method-card--active");
                    });

                    // active card mới
                    item.classList.add("payment-method-card--active");

                    // lưu dữ liệu
                    bookingData.payment = item.getAttribute("data-payment-method");
                });

            });

        }
    }
});


