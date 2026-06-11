const selects = document.querySelectorAll(".change-status");

selects.forEach(select => {
    const formChangeStatus = document.querySelector("[form-change-status]");
    const action = formChangeStatus.action;
    select.addEventListener("change", function () {
        select.classList.remove("paid", "completed", "canceled");
        select.classList.add(this.value);

        // Gọi API cập nhật trạng thái
        const id = select.dataset.id;
        const status = select.value;
        const link = `${action}/change-status/${status}/${id}`;
        fetch(link, {
            method: "PATCH",
            // headers: {
            //     "Content-Type": "application/json"
            // }
        })
            .then(res => {
                if (res.code === 200) {
                    select.classList.remove(
                        "paid",
                        "completed",
                        "canceled"
                    );

                    select.classList.add(res.status);

                    console.log("Cập nhật thành công");
                }
            })
            .then(data => {
                console.log(data)
            });
        console.log(id, status);
    });
});