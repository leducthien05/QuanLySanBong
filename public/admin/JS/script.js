// Bước thêm sân
const steps = document.querySelectorAll(".step");
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

// Chọn lịch hoạt động
// const dataSchedule = document.querySelectorAll("input[name='schedule']");
// if(dataSchedule.length > 0){
//     console.log("OK")
// }