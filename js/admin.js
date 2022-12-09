
const api_path="travel";
const token="VGAWyx4NZJdA8ftE3n6wsd3k7M32";
const admin_url = "https://livejs-api.hexschool.io/api/livejs/v1/admin"
let orderData = [];
const orderList = document.querySelector(".js-orderList");
function init(){
    getOrderList();
}
init();

// 圓餅圖
function renderC3(){
    // 訂單資料蒐集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] === undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    // 資料關聯
    let categoryAry = Object.keys(total);
    let newData =[];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);
    let chart = c3.generate({
        bindto: "#chart",
        data: {
            type: "pie",
            columns: newData,
        },
    });
}
// 圓餅圖加上其他總和
function renderC3_lv2(){
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title] === undefined){
                obj[productItem.title] = productItem.price * productItem.quantity;
            }else{
                obj[productItem.title] += productItem.price * productItem.quantity;
            }
        })
    });
    // 資料關聯
    let originAry = Object.keys(obj);
    // 整理成C3要的格式
    let rankSortAry = [];
    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });

    rankSortAry.sort(function(a, b){
        return b[1] - a[1];
    })
    if (rankSortAry.length > 3){
        let otherToatal = 0;
        rankSortAry.forEach(function(item, index){
            if(index > 2){
                otherToatal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3, rankSortAry.length - 1);
        rankSortAry.push(["其他", otherToatal]);
    }
    c3.generate({
        bindto: "#chart",
        data: {
            columns: rankSortAry,
            type: "pie",
        },
    })
}
function getOrderList(){
    axios.get(`${admin_url}/${api_path}/orders`,{
        headers:{
            "authorization": token,
        }
    })
    .then(function(respnose){
        // console.log(respnose.data);
        orderData = respnose.data.orders;
        renderOrderList();
    })
}
// 訂單品項字串

function renderOrderList(){
    let str = "";
    orderData.forEach(function(item){
        // 組時間字串
        const time = new Date(item.createdAt*1000);
        const orderTime = `${time.getFullYear()}/${time.getMonth()+1}/${time.getDate()}`;


        let productStr = "";
        item.products.forEach(function(productItem){
            productStr += `<p>${productItem.title}*${productItem.quantity}</p>`
        })
        let orderStatus = "";
        if(item.paid === true){
            orderStatus = "已處理";
        }else{
            orderStatus = "未處理";
        }
        str+=
        `
        <tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
                <a href="#" class="orderStatus" id="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" id="js-orderDel" data-id="${item.id}" value="刪除">
            </td>
        </tr>
        `
    })
    orderList.innerHTML = str;
    // renderC3();
    renderC3_lv2();
}

orderList.addEventListener("click", function(e){
    e.preventDefault();
    let id = e.target.getAttribute("data-id");
    const data = e.target.getAttribute("id");
    if (data === "js-orderDel"){
        return deleteOrder(id);
        // console.log(data);
    }
    if (data === "orderStatus"){
        let status = e.target.getAttribute("data-status");
        
        return changeOrderStatus(status, id);
        
    }
})
// 更換訂單狀態
function changeOrderStatus (status, id){
    let newStatus;
    if(status === "true"){
        newStatus = false;
    }else{
        newStatus = true;
    }
        axios.put(`${admin_url}/${api_path}/orders`,{
            "data":{
                "id": id,
                "paid": newStatus
            }
        },{
            headers:{
                "authorization": token,
            }
        })
        .then(function(respnose){
            alert("修改訂單完成!");
            getOrderList();
        })
}
// 刪除訂單
function deleteOrder(id){
    axios.delete(`${admin_url}/${api_path}/orders/${id}`
    ,{
        headers:{
            "authorization": token,
        }
    })
    .then(function(respnose){
        alert("已刪除訂單!");
        getOrderList();
    })
}
// function deleteAllOrder(){
    
    const deleteAllBtn = document.querySelector(".discardAllBtn");
    deleteAllBtn.addEventListener("click", function(e){
        e.preventDefault();
        axios.delete(`${admin_url}/${api_path}/orders`
        ,{
            headers:{
                "authorization": token,
            }
        })
        .then(function(respnose){
            alert("已刪除全部訂單");
            getOrderList();
        })
    })
// } 