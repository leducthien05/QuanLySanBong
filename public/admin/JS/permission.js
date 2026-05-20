//Lấy nội dung phần quyền
const tablePermission = document.querySelector(".permission-table");
if(tablePermission){
    //Tạo mảng chứa nội dung phân quyền trả về backend
    let permission = [];
    //Lấy button để lấy dữ liệu trả về backend
    const buttonSubmit = document.querySelector(".save-btn");
    //Tìm các dòng chứa nội dung quyền
    const rows = document.querySelectorAll("[data-role]");
    //Bắt sự kiện cho button
    buttonSubmit.addEventListener("click", (e)=>{
        e.preventDefault()
        //Duyệt qua các dòng 
        rows.forEach((row) =>{
            //Tìm các dòng chứa các quyền
            const name = row.getAttribute("data-role");
            //lấy các ô checkbox và ô input chứa id
            const input = row.querySelectorAll("input");
            console.log(input.length)
            //Tìm các id để lưu vào mảng 
            if(name == "id"){
                input.forEach((item)=>{
                    const id = item.value;
                    permission.push({
                        id: id,
                        permission: []
                    });
                });
            }else{
                //Tìm các ô checkbox để lấy quyền lưu vào mảng
                input.forEach((item, index)=>{
                    let checked = item.checked;
                    if(checked){
                        permission[index].permission.push(name);
                    }
                    console.log(index)
                });
                
            }
        });
        console.log(permission)
        if(permission.length > 0){
            //Lấy form chứa quyền
            const formPermisson = document.querySelector("[form-permission]");
            const inputPermission = formPermisson.querySelector("[input-permission-form]");
            inputPermission.value = JSON.stringify(permission);
            formPermisson.submit();
        }
    });
}

const dataRecord = document.querySelector("[data-role-all]");
if(dataRecord){
    const record = dataRecord.getAttribute("data-role-all");
    const permission = JSON.parse(record);
    const tablePermission = document.querySelector(".permission-table");
    permission.forEach((per, index) =>{
        const arr = per.permission;//Mảng các quyền
        arr.forEach(item=>{
            const row = tablePermission.querySelector(`[data-role="${item}"]`);
            const input = row.querySelectorAll("input")[index];
            input.checked = true;
        });
    });
}