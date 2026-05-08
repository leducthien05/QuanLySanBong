const menuItem = document.querySelector(".menu");
const itemLi = menuItem.querySelectorAll("li");
if(itemLi.length > 0){
    const url = window.location.pathname;
    const permissionItem = document.querySelector(".permission-sidebar");
    itemLi.forEach(item =>{
        const linka = item.querySelector("a").getAttribute("href");
        
        // reset trước
        item.classList.remove("active");
        // ưu tiên route permission
        if (permissionItem) {
            const permissionHref = permissionItem.getAttribute("href");
            if (url.startsWith(permissionHref)) {
                permissionItem.closest("li").classList.add("active");
                return; // skip các menu khác
            }
        }
         // match chính xác hoặc theo prefix
        if (url.startsWith(linka)) {
            item.classList.add("active");
        }
    });
}