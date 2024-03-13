const url = './products.txt';
let products;
let discounts;
fetch(url)
    .then(response => response.text())
    .then(data => {

        const lines = data.split('\n');


        products = lines.filter(line => line.trim() !== '').map(line => {
            const [id, name, price, pimg] = line.split(',');
            return { id: parseInt(id), name, price: parseFloat(price), pimg };
        });

        const productList = document.getElementById('product-list');
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <p class="pname">${product.name}<p>
                <img src="${product.pimg}" class="pimg"></img>
                <p>Price: $${product.price}</p>
                <label for="quantity-${product.id}">Quantity:</label>
                <input type="number" id="quantity-${product.id}" class="quantity-input" value="0">
            `;
            productList.appendChild(card);
        });

    })
    .catch(error => console.error('Error fetching data:', error));

fetch("./discount.txt")
    .then(response => response.text())
    .then(data => {

        const lines = data.split('\n');


        discounts = lines.filter(line => line.trim() !== '').map(line => {
            const [code, per] = line.split(',');
            return { discode: code, disper: per };
        });



    })
    .catch(error => console.error('Error fetching data:', error));




function generateBill() {
    const bah = document.getElementById("bah");
    bah.style.display = "none";
    const customerName = document.getElementById('cname').value;
    const deliveryAddress = document.getElementById('add').value;
    const discount = document.getElementById('discount').value;
    const dealercode = document.getElementById('discount').value;
    const billContainer = document.getElementById('bill-content');
    billContainer.innerHTML = '';
    const customerDetails = document.createElement('div');
    customerDetails.className = 'cdetail';
    customerDetails.innerHTML = `
        <p><strong>Dealer Code:</strong> ${dealercode}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
    `;
    billContainer.appendChild(customerDetails);
    let totalAmount = 0;

    products.forEach(product => {
        const quantityInput = document.getElementById(`quantity-${product.id}`);
        const quantity = parseInt(quantityInput.value, 10);

        if (quantity > 0) {
            const lineTotal = quantity * product.price;
            totalAmount += lineTotal;

            const lineItem = document.createElement('p');
            lineItem.className = 'bcon';
            lineItem.textContent = `${product.name} x ${quantity} = $${lineTotal}`;
            billContainer.appendChild(lineItem);
        }
    });


    const billContent = document.createElement('div');
    billContainer.appendChild(billContent);
    udis = document.getElementById("discount").value;
    let dispercentage = 0;
    if (discounts.find(obj => obj.discode === udis)) {
        dis = discounts.find(obj => obj.discode === udis);
        dispercentage = parseFloat(dis.disper) / 100;
        document.getElementById("promo").innerHTML = `Congratulations, You got ${dis.disper}% Discount`;
    }


    const subtotal = totalAmount;
    const cgst = (subtotal * 0.09);
    const sgst = (subtotal * 0.09);
    const mainTotal = (subtotal + cgst + sgst) - (dispercentage * subtotal);


    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerHTML = `
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>CGST:</strong> $${cgst.toFixed(2)}</p>
        <p><strong>SGST:</strong> $${sgst.toFixed(2)}</p>
        <p><strong>Discount:</strong> $${dispercentage * subtotal}</p>
        <p class="mtot"><strong>Main Total:</strong> $${mainTotal.toFixed(2)}</p>
    `;
    billContainer.appendChild(summary);
}



function sendBill() {

    const billContent = document.getElementById('bill-content').innerText;
    const userEmail = prompt("Enter your Email");

    if (!userEmail) return;
    document.getElementById("loading-container").style.display = "block";
    fetch('/send-bill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail,
                billContent,
            }),
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to send bill: ' + response.statusText);
            }
        })
        .then(data => {
            if (data.success) {
                // Redirect to the success page or handle it accordingly
                window.location.replace('/success');
            } else {
                alert(data.message); // Show any error messages from the server
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
