// Bước thêm sân
const steps = document.querySelectorAll(".step");
if (steps.length > 0) {
    const step1Content = document.querySelector(".div-step1");
    const step2Content = document.querySelector(".div-step2");
    const step3Content = document.querySelector(".div-step3");

    step1Content.classList.add("active");
    step2Content.classList.remove("active");

    steps.forEach((step) => {
        step.addEventListener("click", () => {

            // active tab
            steps.forEach(item => item.classList.remove("active"));
            step.classList.add("active");

            // ẩn tất cả content
            step1Content.classList.remove("active");
            step2Content.classList.remove("active");
            step3Content.classList.remove("active");

            const divStep = step.getAttribute("number-step");

            if (divStep === "step1") {
                step1Content.classList.add("active");
            }

            if (divStep === "step2") {
                step2Content.classList.add("active");
            }

            if (divStep === "step3") {
                step3Content.classList.add("active");
            }
        });
    });
}


// Lọc theo trạng thái
const btnStatus = document.querySelectorAll("[button-status]");
if (btnStatus.length > 0) {
    let url = new URL(window.location.href);
    btnStatus.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const value = btn.getAttribute("button-status");
            if (value) {
                url.searchParams.set("status", value);
            }
            if (value == "") {
                url.searchParams.delete("status");
            }
            window.location.href = url.href;
        });
    });
}

// Sắp xếp 
const selectSort = document.querySelector(".sort-select select");
if (selectSort) {
    let url = new URL(window.location.href);
    selectSort.addEventListener("change", (e) => {
        const value = e.target.value;
        const [sortKey, sortValue] = value.split("-");
        url.searchParams.set("sortKey", sortKey);
        url.searchParams.set("sortValue", sortValue);
        window.location.href = url.href;
    });

    const buttonClear = document.querySelector("[sort-clear]");
    buttonClear.addEventListener("click", (e) => {
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");
        window.location.href = url.href;
    });
    const sortKey = url.searchParams.get("sortKey");
    const sortValue = url.searchParams.get("sortValue");
    if (sortKey && sortValue) {
        const string = sortKey + "-" + sortValue;
        const option = selectSort.querySelector(`option[value="${string}"]`);
        option.selected = true;
    }
}

// Thay đổi trạng thái
const btnChangeStatus = document.querySelectorAll(".status");
if (btnChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("[form-change-status]");
    const action = formChangeStatus.action;
    btnChangeStatus.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const status = btn.getAttribute("status");
            const id = btn.getAttribute("data-status");
            const link = `${action}/change-status/${status}/${id}`;
            fetch(link, {
                method: "PATCH",
                // headers: {
                //     "Content-Type": "application/json"
                // }
            })
                .then(res => res.json())
                .then(data => {
                    btn.setAttribute("status", data.status);
                    if (data.status == "active") {
                        btn.textContent = "● Mở cửa";
                        btn.classList.add("open");
                    } else if (data.status == "inactive") {
                        btn.textContent = "● Đóng cửa";
                        btn.classList.remove("open");
                    }
                });
        });
    });
}

// Thay đổi nhiều sân
const checkMulti = document.querySelector("[checkbox-multi]");
if (checkMulti) {
    const checkboxItem = checkMulti.querySelectorAll("[checkbox-status]");
    const checkboxAll = checkMulti.querySelector("[checkbox-all]");
    checkboxAll.addEventListener("click", () => {
        checkboxItem.forEach(item => {
            item.checked = checkboxAll.checked;
        });
    });
    checkboxItem.forEach(item => {
        item.addEventListener("click", () => {
            const countchecked = checkMulti.querySelectorAll("input[name = 'id']:checked").length;
            if (countchecked == checkboxItem.length) {
                checkboxAll.checked = true;
            } else {
                checkboxAll.checked = false;
            }
        });
    });
}
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputChecked = checkMulti.querySelectorAll("input[name='id']:checked");
        const typechange = formChangeMulti.querySelector("select[name='status']").value;
        if (inputChecked.length > 0) {
            const inputIDs = formChangeMulti.querySelector("input[name = 'ids']");
            let ids = [];
            inputChecked.forEach(item => {
                const id = item.value;
                if (typechange == "position") {
                    const position = item.closest("tr").querySelector("input[name = 'position']").value;
                    ids.push(`${id}-${position}`);
                } else {
                    ids.push(id);
                }
            });
            inputIDs.value = ids.join(", ");
            formChangeMulti.submit();
        }
    });
}