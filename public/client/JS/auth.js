const btnAuth = document.querySelectorAll(".tab-btn");
if(btnAuth.length > 0){
    const tabLogin = document.querySelector(".login-form");
    const tabRegister = document.querySelector(".register-form");
    btnAuth.forEach(btn => {
        btn.addEventListener("click", (e)=>{
            btnAuth.forEach(item => {
                item.classList.remove("active");
            });
            btn.classList.add("active");
            const dataTab = btn.getAttribute("data-tab");
            if(dataTab == "login"){
                tabLogin.classList.remove("hidden");
                tabRegister.classList.add("hidden");
            } else if(dataTab == "register"){
                tabLogin.classList.add("hidden");
                tabRegister.classList.remove("hidden");
            }
        });
    });
}

const avatarItems = document.querySelectorAll(".avatar-item");
const avatarSelected = document.getElementById("avatarSelected");

const avatarFile = document.getElementById("avatarFile");
const btnChooseAvatar = document.getElementById("btnChooseAvatar");

const avatarPreview = document.getElementById("avatarPreview");

// Chọn avatar có sẵn
avatarItems.forEach(item => {
    item.addEventListener("click", () => {
        avatarPreview.classList.remove("hidden");
        avatarItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

        const avatar = item.dataset.avatar;

        avatarSelected.value = avatar;

        avatarPreview.src = avatar;

        // bỏ file đã chọn
        avatarFile.value = "";
    });
});

// Mở hộp chọn file
btnChooseAvatar.addEventListener("click", () => {
    avatarFile.click();
});

// Chọn ảnh từ máy
avatarFile.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    avatarItems.forEach(i => i.classList.remove("active"));

    avatarSelected.value = "";

    const reader = new FileReader();

    reader.onload = function (e) {
        avatarPreview.src = e.target.result;
        avatarPreview.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
});