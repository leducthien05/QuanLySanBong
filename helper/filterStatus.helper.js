module.exports.filterStatus = (query)=>{
    let objectStatus = [
        {
            name: "Tất cả",
            status: "",
            class: ""
        },
        {
            name: "Hoạt động",
            status: "active",
            class: ""
        },
        {
            name: "Ngừng hoạt động",
            status: "inactive",
            class: ""
        },
    ];

    if(query.status){
        const index = objectStatus.findIndex(item => item.status == query.status);
        objectStatus[index].class = "active";
    }
    else{
        const index = objectStatus.findIndex(item => item.status == "");
        objectStatus[index].class = "active";
    }

    return objectStatus;
}