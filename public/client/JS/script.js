/* ========== BOOKING PAGE FUNCTIONALITY ========== */

document.addEventListener('DOMContentLoaded', function () {

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
                    bookingData.date = date;
                } else {
                    bookingData.date = date;
                }

                // Add query
                link += `?date=${date}`;

                // Fetch pricing
                fetch(link)
                    .then(res => res.json())
                    .then(data => {
                        timeText.textContent = data.date ? `${data.date}` : "Chưa chọn khung giờ";
                        let html = "";
                        console.log(data.pricings)
                        data.pricings.forEach(item => {
                            if (item.feature == "1") {
                                if (item.booked == "1" || item.disable == "1") {
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
                                if (item.booked == "1" || item.disable == "1") {
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

    // Tìm kiếm sân theo select
    const searchBox = document.querySelector(".gf-search-box");

    if (searchBox) {

        const inputs = searchBox.querySelectorAll("input, select");

        const fieldList = document.querySelector(".booking-fields-grid");

        inputs.forEach(input => {

            input.addEventListener("change", async () => {
                // Lấy giá trị ngày
                const date = searchBox.querySelector("input[name='date']").value;

                // Lấy giá trị loại sân
                const type = searchBox.querySelector("select[name='type']").value;

                // Lấy địa chỉ
                const address = searchBox.querySelector("select[name='address']").value;

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
                                            <img src=${item.image[0]}>
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

    // ========== FIELD NAME SEARCH ==========

    const inputName = document.querySelector("input[name='fieldName']");
    const searchResultContainer = document.querySelector(".search-result");
    const searchResultList = document.querySelector(".search-result-list");

    if (inputName && searchResultContainer) {

        inputName.addEventListener("keyup", () => {
            const keyword = inputName.value;

            if (!keyword) {
                searchResultContainer.classList.add("hidden");
                return;
            }

            try {
                const link = `/booking/filter?keyword=${keyword}`;
                fetch(link)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        const fields = data;
                        if (!fields || fields.length === 0) {
                            searchResultList.innerHTML = `<div class="search-result-empty">Không tìm thấy sân phù hợp</div>`;
                            searchResultContainer.classList.remove("hidden");
                            return;
                        }
                        let html = "";
                        fields.forEach(field => {
                            html += `
                                <a href="/fields/${field.slug}" class="search-result-item">
                                    <div class="search-result-item-thumbnail">
                                        <img src="${field.thumbnail}" alt="${field.title}">
                                    </div>
                                    <div class="search-result-item-content">
                                        <div class="search-result-item-title">${field.title}</div>
                                        <div class="search-result-item-address">${field.address}</div>
                                    </div>
                                </a>
                            `;
                        });

                        searchResultList.innerHTML = html;
                        searchResultContainer.classList.remove("hidden");

                    });

            } catch (error) {
                console.error("Search error:", error);
                searchResultList.innerHTML = `<div class="search-result-empty">Có lỗi khi tìm kiếm</div>`;
                searchResultContainer.classList.remove("hidden");
            }
        });

        inputName.addEventListener("focus", () => {
            if (inputName.value.trim() && !searchResultContainer.classList.contains("hidden")) {
                searchResultContainer.classList.remove("hidden");
            }
        });
    };

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
            const nameService = card.querySelector(".booking-service-name").textContent;
            const index = bookingData.service.findIndex(
                item => item.service_id === serviceId
            );

            if (index !== -1) {
                bookingData.service.splice(index, 1);
                card.classList.remove("booking-service-card--selected");
            } else {
                bookingData.service.push({
                    service_id: serviceId,
                    name: nameService
                });
                card.classList.add("booking-service-card--selected");
            }
        });
    });
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
                    bookingData.namePayment = item.querySelector(".payment-method-title").textContent;
                });

            });

        }
    }
    // Mở model
    const btnOpenModel = document.querySelector(".booking-confirm-button");
    if (btnOpenModel) {
        const modelForm = document.querySelector(".booking-modal-overlay.hidden");
        const valueField = modelForm.querySelector(".booking-modal-field-name");
        const valueLocation = modelForm.querySelector(".booking-modal-field-location");
        const valueType = modelForm.querySelector(".booking-modal-field-type");
        const valueDate = modelForm.querySelector(".booking-modal-field-date");
        const valueTime = modelForm.querySelector(".booking-modal-field-times");
        const valuePayment = modelForm.querySelector(".booking-modal-field-payment");
        const valueService = modelForm.querySelector(".booking-modal-field-service");
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
            if (bookingData.service && bookingData.service.length > 0) {
                let string = "";
                bookingData.service.forEach(item => {
                    string += item.name;
                });
                valueService.textContent = string;
            }
            if (bookingData.payment) {
                valuePayment.textContent = bookingData.namePayment;
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
    const btnBooking = document.querySelector(".booking-modal-pay");
    if (btnBooking) {
        const formBooking = document.querySelector('.booking-form');
        const inputBooking = formBooking.querySelector("input");
        const modelForm = document.querySelector(".booking-modal-overlay");
        btnBooking.addEventListener("click", () => {

            if (!bookingData.field_id) {
                alert('Vui lòng chọn một sân bóng');
                return;
            }
            if (!bookingData.field_name) {
                alert('Vui lòng chọn một sân bóng');
                return;
            }
            if (!bookingData.address) {
                alert('Vui lòng chọn địa điểm');
                return;
            }
            if (!bookingData.type) {
                alert('Vui lòng chọn loại sân');
                return;
            }
            if (!bookingData.field_name) {
                alert('Vui lòng chọn một sân bóng');
                return;
            }
            if (!bookingData.date) {
                const today = new Date().toISOString().split("T")[0];
                bookingData.date = today;
            }
            if (!bookingData.pricing || !bookingData.pricing.length > 0) {
                alert('Vui lòng chọn slot đặt sân');
                return;
            } else {
                bookingData.pricing = bookingData.pricing.map(item => item.pricing_id);
            }
            if (!bookingData.payment) {
                alert('Vui lòng chọn phương thức thanh toán');
                return;
            }
            const valueNode = modelForm.querySelector(".booking-modal-row-note textarea").value;
            if (valueNode != "") {
                bookingData.node = valueNode;
            }
            const dataPostBooking = JSON.stringify(bookingData);
            inputBooking.value = dataPostBooking;
            formBooking.submit();
        });
    }

    function initPaymentSuccessModal() {
        const overlay = document.querySelector('.payment-success-modal-overlay');
        const payloadEl = document.querySelector('#paymentSuccessPayload');
        if (!overlay) return;

        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        if (status !== 'success') return;

        let payload = {};
        try {
            payload = payloadEl ? JSON.parse(payloadEl.textContent || '{}') : {};
        } catch (error) {
            payload = {};
        }

        const fieldNameElement = overlay.querySelector('.payment-success-field-name');
        const locationElement = overlay.querySelector('.payment-success-field-location');
        const datetimeElement = overlay.querySelector('.payment-success-field-datetime');
        const totalElement = overlay.querySelector('.payment-success-field-total');

        fieldNameElement.textContent = payload.fieldName || 'Không xác định';
        locationElement.textContent = payload.location || 'Không xác định';
        datetimeElement.textContent = payload.date && payload.timeRange ? `${payload.date} • ${payload.timeRange}` : 'Không xác định';
        totalElement.textContent = payload.totalPrice || 'Không xác định';

        overlay.classList.remove('hidden');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const closeButtons = overlay.querySelectorAll('.payment-success-close, .payment-success-home');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                overlay.classList.remove('active');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
                if (button.classList.contains('payment-success-home')) {
                    window.location.href = '/';
                    return;
                }
                url.searchParams.delete('status');
                url.searchParams.delete('booking_id');
                window.history.replaceState({}, document.title, url.pathname + url.search);
            });
        });
    }

    initPaymentSuccessModal();


    // =================================================/field===========================================

    // Vẽ bản ghi ra giao diện

    // 1. Vẽ dạng danh sách
    function renderFields(fields) {
        const container = document.querySelector(".field-list");

        container.innerHTML = fields.map(item => `
            <div class="field-card">

                <div class="field-card-image">
                    <a href="${item.address.googleMapUrl}">
                        <img
                            src="${item.image}"
                            alt="${item.name}"
                        >
                    </a>
                </div>

                <div class="field-card-content">

                    <div class="field-card-header">
                        <h3 class="field-card-title">
                            ${item.name}
                        </h3>

                        ${item.available ? `
                            <span class="field-status">
                                Còn trống
                            </span>
                        ` : ""}
                    </div>

                    <div class="field-address">
                        <a
                            href="${item.address.googleMapUrl}"
                            target="_blank"
                        >
                            📍 ${item.address.titleAddress}
                        </a>
                    </div>

                    <div class="field-description">
                        ${item.description || ""}
                    </div>

                    <div class="field-card-footer">

                        <div class="field-rating">
                            ⭐ ${item.rating.totalRating}
                            (${item.rating.totalReviews} đánh giá)
                        </div>

                        <div class="field-price">
                            ${Number(item.price.price).toLocaleString("vi-VN")}
                            <span> đ/giờ</span>
                        </div>

                        <a
                            class="field-book-btn"
                            href="/field/${item._id}"
                        >
                            Đặt ngay
                        </a>

                    </div>

                </div>

            </div>
        `).join("");
    }

    // 2. Vẽ dạng lưới
    function renderGrid(fields) {
        const container = document.querySelector(".booking-fields-grid");

        container.innerHTML = fields.map(item => `
            <div
                class="booking-field-card"
                data-field-id="${item._id}"
            >

                <div class="booking-field-image">
                    <img src="${item.image}">
                </div>

                <div class="booking-field-content">

                    <h3 class="booking-field-name">
                        ${item.name}
                    </h3>

                    <div class="booking-field-type">
                        Loại: ${item.type}v${item.capacity}
                    </div>

                    <div class="booking-field-location">
                        <a href="${item.address.googleMapUrl}">
                            📍 ${item.address.titleAddress}
                        </a>
                    </div>

                    <div class="booking-field-rating">
                        <span class="booking-stars">
                            ${"⭐".repeat(item.rating.totalRating)}
                        </span>

                        <span class="booking-rating-number">
                            (${item.rating.totalRating})
                        </span>
                    </div>

                    <div class="booking-field-footer">

                        <div class="booking-field-price">
                            <span class="booking-price-number">
                                ${Number(item.price.price)
                .toLocaleString("vi-VN")}
                            </span>

                            <span class="booking-price-unit">
                                đ/giờ
                            </span>
                        </div>

                        <div class="booking-field-status booking-field-status--available">
                            <span>Sẵn sàng</span>
                        </div>

                    </div>

                </div>

            </div>
        `).join("");
    }

    // Hiển thị danh sách sân
    const frontField = document.querySelectorAll(".field-view-switch .view-btn");
    if (frontField.length > 0) {
        const viewGrid = document.querySelector(".field-page .field-grid-page");
        const viewList = document.querySelector(".field-page .field-list");

        // Style hiển thị danh sách sân
        const view = localStorage.getItem("view");

        if (view == "view-list") {
            const btnList = document.querySelector(".field-hero .field-view-switch .list").classList.add("active");
            const btnGrid = document.querySelector(".field-hero .field-view-switch .grid").classList.remove("active");
            viewGrid.classList.add("hidden");
            viewList.classList.remove("hidden");
        } else {
            const btnList = document.querySelector(".field-hero .field-view-switch .list").classList.remove("active");
            const btnGrid = document.querySelector(".field-hero .field-view-switch .grid").classList.add("active");
            viewList.classList.add("hidden");
            viewGrid.classList.remove("hidden");
        }

        // const viewMap = document.querySelector("")
        frontField.forEach(btn => {
            btn.addEventListener("click", (e) => {
                frontField.forEach(item => {
                    item.classList.remove("active");
                });
                btn.classList.add("active")
                const valueStyle = btn.getAttribute("value-style");
                if (valueStyle == "view-grid") {
                    viewGrid.classList.remove("hidden");
                    viewList.classList.add("hidden");
                }

                if (valueStyle == "view-list") {
                    viewGrid.classList.add("hidden");
                    viewList.classList.remove("hidden");
                }
                localStorage.setItem("view", valueStyle);
            });
        });
    }


    let dataQuery = {};
    function loadField(dataQuery) {
        const query = new URLSearchParams(dataQuery);
        let link = `/field/search?${query.toString()}`;
        fetch(link)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    renderFields(data.data);
                    renderGrid(data.data);
                }
            });
    }
    // Lọc sân theo loại
    const typeSearch = document.querySelectorAll(".field-tags .field-tag");
    if (typeSearch.length > 0) {
        typeSearch.forEach(item => {
            item.addEventListener("click", (e) => {
                typeSearch.forEach(btn => {
                    btn.classList.remove("active");
                });
                item.classList.add("active");
                const valueType = item.getAttribute("data-type");
                if (valueType) {
                    dataQuery.type = valueType;
                } else {
                    delete dataQuery.type;
                }
                loadField(dataQuery);
            });
        });
    }

    // Lọc sân theo tiêu chí
    const sortField = document.querySelector(".field-sort");
    if (sortField) {
        sortField.addEventListener("change", (e) => {
            const value = sortField.value;
            const [sortKey, sortValue] = value.split("-");

            if (sortKey && sortValue) {
                dataQuery.sortKey = sortKey;
                dataQuery.sortValue = sortValue;
            }
            loadField(dataQuery);
        });
    }

    // Phân trang
    const itemPage = document.querySelectorAll(".pagination .page-link");
    if (itemPage.length > 0) {
        const liList = document.querySelectorAll(".page-item");
        itemPage.forEach(btn => {
            btn.addEventListener("click", () => {
                liList.forEach(item => {
                    item.classList.remove("active");
                });
                const parentLi = btn.closest("li");
                if (parentLi) {
                    parentLi.classList.add("active");
                }
                const value = btn.getAttribute("number-page");

                if (value) {
                    dataQuery.page = value;
                }
                loadField(dataQuery);
            });
        });
    }


    // Tìm kiếm sân theo tên
    const inputNameFieldPage = document.querySelector(".field-page .field-search .field-search-input");
    const searchResultFieldPage = document.querySelector(".field-page .field-search .search-result");
    const searchResultListFieldPage = document.querySelector(".field-page .field-search .search-result-list");

    if (inputNameFieldPage && searchResultFieldPage) {

        inputNameFieldPage.addEventListener("keyup", () => {
            const keyword = inputNameFieldPage.value;

            if (!keyword) {
                searchResultFieldPage.classList.add("hidden");
                return;
            }

            try {
                const link = `/field/search?keyword=${keyword}`;
                fetch(link)
                    .then(res => res.json())
                    .then(data => {
                        const fields = data.data;
                        console.log(fields)
                        if (!fields || fields.length === 0) {
                            searchResultListFieldPage.innerHTML = `<div class="search-result-empty">Không tìm thấy sân phù hợp</div>`;
                            searchResultFieldPage.classList.remove("hidden");
                            return;
                        }
                        let html = "";
                        fields.forEach(field => {
                            html += `
                                <a href="/field/${field.slug}" class="search-result-item">
                                    <div class="search-result-item-thumbnail">
                                        <img src="${field.image}" alt="${field.name}">
                                    </div>
                                    <div class="search-result-item-content">
                                        <div class="search-result-item-title">${field.name}</div>
                                        <div class="search-result-item-address">${field.address.addressTitle}</div>
                                    </div>
                                </a>
                            `;
                        });

                        searchResultListFieldPage.innerHTML = html;
                        searchResultFieldPage.classList.remove("hidden");

                    });

            } catch (error) {
                console.error("Search error:", error);
                searchResultListFieldPage.innerHTML = `<div class="search-result-empty">Có lỗi khi tìm kiếm</div>`;
                searchResultFieldPage.classList.remove("hidden");
            }
        });

        inputNameFieldPage.addEventListener("focus", () => {
            if (inputNameFieldPage.value.trim() && !searchResultFieldPage.classList.contains("hidden")) {
                searchResultFieldPage.classList.remove("hidden");
            }
        });
        document.addEventListener("click", (e) => {
            const fieldSearch = document.querySelector(".field-page .field-search");

            if (!fieldSearch.contains(e.target)) {
                searchResultFieldPage.classList.add("hidden");
            }
        });
    };

    // Đặt lịch
    const formPricingDetail = document.querySelector(".booking-sidebar .booking-form");
    if (formPricingDetail) {
        const inputPricing = formPricingDetail.querySelector("input[name='bookingData']");
        const dataPricingDetail = {};
        const selectDate = document.querySelector(".date-pricing");
        if (selectDate) {
            const listBtnPricing = document.querySelectorAll(".time-slots .time-slot")
            selectDate.addEventListener("change", (e) => {
                const date = selectDate.value;
                const slug = selectDate.getAttribute("data-slug");
                const link = `/field/pricing/${slug}?date=${date}`;
                console.log(link)
                fetch(link)
                    .then(res => res.json())
                    .then(data => {
                        const divPricing = document.querySelector(".time-slots")
                        let html = "";
                        data.pricing.forEach(slot => {
                            const isDisabled = slot.booked === "1" || slot.disable === "1";

                            html += `
                            <button
                                type="button"
                                class="time-slot ${isDisabled ? "booked" : ""}"
                                data-pricing="${slot._id}"
                                ${isDisabled ? "disabled" : ""}
                            >
                                ${slot.start_time}
                                ${slot.feature === "1"
                                    ? "<small>Cao điểm</small>"
                                    : ""
                                }
                            </button>
                        `;
                        });

                        divPricing.innerHTML = html;
                    });
            });
        }
        const listBtnPricing = document.querySelectorAll(".time-slots .time-slot")
        if (listBtnPricing.length > 0) {
            dataPricingDetail.pricing = [];
            listBtnPricing.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    if (btn.classList.contains("selected")) {
                        btn.classList.remove("selected");
                    } else {
                        btn.classList.add("selected");
                    }
                    const id = btn.getAttribute("data-pricing");
                    if (dataPricingDetail.pricing.includes(id)) {
                        const index = dataPricingDetail.indexOf(id);
                        dataPricingDetail.pricing.splice(index, 1);
                    } else {
                        dataPricingDetail.pricing.push(id);
                    }

                });
            });
        }

        // Chọn Dịch vụ và Thanh toán
        const btnShow = formPricingDetail.querySelector(".btn-book-full");
        if (btnShow) {
            const modalService = document.querySelector(".modal-service");
            const modalPayment = document.querySelector(".modal-payment");
            const modalConfirm = document.querySelector(".modal-confirm");

            const btnService = modalService.querySelector(".btn-next-service");
            const btnPayment = modalPayment.querySelectorAll(".payment-item");

            btnShow.addEventListener("click", () => {
                if (!dataPricingDetail.pricing || dataPricingDetail.pricing.length === 0) {
                    return;
                }
                modalService.classList.add("show");
            });

            btnService.addEventListener("click", () => {
                dataPricingDetail.service = [];
                const inputService = modalService.querySelectorAll("input:checked");
                inputService.forEach(input => {
                    const value = input.value;
                    const price = parseInt(input.getAttribute("data-price"));
                    const data = {
                        id: value,
                        price: price,
                        title: input.getAttribute("data-title")
                    };
                    dataPricingDetail.service.push(data)
                });
                modalService.classList.remove("show");
                modalPayment.classList.add("show");
            });

            btnPayment.forEach(btn => {
                btn.addEventListener("click", () => {
                    dataPricingDetail.namePayment = btn.getAttribute("data-method");
                    dataPricingDetail.payment = btn.getAttribute("data-method-id");
                    modalPayment.classList.remove("show");
                    modalConfirm.classList.add("show");
                    let time = "";
                    let totalPrice = 0;
                    if (dataPricingDetail.pricing || dataPricingDetail.pricing.length > 0) {
                        const dataPricingPrice = document.querySelectorAll(".time-slots .time-slot");

                        if (dataPricingPrice.length > 0) {
                            dataPricingPrice.forEach(item => {
                                const id = item.getAttribute("data-pricing");
                                if (dataPricingDetail.pricing.includes(id)) {
                                    const price = item.getAttribute("data-price");
                                    totalPrice += parseInt(price);
                                    time += item.getAttribute("data-time");
                                }

                            });
                            modalConfirm.querySelector(".slot-result").textContent = time;
                            modalConfirm.querySelector(".total-price").textContent = `${totalPrice}Đ`;
                        }
                    }
                    if (dataPricingDetail.service && dataPricingDetail.service.length > 0) {
                        let textService = ""
                        dataPricingDetail.service.forEach(service => {
                            totalPrice += service.price;
                            textService += service.name

                        });
                        modalConfirm.querySelector(".service-result").textContent = textService;
                    }

                });
            });
        }

        // Thanh toán
        const btnConfirm = document.querySelector(".modal-confirm .btn-payment");
        if (btnConfirm) {
            const dataField = JSON.parse(formPricingDetail.getAttribute("data-field"));
            btnConfirm.addEventListener("click", () => {
                if (!dataPricingDetail.field_id) {
                    dataPricingDetail.field_id = dataField._id;
                }

                if (!dataPricingDetail.pricing || dataPricingDetail.pricing.length <= 0) {
                    alert('Vui lòng chọn slot đặt sân');
                    return;
                } else {
                    const dataPricingPrice = document.querySelectorAll(".time-slots .time-slot");
                    let time = "";
                    let totalPrice = 0;
                    if (dataPricingPrice.length > 0) {
                        dataPricingPrice.forEach(item => {
                            const id = item.getAttribute("data-pricing");
                            if (dataPricingDetail.pricing.includes(id)) {
                                const price = item.getAttribute("data-price");
                                totalPrice += parseInt(price);
                                time += item.getAttribute("data-time");
                            }

                        });

                    }
                }

                if (!dataPricingDetail.namePayment) {
                    alert('Vui lòng chọn phương thức thanh toán');
                    return;
                }
                const date = formPricingDetail.querySelector("input[name='date']").value;
                if (date) {
                    dataPricingDetail.date = date;
                } else {
                    const now = new Date();
                    const today =
                        now.getFullYear() +
                        "-" +
                        String(now.getMonth() + 1).padStart(2, "0") +
                        "-" +
                        String(now.getDate()).padStart(2, "0");
                    dataPricingDetail.date = today
                }
                console.log(dataPricingDetail)
                const dataPostBooking = JSON.stringify(dataPricingDetail);
                inputPricing.value = dataPostBooking;
                formPricingDetail.submit();
            });
        }

    }

    // ===============================================Info========================================
    const btnTabInfo = document.querySelectorAll(".tab-btn");
    if (btnTabInfo.length > 0) {
        const tabHistory = document.querySelector(".account-page .booking-list");
        const tabFavorite = document.querySelector(".account-page .booking-fields-grid");
        const tabProfile = document.querySelector(".account-page .profile-layout");
        const tabReview = document.querySelector(".account-page .review-card");
        const cardStatistical = document.querySelector(".booking-filter");
        btnTabInfo.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const dataTab = btn.getAttribute("data-tab");
                btnTabInfo.forEach(item => {
                    item.classList.remove("active");
                });

                btn.classList.add("active");

                // Tab lịch sử đặt lịch
                if (dataTab == "history") {
                    cardStatistical.classList.remove("hidden");
                    tabHistory.classList.remove("hidden");
                    tabFavorite.classList.add("hidden");
                    tabProfile.classList.add("hidden");
                    tabReview.classList.add("hidden");
                }

                // Tab sân bóng yêu thích
                if (dataTab == "favorite") {
                    tabFavorite.classList.remove("hidden");
                    tabHistory.classList.add("hidden");
                    cardStatistical.classList.add("hidden");
                    tabProfile.classList.add("hidden");
                    tabReview.classList.add("hidden");
                }

                // Tab hồ sơ
                if (dataTab == "profile") {
                    tabProfile.classList.remove("hidden");
                    tabFavorite.classList.add("hidden");
                    tabHistory.classList.add("hidden");
                    cardStatistical.classList.add("hidden");
                    tabReview.classList.add("hidden");
                }

                // Tab đánh giá
                if (dataTab == "review") {
                    tabReview.classList.remove("hidden");
                    tabFavorite.classList.add("hidden");
                    tabProfile.classList.add("hidden");
                    tabHistory.classList.add("hidden");
                    cardStatistical.classList.add("hidden");
                }
            });
        });
    }

    // Chọn ảnh đại diện
    const btnChangeAvatar = document.querySelector(".change-avatar-btn");
    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");

    if (btnChangeAvatar) {
        btnChangeAvatar.addEventListener("click", () => {
            avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener("change", (e) => {
            const file = e.target.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = function (event) {
                avatarPreview.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    // Submit thay đổi 
    const formChangeInfo = document.querySelector("[form-chang-infouser]");
    if(formChangeInfo){
        const inputForm = formChangeInfo.querySelector("input[name='infoUser']");
        const btnSubmit = document.querySelector(".profile-main .profile-card .card-header .save-btn");
        if(btnSubmit){
            btnSubmit.addEventListener("click", (e)=>{
                const userName = document.querySelector(".profile-main input[name='userName']").value;
                const displayName = document.querySelector(".profile-main input[name='displayName']").value;
                const phone = document.querySelector(".profile-main input[name='phone']").value;
                const email = document.querySelector(".profile-main input[name='email']").value;
                const sex = document.querySelector(".profile-main select[name='sex']").value;
                const address = document.querySelector(".profile-main select[name='address']").value;
                
                if(!userName){
                    alert("Vui lòng nhập họ tên!");
                    return;
                }

                if(!email){
                    alert("Vui lòng nhập email!");
                    return;
                }
                const data = {
                    userName: userName,
                    displayName: displayName,
                    phone: phone,
                    email: email,
                    sex: sex,
                    address: address
                }
                inputForm.value = JSON.stringify(data);
                formChangeInfo.submit();
            });
        }
    }
});



