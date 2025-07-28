document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elementlerini Seçme ---
    const tablesContainer = document.getElementById('tables-container');
    const addTableIconButton = document.getElementById('add-table-icon-button');
    const mainScreen = document.getElementById('main-screen');
    const orderScreen = document.getElementById('order-screen');
    const backToMainButton = document.getElementById('back-to-main-button');
    const currentTableDisplay = document.getElementById('current-table-display');
    const productList = document.getElementById('product-list');
    const orderItems = document.getElementById('order-items');
    const subtotalAmount = document.getElementById('subtotal-amount');
    const discountAmount = document.getElementById('discount-amount');
    const totalAmount = document.getElementById('total-amount');
    const clearOrderButton = document.getElementById('clear-order-button');
    const completeOrderButton = document.getElementById('complete-order-button');
    const printReceiptButton = document.getElementById('print-receipt-button');
    const receiptModal = document.getElementById('receipt-modal');
    const receiptContent = document.getElementById('receipt-content');
    const closeModalButton = document.querySelector('.modal .close-button');
    const printReceiptModalButton = document.getElementById('print-receipt-modal-button');

    // Ciro Rapor Elementleri
    const dailyTotalRevenueAmount = document.getElementById('daily-total-revenue-amount');
    const resetDailyRevenueButton = document.getElementById('reset-daily-revenue-button');
    const showReportsButton = document.getElementById('show-reports-button');
    const reportScreen = document.getElementById('report-screen');
    const backToMainFromReportsButton = document.getElementById('back-to-main-from-reports-button');
    const dailyRevenueDisplay = document.getElementById('daily-revenue');
    const dailyCashRevenueDisplay = document.getElementById('daily-cash-revenue');
    const dailyCardRevenueDisplay = document.getElementById('daily-card-revenue'); // Hata düzeltildi!
    const weeklyRevenueDisplay = document.getElementById('weekly-revenue');
    const weeklyCashRevenueDisplay = document.getElementById('weekly-cash-revenue');
    const weeklyCardRevenueDisplay = document.getElementById('weekly-card-revenue');
    const monthlyRevenueDisplay = document.getElementById('monthly-revenue');
    const monthlyCashRevenueDisplay = document.getElementById('monthly-cash-revenue');
    const monthlyCardRevenueDisplay = document.getElementById('monthly-card-revenue');
    const resetAllRevenueButton = document.getElementById('reset-all-revenue-button');

    const showProductsButton = document.getElementById('show-products-button');
    const productManagementScreen = document.getElementById('product-management-screen');
    const backToMainFromProductsButton = document.getElementById('back-to-main-from-products-button');
    const newProductNameInput = document.getElementById('new-product-name');
    const newProductPriceInput = document.getElementById('new-product-price');
    const newProductCategorySelect = document.getElementById('new-product-category');
    const addProductButton = document.getElementById('add-product-button');
    const productManagementList = document.getElementById('product-management-list');
    const discountButtons = document.querySelectorAll('.discount-button');
    const appliedDiscountRate = document.getElementById('applied-discount-rate');
    const customDiscountPercentageInput = document.getElementById('custom-discount-percentage');
    const applyCustomDiscountButton = document.getElementById('apply-custom-discount-button');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const productTabButtons = document.querySelectorAll('.product-tabs .tab-button');
    const toastContainer = document.getElementById('toast-container');


    // --- 2. Global Değişkenler ---
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 'p001', name: 'Espresso', price: 45.00, category: 'hot-drinks' },
        { id: 'p002', name: 'Latte', price: 60.00, category: 'hot-drinks' },
        { id: 'p003', name: 'Americano', price: 50.00, category: 'hot-drinks' },
        { id: 'p004', name: 'Mocha', price: 65.00, category: 'hot-drinks' },
        { id: 'p005', name: 'Filtre Kahve', price: 40.00, category: 'hot-drinks' },
        { id: 'p006', name: 'Türk Kahvesi', price: 35.00, category: 'hot-drinks' },
        { id: 'p007', name: 'Buzlu Latte', price: 65.00, category: 'cold-drinks' },
        { id: 'p008', name: 'Cold Brew', price: 60.00, category: 'cold-drinks' },
        { id: 'p009', name: 'Iced Americano', price: 55.00, category: 'cold-drinks' },
        { id: 'p010', name: 'Frappuccino', price: 70.00, category: 'cold-drinks' },
        { id: 'p011', name: 'Limonata', price: 50.00, category: 'cold-drinks' },
        { id: 'p012', name: 'Cheesecake', price: 80.00, category: 'desserts' },
        { id: 'p013', name: 'Brownie', price: 70.00, category: 'desserts' },
        { id: 'p014', name: 'Sufle', price: 75.00, category: 'desserts' },
        { id: 'p015', name: 'Tiramisu', price: 85.00, category: 'desserts' }
    ];
    let currentTableId = null;

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    let lastResetDates = JSON.parse(localStorage.getItem('lastResetDates')) || {
        daily: new Date().toDateString(),
        weekly: new Date().toISOString().substring(0, 10),
        monthly: new Date().toISOString().substring(0, 7)
    };

    // --- 3. Yardımcı Fonksiyonlar ---
    function generateUniqueId(prefix) {
        return prefix + Date.now() + Math.floor(Math.random() * 1000);
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active-screen');
        });
        document.getElementById(screenId).classList.add('active-screen');
        if (screenId === 'main-screen') {
            renderTables();
        } else if (screenId === 'report-screen') {
            updateRevenueDisplays();
        }
    }

    function saveTables() {
        localStorage.setItem('tables', JSON.stringify(tables));
    }

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function saveLastResetDates() {
        localStorage.setItem('lastResetDates', JSON.stringify(lastResetDates));
    }

    function calculateRevenue(period) {
        const now = new Date();
        let filteredTransactions = [];

        if (period === 'daily') {
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.toDateString() === now.toDateString();
            });
        } else if (period === 'weekly') {
            const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Pazartesi
            firstDayOfWeek.setHours(0, 0, 0, 0);
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= firstDayOfWeek;
            });
        } else if (period === 'monthly') {
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
            });
        }

        const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
        const cash = filteredTransactions.reduce((sum, t) => sum + (t.paymentMethod === 'cash' ? t.amount : 0), 0);
        const card = filteredTransactions.reduce((sum, t) => sum + (t.paymentMethod === 'card' ? t.amount : 0), 0);

        return { total, cash, card };
    }

    function updateRevenueDisplays() {
        const daily = calculateRevenue('daily');
        const weekly = calculateRevenue('weekly');
        const monthly = calculateRevenue('monthly');

        dailyTotalRevenueAmount.textContent = daily.total.toFixed(2);
        dailyRevenueDisplay.textContent = daily.total.toFixed(2) + '₺';
        dailyCashRevenueDisplay.textContent = daily.cash.toFixed(2) + '₺';
        dailyCardRevenueDisplay.textContent = daily.card.toFixed(2) + '₺';

        weeklyRevenueDisplay.textContent = weekly.total.toFixed(2) + '₺';
        weeklyCashRevenueDisplay.textContent = weekly.cash.toFixed(2) + '₺';
        weeklyCardRevenueDisplay.textContent = weekly.card.toFixed(2) + '₺';

        monthlyRevenueDisplay.textContent = monthly.total.toFixed(2) + '₺';
        monthlyCashRevenueDisplay.textContent = monthly.cash.toFixed(2) + '₺';
        monthlyCardRevenueDisplay.textContent = monthly.card.toFixed(2) + '₺';
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // --- 4. Masa İşlemleri ---
    function renderTables() {
        tablesContainer.innerHTML = '';
        if (Object.keys(tables).length === 0) {
            tablesContainer.innerHTML = '<p class="empty-state">Henüz masa eklenmemiş. Lütfen yeni masa ekleyin.</p>';
        }
        Object.values(tables).forEach(table => {
            const tableDiv = document.createElement('div');
            tableDiv.classList.add('table-card');
            const currentTableTotal = table.order && table.order.total !== undefined ? table.order.total : 0;
            if (table.order && table.order.items.length > 0) {
                tableDiv.classList.add('has-order');
            }
            tableDiv.dataset.id = table.id;
            tableDiv.innerHTML = `
                <h3>${table.name}</h3>
                <p>Toplam: ${currentTableTotal.toFixed(2)}₺</p>
                <div class="table-actions">
                    <button class="open-table-button"><i class="fas fa-cash-register"></i></button>
                    <button class="delete-table-button danger-button-small"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            tablesContainer.appendChild(tableDiv);
        });
    }

    function addTable() {
        const newTableId = generateUniqueId('t');
        const newTableName = `Masa ${Object.keys(tables).length + 1}`;
        tables[newTableId] = {
            id: newTableId,
            name: newTableName,
            order: { items: [], subtotal: 0, discountRate: 0, discountAmount: 0, total: 0 }
        };
        saveTables();
        renderTables();
        showToast(`${newTableName} başarıyla eklendi!`, 'success');
    }

    function deleteTable(tableId) {
        if (confirm('Masayı silmek istediğinizden emin misiniz?')) {
            delete tables[tableId];
            saveTables();
            renderTables();
            showToast('Masa başarıyla silindi.', 'success');
        }
    }

    // --- 5. Ürün İşlemleri ---
    function renderProducts(category = 'all') {
        productList.innerHTML = '';
        const filteredProducts = products.filter(p => category === 'all' || p.category === category);

        if (filteredProducts.length === 0) {
            productList.innerHTML = '<p class="empty-state">Bu kategoride ürün bulunamadı.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-card');
            productDiv.dataset.id = product.id;
            productDiv.innerHTML = `
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)}₺</p>
                <button class="add-to-order-button"><i class="fas fa-plus-circle"></i> Ekle</button>
            `;
            productList.appendChild(productDiv);
        });
    }

    function renderProductManagementList() {
        productManagementList.innerHTML = '';
        if (products.length === 0) {
            productManagementList.innerHTML = '<p class="empty-state">Henüz ürün eklenmemiş.</p>';
            return;
        }
        products.forEach(product => {
            const listItem = document.createElement('li');
            listItem.dataset.id = product.id;
            listItem.innerHTML = `
                <span class="product-info">
                    <span class="product-name">${product.name}</span> -
                    <span class="product-price">${product.price.toFixed(2)}₺</span>
                    (<span class="product-category">${product.category}</span>)
                </span>
                <div class="product-actions">
                    <button class="edit-product-button action-button info-button-small"><i class="fas fa-edit"></i> Düzenle</button>
                    <button class="delete-product-button danger-button-small"><i class="fas fa-trash-alt"></i> Sil</button>
                </div>
            `;
            productManagementList.appendChild(listItem);
        });
    }

    function addProduct() {
        const name = newProductNameInput.value.trim();
        const price = parseFloat(newProductPriceInput.value);
        const category = newProductCategorySelect.value;

        if (!name || isNaN(price) || price <= 0 || !category) {
            showToast('Lütfen ürün adı, geçerli fiyat ve kategori girin.', 'error');
            return;
        }

        const newProductId = generateUniqueId('p');
        products.push({ id: newProductId, name, price, category });
        saveProducts();
        renderProducts(document.querySelector('.product-tabs .tab-button.active')?.dataset.category || 'all');
        renderProductManagementList();
        newProductNameInput.value = '';
        newProductPriceInput.value = '';
        newProductCategorySelect.value = '';
        showToast('Ürün başarıyla eklendi!', 'success');
    }

    function deleteProduct(productId) {
        if (confirm('Ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            products = products.filter(p => p.id !== productId);
            saveProducts();
            renderProducts(document.querySelector('.product-tabs .tab-button.active')?.dataset.category || 'all');
            renderProductManagementList();
            showToast('Ürün başarıyla silindi.', 'success');
        }
    }

    // Ürün düzenleme fonksiyonu
    function editProduct(productId, listItem) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const productNameSpan = listItem.querySelector('.product-name');
        const productPriceSpan = listItem.querySelector('.product-price');
        const productActionsDiv = listItem.querySelector('.product-actions');

        // Düzenleme moduna geç
        productNameSpan.innerHTML = `<input type="text" class="edit-product-name-input" value="${product.name}">`;
        productPriceSpan.innerHTML = `<input type="number" class="edit-product-price-input" value="${product.price.toFixed(2)}" step="0.01" min="0.01">₺`;

        productActionsDiv.innerHTML = `
            <button class="save-product-button action-button success-button-small"><i class="fas fa-save"></i> Kaydet</button>
            <button class="cancel-edit-button action-button danger-button-small"><i class="fas fa-times"></i> İptal</button>
        `;

        // Olay dinleyicilerini ekle
        productActionsDiv.querySelector('.save-product-button').addEventListener('click', () => {
            const newName = listItem.querySelector('.edit-product-name-input').value.trim();
            const newPrice = parseFloat(listItem.querySelector('.edit-product-price-input').value);

            if (!newName || isNaN(newPrice) || newPrice <= 0) {
                showToast('Lütfen geçerli bir ürün adı ve fiyatı girin.', 'error');
                return;
            }

            product.name = newName;
            product.price = newPrice;
            saveProducts();
            renderProductManagementList(); // Listeyi yeniden render et
            showToast('Ürün başarıyla güncellendi!', 'success');
        });

        productActionsDiv.querySelector('.cancel-edit-button').addEventListener('click', () => {
            renderProductManagementList(); // Değişiklikleri iptal et ve listeyi yeniden render et
            showToast('Düzenleme iptal edildi.', 'info');
        });
    }


    // --- 6. Sipariş İşlemleri ---
    function renderOrderDetails() {
        const table = tables[currentTableId];
        if (!table) return;

        orderItems.innerHTML = '';
        if (table.order.items.length === 0) {
            orderItems.innerHTML = '<p class="empty-state">Bu masada henüz sipariş yok.</p>';
        }

        table.order.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('order-item');
            listItem.dataset.productId = item.productId;
            listItem.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)}₺</span>
                <div class="item-actions">
                    <button class="decrease-quantity-button"><i class="fas fa-minus-circle"></i></button>
                    <button class="increase-quantity-button"><i class="fas fa-plus-circle"></i></button>
                    <button class="remove-item-button danger-button-small"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            orderItems.appendChild(listItem);
        });

        subtotalAmount.textContent = table.order.subtotal.toFixed(2) + '₺';
        discountAmount.textContent = table.order.discountAmount.toFixed(2) + '₺';
        totalAmount.textContent = table.order.total.toFixed(2) + '₺';
        appliedDiscountRate.textContent = `${(table.order.discountRate * 100).toFixed(0)}%`;
        customDiscountPercentageInput.value = (table.order.discountRate * 100).toFixed(0);
    }

    function calculateOrderTotals() {
        const table = tables[currentTableId];
        if (!table) return;

        let subtotal = table.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmountValue = subtotal * table.order.discountRate;
        let total = subtotal - discountAmountValue;

        table.order.subtotal = subtotal;
        table.order.discountAmount = discountAmountValue;
        table.order.total = total;

        saveTables();
        renderOrderDetails();
        renderTables();
    }

    function addProductToOrder(productId) {
        const table = tables[currentTableId];
        if (!table) return;

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = table.order.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            table.order.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        calculateOrderTotals();
        showToast(`${product.name} siparişe eklendi.`, 'info');
    }

    function decreaseQuantity(productId) {
        const table = tables[currentTableId];
        if (!table) return;

        const existingItemIndex = table.order.items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            if (table.order.items[existingItemIndex].quantity > 1) {
                table.order.items[existingItemIndex].quantity--;
            } else {
                table.order.items.splice(existingItemIndex, 1);
            }
            calculateOrderTotals();
            showToast('Ürün miktarı azaltıldı.', 'info');
        }
    }

    function increaseQuantity(productId) {
        const table = tables[currentTableId];
        if (!table) return;

        const existingItemIndex = table.order.items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            table.order.items[existingItemIndex].quantity++;
            calculateOrderTotals();
            showToast('Ürün miktarı artırıldı.', 'info');
        }
    }

    function removeItemFromOrder(productId) {
        const table = tables[currentTableId];
        if (!table) return;

        table.order.items = table.order.items.filter(item => item.productId !== productId);
        calculateOrderTotals();
        showToast('Ürün siparişten silindi.', 'warning');
    }

    function clearOrder() {
        if (confirm('Siparişi tamamen temizlemek istediğinizden emin misiniz?')) {
            const table = tables[currentTableId];
            if (table) {
                table.order = { items: [], subtotal: 0, discountRate: 0, discountAmount: 0, total: 0 };
                saveTables();
                renderOrderDetails();
                renderTables();
                showToast('Sipariş temizlendi.', 'warning');
            }
        }
    }

    function applyDiscount(discountRate) {
        const table = tables[currentTableId];
        if (!table) return;
        table.order.discountRate = discountRate;
        calculateOrderTotals();
        showToast(`%${(discountRate * 100).toFixed(0)} iskonto uygulandı.`, 'info');
    }

    function applyCustomDiscount() {
        const discountPercentage = parseFloat(customDiscountPercentageInput.value);
        if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
            showToast('Lütfen 0 ile 100 arasında geçerli bir iskonto yüzdesi girin.', 'error');
            return;
        }
        const discountRate = discountPercentage / 100;
        applyDiscount(discountRate);
    }

    function completeOrder() {
        const table = tables[currentTableId];
        if (!table || table.order.items.length === 0) {
            showToast('Sipariş tamamlamak için ürün eklemelisiniz.', 'error');
            return;
        }

        if (confirm(`${table.name} için siparişi ${table.order.total.toFixed(2)}₺ ile tamamlamak istediğinizden emin misiniz?`)) {
            const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
            const totalAmount = table.order.total;

            transactions.push({
                id: generateUniqueId('trn'),
                date: new Date().toISOString(),
                amount: totalAmount,
                paymentMethod: selectedPaymentMethod,
                items: table.order.items
            });
            saveTransactions();

            table.order = { items: [], subtotal: 0, discountRate: 0, discountAmount: 0, total: 0 };
            saveTables();
            renderTables();
            updateRevenueDisplays();
            showToast(`${table.name} siparişi başarıyla tamamlandı!`, 'success');
            showScreen('main-screen');
        }
    }

    function printReceipt() {
        const table = tables[currentTableId];
        if (!table || table.order.items.length === 0) {
            showToast('Fiş yazdırmak için siparişte ürün olmalı.', 'error');
            return;
        }

        let receiptHtml = `
            <h3>Söz Coffe - Fiş</h3>
            <p>Masa: ${table.name}</p>
            <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
            <p>Saat: ${new Date().toLocaleTimeString('tr-TR')}</p>
            <hr>
            <h4>Ürünler:</h4>
            <ul>
        `;
        table.order.items.forEach(item => {
            receiptHtml += `<li>${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}₺</li>`;
        });
        receiptHtml += `</ul><hr>`;
        receiptHtml += `
            <p>Ara Toplam: ${table.order.subtotal.toFixed(2)}₺</p>
            <p>Uygulanan İskonto: %${(table.order.discountRate * 100).toFixed(0)}</p>
            <p>İskonto Tutarı: ${table.order.discountAmount.toFixed(2)}₺</p>
            <p><strong>Toplam Tutar: ${table.order.total.toFixed(2)}₺</strong></p>
            <p>Ödeme Yöntemi: ${document.querySelector('input[name="payment-method"]:checked').value === 'cash' ? 'Nakit' : 'Kart'}</p>
            <hr>
            <p style="text-align: center;">Afiyet Olsun!</p>
        `;

        receiptContent.innerHTML = receiptHtml;
        receiptModal.style.display = 'block';
    }

    // --- 7. Otomatik Ciro Sıfırlama ve Yönetim ---
    function checkAndResetRevenuesAutomatically() {
        const now = new Date();

        const lastDaily = new Date(lastResetDates.daily);
        if (now.toDateString() !== lastDaily.toDateString()) {
            // Sadece bugüne ait işlemleri tut
            transactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.toDateString() === now.toDateString();
            });
            saveTransactions();
            lastResetDates.daily = now.toDateString();
            saveLastResetDates();
            showToast('Günlük ciro otomatik olarak sıfırlandı.', 'info');
        }

        const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Pazartesi
        currentWeekStart.setHours(0, 0, 0, 0);
        const lastWeekly = new Date(lastResetDates.weekly);

        if (currentWeekStart.toDateString() !== lastWeekly.toDateString()) {
            // Sadece mevcut haftanın işlemlerini tut
            transactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= currentWeekStart;
            });
            saveTransactions();
            lastResetDates.weekly = currentWeekStart.toISOString().substring(0, 10);
            saveLastResetDates();
            showToast('Haftalık ciro otomatik olarak sıfırlandı.', 'info');
        }

        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const lastMonthly = new Date(lastResetDates.monthly + '-01'); // YYYY-MM'den Date objesi oluştur

        if (currentMonthStart.toDateString() !== lastMonthly.toDateString()) {
            // Sadece mevcut ayın işlemlerini tut
            transactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= currentMonthStart;
            });
            saveTransactions();
            lastResetDates.monthly = now.toISOString().substring(0, 7);
            saveLastResetDates();
            showToast('Aylık ciro otomatik olarak sıfırlandı.', 'info');
        }

        updateRevenueDisplays();
    }


    function resetDailyRevenueManually() {
        if (confirm('Günlük ciroyu sıfırlamak istediğinizden emin misiniz? Bu işlem, günlük ciro verilerini sıfırlar.')) {
            const now = new Date();
            transactions = transactions.filter(t => new Date(t.date).toDateString() !== now.toDateString());
            saveTransactions();
            lastResetDates.daily = now.toDateString();
            saveLastResetDates();
            updateRevenueDisplays();
            showToast('Günlük ciro başarıyla sıfırlandı.', 'info');
        }
    }

    function resetAllRevenues() {
        if (confirm('Tüm ciro verilerini (Günlük, Haftalık, Aylık) sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            transactions = [];
            saveTransactions();

            const now = new Date();
            lastResetDates = {
                daily: now.toDateString(),
                weekly: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)).toISOString().substring(0, 10),
                monthly: now.toISOString().substring(0, 7)
            };
            saveLastResetDates();
            updateRevenueDisplays();
            showToast('Tüm ciro verileri başarıyla sıfırlandı!', 'success');
        }
    }


    // --- 8. Olay Dinleyicileri ---
    addTableIconButton.addEventListener('click', addTable);

    tablesContainer.addEventListener('click', (e) => {
        const tableCard = e.target.closest('.table-card');
        if (!tableCard) return;

        const tableId = tableCard.dataset.id;

        if (e.target.closest('.open-table-button')) {
            currentTableId = tableId;
            currentTableDisplay.textContent = tables[currentTableId].name;
            renderOrderDetails();
            renderProducts('all');
            productTabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.tab-button[data-category="all"]').classList.add('active');
            showScreen('order-screen');
        } else if (e.target.closest('.delete-table-button')) {
            deleteTable(tableId);
        }
    });

    backToMainButton.addEventListener('click', () => showScreen('main-screen'));

    productList.addEventListener('click', (e) => {
        const addButton = e.target.closest('.add-to-order-button');
        if (addButton) {
            const productId = addButton.parentElement.dataset.id;
            addProductToOrder(productId);
        }
    });

    orderItems.addEventListener('click', (e) => {
        const listItem = e.target.closest('.order-item');
        if (!listItem) return;

        const productId = listItem.dataset.productId;

        if (e.target.closest('.decrease-quantity-button')) {
            decreaseQuantity(productId);
        } else if (e.target.closest('.increase-quantity-button')) {
            increaseQuantity(productId);
        } else if (e.target.closest('.remove-item-button')) {
            removeItemFromOrder(productId);
        }
    });

    clearOrderButton.addEventListener('click', clearOrder);
    completeOrderButton.addEventListener('click', completeOrder);
    printReceiptButton.addEventListener('click', printReceipt);

    closeModalButton.addEventListener('click', () => {
        receiptModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == receiptModal) {
            receiptModal.style.display = 'none';
        }
    });

    printReceiptModalButton.addEventListener('click', () => {
        const printContent = receiptContent.innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload();
    });

    resetDailyRevenueButton.addEventListener('click', resetDailyRevenueManually);
    resetAllRevenueButton.addEventListener('click', resetAllRevenues);

    showReportsButton.addEventListener('click', () => {
        updateRevenueDisplays();
        showScreen('report-screen');
    });
    backToMainFromReportsButton.addEventListener('click', () => showScreen('main-screen'));

    showProductsButton.addEventListener('click', () => {
        renderProductManagementList();
        showScreen('product-management-screen');
    });
    backToMainFromProductsButton.addEventListener('click', () => showScreen('main-screen'));

    addProductButton.addEventListener('click', addProduct);

    productManagementList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-product-button');
        const editButton = e.target.closest('.edit-product-button');

        if (deleteButton) {
            const listItem = e.target.closest('li'); // Doğru liste öğesini bul
            const productId = listItem.dataset.id;
            deleteProduct(productId);
        } else if (editButton) {
            const listItem = e.target.closest('li'); // Doğru liste öğesini bul
            const productId = listItem.dataset.id;
            editProduct(productId, listItem);
        }
    });

    discountButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const discountRate = parseFloat(e.target.dataset.discount);
            applyDiscount(discountRate);
        });
    });

    applyCustomDiscountButton.addEventListener('click', applyCustomDiscount);

    productTabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            productTabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const category = e.target.dataset.category;
            renderProducts(category);
        });
    });

    // --- 9. Başlangıç Yüklemesi ---
    checkAndResetRevenuesAutomatically();
    renderTables();
    updateRevenueDisplays();
});