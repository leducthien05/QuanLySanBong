document.addEventListener('DOMContentLoaded', function () {
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
                console.log(link)
                fetch(link, {
                    method: "PATCH",
                    // headers: {
                    //     "Content-Type": "application/json"
                    // }
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data)
                        btn.setAttribute("status", data.status);
                        if (data.status == "pending") {
                            btn.textContent = "● Chưa xử lý";
                            btn.classList.remove("open");
                            btn.classList.add("closed");
                        } else if (data.status == "completed") {
                            btn.textContent = "● Đã xử lý";
                            btn.classList.add("open");
                            btn.classList.remove("closed");
                        }
                    });
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

});
