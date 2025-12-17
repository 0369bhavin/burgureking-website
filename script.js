// --- STATE VARIABLES ---
let isLoggedIn = false;
let userEmail = "";
let cart = [];
let menuData = []; 
let currentItem = {}; 
const TAX_RATE = 0.05;

// --- DUMMY MENU DATA ---
const FAKE_BURGER_API_RESPONSE = [
    { id: 1, name: "Classic Burger", price: 24.30, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
    { id: 2, name: "Cheese Monster", price: 28.50, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600" },
    { id: 3, name: "Spicy Blast", price: 35.99, img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600" },
    { id: 4, name: "Veggie Delight", price: 21.00, img: "https://tse3.mm.bing.net/th/id/OIP.zevd_6Yvb9ya0IlYg6Z7ygHaE8?pid=Api&P=0&h=180" },
    { id: 5, name: "Baconator BBQ", price: 32.75, img: "https://static.vecteezy.com/system/resources/thumbnails/019/023/622/small_2x/front-view-tasty-meat-burger-with-cheese-and-salad-free-photo.jpg" },
    { id: 6, name: "Mushroom Swiss", price: 29.95, img: "https://static.vecteezy.com/system/resources/thumbnails/003/714/324/small_2x/hamburger-homemade-on-wooden-table-free-photo.jpg" },
    { id: 7, name: "Truffle Dream", price: 42.50, img: "https://images.pexels.com/photos/3219547/pexels-photo-3219547.jpeg?cs=srgb&dl=pexels-engin-akyurt-3219547.jpg&fm=jpg" },
    { id: 8, name: "Chicken Crispy", price: 25.45, img: "https://img.freepik.com/premium-photo/4k-restaurant-food-menu-burger-pizza-cake-food-menu-ultra-hd-ai-generated-image_669273-223.jpg?w=2000" },
    { id: 9, name: "Double Decker", price: 38.00, img: "https://static.vecteezy.com/system/resources/thumbnails/027/603/601/small_2x/front-view-on-three-large-beef-salmon-and-kebab-burgers-stuffed-with-fresh-vegetable-salad-and-dressing-photo.jpg" },
    { id: 10, name: "Sunrise Egg", price: 26.15, img: "https://tse1.mm.bing.net/th/id/OIP.aojZSzbBOBFX3J_l3Nmp_QHaE6?pid=Api&P=0&h=180" }
];

// --- DOM ELEMENTS ---
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const cartModal = document.getElementById('cartModal');
const cartCounter = document.getElementById('cartCounter');
const mainBurgerImage = document.getElementById('mainBurgerImage');
const currentOrderPrice = document.getElementById('currentOrderPrice');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cardPaymentForm = document.getElementById('cardPaymentForm');
const miniMenuContainer = document.getElementById('miniMenuContainer');
const searchInput = document.getElementById('searchInput');
const navLinks = document.querySelectorAll('nav ul li a');

// --- MENU RENDERING ---
function renderMiniMenu(items) {
    miniMenuContainer.innerHTML = '';
    if (items.length === 0) {
        miniMenuContainer.innerHTML = '<p style="width:100%; text-align:center; color:var(--text-light);">No items found.</p>';
        return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.id = item.id;
        card.dataset.item = item.name;
        card.dataset.price = item.price.toFixed(2);
        card.dataset.imgUrl = item.img;
        card.onclick = () => updateHeroItem(card);

        card.innerHTML = `
            <img src="${item.img.replace('?w=600','?w=200')}" alt="${item.name}">
            <h4>${item.name.split(' ')[0]}</h4>
            <p>$${item.price.toFixed(2)}</p>
        `;
        miniMenuContainer.appendChild(card);
    });

    // Select first item by default
    const first = document.querySelector('.mini-menu .menu-card');
    if(first) updateHeroItem(first);
}

function updateHeroItem(element) {
    currentItem = {
        id: parseInt(element.dataset.id),
        name: element.dataset.item,
        price: parseFloat(element.dataset.price),
        img: element.dataset.imgUrl
    };

    mainBurgerImage.style.opacity = '0';
    setTimeout(() => {
        mainBurgerImage.src = currentItem.img;
        mainBurgerImage.style.opacity = '1';
    }, 200);

    currentOrderPrice.textContent = `$${currentItem.price.toFixed(2)}`;

    document.querySelectorAll('.mini-menu .menu-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

function filterMenu() {
    const term = searchInput.value.toLowerCase();
    renderMiniMenu(menuData.filter(item => item.name.toLowerCase().includes(term)));
}

// --- CART FUNCTIONS ---
function addToCart() {
    if(!currentItem.id) return showToast("Please select a burger!");
    const existing = cart.find(i=>i.id===currentItem.id);
    if(existing) existing.quantity++;
    else cart.push({...currentItem, quantity:1});
    updateCartDisplay();
    showToast(`${currentItem.name} added to cart!`);
}

function changeQuantity(id, delta){
    const item = cart.find(i=>i.id===id);
    if(!item) return;
    item.quantity+=delta;
    if(item.quantity<=0) cart = cart.filter(i=>i.id!==id);
    updateCartDisplay();
}

function removeItem(id){
    cart = cart.filter(i=>i.id!==id);
    updateCartDisplay();
    showToast("Item removed from cart.");
}

function updateCartDisplay(){
    let subtotal=0, totalItems=0;
    cartItemsContainer.innerHTML='';

    if(cart.length===0){
        emptyCartMessage.style.display='block';
        document.getElementById('cartSubtotal').textContent='$0.00';
        document.getElementById('cartTax').textContent='$0.00';
        document.getElementById('cartGrandTotal').textContent='$0.00';
    } else {
        emptyCartMessage.style.display='none';
        cart.forEach(item=>{
            const total=item.price*item.quantity;
            subtotal+=total;
            totalItems+=item.quantity;
            cartItemsContainer.innerHTML+=`
                <div class="cart-item">
                    <div class="item-info">
                        <span>${item.name}</span>
                        <span class="item-price">$${item.price.toFixed(2)} ea.</span>
                    </div>
                    <div class="item-controls">
                        <button onclick="changeQuantity(${item.id},-1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id},1)">+</button>
                        <button class="remove-btn" onclick="removeItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    const tax=subtotal*TAX_RATE;
    const grand=subtotal+tax;
    document.getElementById('cartSubtotal').textContent=`$${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent=`$${tax.toFixed(2)}`;
    document.getElementById('cartGrandTotal').textContent=`$${grand.toFixed(2)}`;
    cartCounter.textContent=totalItems;
    cartCounter.style.display=totalItems>0?'flex':'none';
}

// --- MODAL & AUTH ---
document.getElementById('closeLogin').onclick=()=>loginModal.style.display='none';
document.getElementById('closeCart').onclick=()=>cartModal.style.display='none';
window.onclick = e => {
    if(e.target==loginModal) loginModal.style.display='none';
    if(e.target==cartModal) cartModal.style.display='none';
};

loginForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const pass=document.getElementById('password').value;
    if(email.includes('@') && pass.length>=6){
        isLoggedIn=true;
        userEmail=email;
        updateUI();
        loginModal.style.display='none';
        loginForm.reset();
        showToast(`Welcome back, ${userEmail.split('@')[0]}!`);
    } else {
        alert("Check email and password (min 6 chars).");
    }
});

function openLogin(){ loginModal.style.display='flex'; }
function openCart(){ updateCartDisplay(); cartModal.style.display='flex'; showTab('cart'); }

function updateUI(){
    if(isLoggedIn){
        authButtons.style.display='none';
        userProfile.style.display='flex';
        const name=userEmail.split('@')[0];
        document.querySelector('.user-name').innerText=`Hi, ${name.charAt(0).toUpperCase()+name.slice(1)}`;
    } else {
        authButtons.style.display='flex';
        userProfile.style.display='none';
    }
}

function handleLogout(){
    if(confirm("Logout?")){
        isLoggedIn=false;
        userEmail="";
        updateUI();
        showToast("Logged out.");
    }
}

function handleBuyClick(){
    if(!isLoggedIn){
        alert("Login to order!");
        openLogin();
    } else openCart();
}

function selectPayment(element, method){
    document.querySelectorAll('.payment-option').forEach(i=>i.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked=true;
    cardPaymentForm.style.display = method==='card' ? 'block':'none';
}

// --- TAB NAVIGATION ---
function showTab(tabName){
    cartModal.style.display='flex';
    if(tabName==='address' && cart.length===0){ alert("Cart empty!"); return; }
    if(tabName==='payment' && !validateAddressDetails()) return;

    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));

    document.getElementById(tabName+'Content').classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}
// --- BUTTON WRAPPERS FOR NAVIGATION ---
function goToAddress() {
    if (cart.length === 0) {
        alert("🛒 Your cart is empty!");
        return;
    }
    showTab('address'); // Switch to Address tab
}

function goToPayment() {
    if (!validateAddressDetails()) {
        return; // Stop if address invalid
    }
    showTab('payment'); // Switch to Payment tab
}


document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', e=>showTab(e.target.dataset.tab));
});

// --- VALIDATION ---
function validateAddressDetails(){
    const n=document.getElementById('deliveryName').value.trim();
    const s=document.getElementById('deliveryStreet').value.trim();
    const c=document.getElementById('deliveryCity').value.trim();
    const z=document.getElementById('deliveryZip').value.trim();
    const p=document.getElementById('deliveryPhone').value.trim();
    if(!n||!s||!c||!z||!p){ alert("Fill all address fields"); return false;}
    if(z.length<4){ alert("Zip too short"); return false;}
    if(p.replace(/\D/g,'').length<7){ alert("Phone too short"); return false;}
    return true;
}

function validateCardDetails(){
    const inputs=document.querySelectorAll('#cardForm input');
    const num=inputs[0].value.replace(/\s/g,'');
    const exp=inputs[1].value;
    const cvv=inputs[2].value;
    if(num.length<13||num.length>19||!/^\d+$/.test(num)){ alert("Card number 13-19 digits"); return false;}
    if(!/^\d{2}\/\d{2}$/.test(exp)){ alert("Expiry MM/YY"); return false;}
    if(!/^\d{3,4}$/.test(cvv)){ alert("CVV 3-4 digits"); return false;}
    return true;
}

// --- CONFIRM ORDER ---
function confirmOrder(){
    if(cart.length===0){ alert("Cart empty!"); showTab('cart'); return;}
    if(!validateAddressDetails()){ showTab('address'); return;}

    const pm=document.querySelector('input[name="payment"]:checked');
    if(!pm){ alert("Select payment method"); return;}
    if(pm.value==='card' && !validateCardDetails()) return;

    const addr = document.getElementById('deliveryStreet').value.trim()+", "+document.getElementById('deliveryCity').value.trim();
    const grand=document.getElementById('cartGrandTotal').textContent;

    cartModal.style.display='none';
    cart=[];
    updateCartDisplay();

    showToast(pm.value==='cod'
        ? `Order Placed! Pay ${grand} cash. Delivery: ${addr}`
        : `Payment Successful! ${grand} charged. Delivery: ${addr}`);
}

// --- TOAST NOTIFICATION ---
function showToast(msg){
    const t=document.createElement('div');
    t.className='toast-msg';
    t.innerText=msg;
    Object.assign(t.style,{
        position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)',
        backgroundColor:'#333', color:'#fff', padding:'12px 24px',
        borderRadius:'50px', boxShadow:'0 4px 10px rgba(0,0,0,0.2)',
        zIndex:'2000', opacity:'0', transition:'opacity 0.5s, bottom 0.5s'
    });
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.opacity='1'; t.style.bottom='30px'; },10);
    setTimeout(()=>{ t.style.opacity='0'; t.style.bottom='10px'; setTimeout(()=>t.remove(),500); },3000);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', ()=>{
    updateUI();
    updateCartDisplay();
    menuData = FAKE_BURGER_API_RESPONSE;
    renderMiniMenu(menuData);
});
