window.addEventListener('DOMContentLoaded', getOrders);

async function getOrders() {
    const orders = await axios.get('http://localhost:3000/orders');

    //console.log(orders.data);

    const ordersCollection = orders.data.data;

    const ordersDiv = document.getElementById('orders-ul');

    ordersCollection.forEach(order => {
        //console.log(order);

        const newLi = document.createElement('li');
        newLi.innerHTML = `<strong>Order Id: ${order.order_id} </strong>`;
        order.products.forEach(product => {
            newLi.innerHTML += `${product.title}`;
        })
        ordersDiv.appendChild(newLi);
    })
}