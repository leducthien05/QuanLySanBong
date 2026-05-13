module.exports.search = (query)=>{
    let object = {
        keyword: ""
    }
    if(query.keyword){
        object.keyword = query.keyword;
        const regex = new RegExp(query.keyword, "i");
        object.regex = regex;
    }
    return object;
}