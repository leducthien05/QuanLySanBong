document.addEventListener("DOMContentLoaded", () => {
    const logoutLink = document.querySelector(".sidebar-logout");
    const logoutModal = document.querySelector(".sidebar-logout-modal");
    const overlay = document.querySelector(".sidebar-logout-modal__overlay");
    const cancelBtn = document.querySelector(".sidebar-logout-modal__cancel");
    const confirmBtn = document.querySelector(".sidebar-logout-modal__confirm");

    if (!logoutLink || !logoutModal || !overlay || !cancelBtn || !confirmBtn) {
        return;
    }

    const closeModal = () => {
        logoutModal.classList.remove("active");
    };

    const openModal = () => {
        logoutModal.classList.add("active");
    };

    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        openModal();
    });

    cancelBtn.addEventListener("click", () => {
        closeModal();
    });

    overlay.addEventListener("click", () => {
        closeModal();
    });

    confirmBtn.addEventListener("click", () => {
        window.location.href = logoutLink.href;
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && logoutModal.classList.contains("active")) {
            closeModal();
        }
    });
});