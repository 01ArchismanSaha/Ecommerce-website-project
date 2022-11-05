const cartOpenBtn = document.getElementById('open-cart-btn');
const cartCloseBtn = document.querySelector('.close-btn');
const cartContainer = document.querySelector('.cart-items');
const musicDiv = document.getElementById('music');
const merchDiv = document.getElementById('merch');

window.addEventListener('DOMContentLoaded', loadInitialPage);

async function addToCart(event) {
    //console.log(event.target);
    const product = event.target.parentElement.parentElement;
    const productName = product.childNodes[1].innerHTML;
    //console.log(product.childNodes[5].childNodes[5].value);
    
    const prodId = product.childNodes[5].childNodes[5].value;

    const postResponse = await axios.post('http://localhost:3000/cart', {id: prodId});

    console.log('cart post response :',postResponse);

    if(postResponse.status === 200) {
        productAddedNotification(productName);
        updateCart();
    } else {
        console.log(postResponse.data.message);
    }
}

async function updateCart() {
    const getResponse = await axios.get('http://localhost:3000/cart');

    console.log('cart get response : ',getResponse);

    const parentDiv = document.querySelector('.cart__item-list');

    if(getResponse.status === 200) {

        const products = getResponse.data.products;

        parentDiv.innerHTML = '';
    
        products.forEach(product => {
            const cartItemHTML = `
                <li class="cart__item">
                    <h1>${product.title}</h1>
                    <h2>$${product.price}</h2>
                    <h2>${product.cartItem.quantity}</h2>
                    <input type="hidden" value="${product.id}" name="productId">
                    <button class="btn danger" type="submit">Delete</button>
                </li>
            `;
            parentDiv.innerHTML += cartItemHTML;
        })
    }else {
        console.log(getResponse.data.message);
    }
}

function productAddedNotification(name) {
    const notif = document.createElement('div');

    notif.classList.add('toast');

    notif.innerHTML = `${name}successfully added to cart`;

    container.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

cartOpenBtn.addEventListener("click", () => {
    cartOpenBtn.classList.add('active');
    cartContainer.classList.add('active');
})
cartCloseBtn.addEventListener('click', () => {
    cartOpenBtn.classList.remove('active');
    cartContainer.classList.remove('active');
})

async function loadInitialPage() {
    try {
        const initialResponse = await axios.get('http://localhost:3000/?page=1');
        console.log('nitial response: ',initialResponse);
        
        const parentDiv = document.getElementById('music-items');

        if(initialResponse.status === 200) {
            const products = initialResponse.data.products;
            products.forEach(product => {
                //console.log('running');
                const productHTML = `
                <div id="${product.title.toLowerCase().replace(' ', '')}">
                    <h3 class="title">${product.title}</h3>
                    <div id="image-container">
                        <img src="${product.imageUrl}">
                    </div>
                    <div class="product-details">
                        <span>$<span>${product.price}</span></span>
                        <button class="shop-item-button">ADD TO CART</button>
                        <input type="hidden" name="productId" value="${product.id}">
                        <input type="hidden" name="userId" value="${product.userId}">
                    </div>
                </div>
                `;
                parentDiv.innerHTML += productHTML;
            })

            addPagination(initialResponse);

            //console.log(document.querySelector('.pagination').firstElementChild);
        }else {
            console.log(initialResponse.data.message);
        }

        updateCart();
        
    } catch (error) {
        console.log(error);
    }
}

function addPagination(initialResponse) {
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.innerHTML = '';

    if(initialResponse.data.previousPage!==1 && initialResponse.data.currentPage!==1){
        paginationDiv.innerHTML += `
            <button>${1}</button>
        `;
        paginationDiv.innerHTML += '<<';
    }

    if(initialResponse.data.hasPreviousPage) {
        paginationDiv.innerHTML += `
            <button>${initialResponse.data.previousPage}</button>
        `;
    }

    paginationDiv.innerHTML += `
        <button class="active">${initialResponse.data.currentPage}</button>
    `;

    if(initialResponse.data.hasNextPage) {
        paginationDiv.innerHTML += `
            <button>${initialResponse.data.nextPage}</button>
        `;
    }

    if(initialResponse.data.currentPage !== initialResponse.data.lastPage && initialResponse.data.nextPage!==initialResponse.data.lastPage) {
        paginationDiv.innerHTML += '>>';
        paginationDiv.innerHTML += `
            <button>${initialResponse.data.lastPage}</button>
        `;
    }
}

async function loadSubsequentPage(event) {
    const page = event.target.innerHTML;
    //console.log('page clicked: ', page);

    const paginationResponse = await axios.get(`http://localhost:3000/?page=${page}`);

    //console.log('paginationResponse :', paginationResponse);

    const productsToDisplay = paginationResponse.data.products;

    const parentDiv = document.getElementById('music-items');
    parentDiv.innerHTML = '';

    productsToDisplay.forEach(product => {
        const productHTML = `
        <div id="${product.title.toLowerCase().replace(' ', '')}">
            <h3 class="title">${product.title}</h3>
            <div id="image-container">
                <img src="${product.imageUrl}">
            </div>
            <div class="product-details">
                <span>$<span>${product.price}</span></span>
                <button class="shop-item-button">ADD TO CART</button>
                <input type="hidden" name="productId" value="${product.id}">
                <input type="hidden" name="userId" value="${product.userId}">
            </div>
        </div>
        `;
        parentDiv.innerHTML += productHTML;
    })

    addPagination(paginationResponse);
}

async function placeOrder(event) {
    console.log(event.target.parentElement.childNodes[5].children)
    const cartItems = event.target.parentElement.childNodes[5].children;
    let productIdArray = [];
    for(let i = 0; i< cartItems.length; i ++) {
        console.log(cartItems[i].children[3].value);
        productIdArray.push(cartItems[i].children[3].value);
    }
    console.log(productIdArray);
    const orderResponse = await axios.post('http://localhost:3000/orders', {productIdArray: productIdArray});

    console.log('purchase response: ', orderResponse);
    if(orderResponse.status === 200) {
        updateCart();
        notifyOrderPlaced(orderResponse.data.newOrderId);
    } else {
        console.log(orderResponse.message);
    }
}

async function deleteCartItem(event){
    console.log(event.target.parentElement.childNodes[7]);
    const productId = event.target.parentElement.childNodes[7].value;

    const postDeleteResponse = await axios.post('http://localhost:3000/cart-delete-item', {productId: productId});
    
    if(postDeleteResponse.status === 200) {
        updateCart();
    } else {
        console.log(postDeleteResponse.message);
    }
}

function notifyOrderPlaced(orderId) {
    const notif = document.createElement('div');

    notif.classList.add('toast');

    notif.innerHTML = `Order sucessfully placed with order id = ${orderId}`;

    container.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

async function getOrders() {
    console.log('onclick of orders page called')
    const orders_ul = document.getElementById('orders-ul');
    
    const orderData = await axios.get('http://localhost:3000/orders');

    console.log('orders data: ', orderData);
}