// --- 1. DOM Elementlerini Seçme ---
// Ekranlar ve genel elementler
const mainScreen = document.getElementById("main-screen")
const orderScreen = document.getElementById("order-screen")
const reportScreen = document.getElementById("report-screen")
const toastContainer = document.getElementById("toast-container")

// Masa Ekranı elementleri
const tablesContainer = document.getElementById("tables-container")
const addTableIconButton = document.getElementById("add-table-icon-button")
const showReportsButton = document.getElementById("show-reports-button")
const dailyTotalRevenueAmountSpan = document.getElementById("daily-total-revenue-amount") // ID değişti
const resetDailyRevenueButton = document.getElementById("reset-daily-revenue-button") // Yeni sıfırlama butonu

// Sipariş Ekranı elementleri
const backToMainButton = document.getElementById("back-to-main-button")
const currentTableDisplay = document.getElementById("current-table-display")
const productList = document.getElementById("product-list")
const orderItems = document.getElementById("order-items")
const discountButtons = document.querySelectorAll(".discount-button")
const appliedDiscountInfo = document.querySelector(".applied-discount-info")
const appliedDiscountRateSpan = document.getElementById("applied-discount-rate")
const discountAmountSpan = document.getElementById("discount-amount")
const totalAmountSpan = document.getElementById("total-amount")
const clearOrderButton = document.getElementById("clear-order-button")
const printReceiptButton = document.getElementById("print-receipt-button")
const completeOrderButton = document.getElementById("complete-order-button")

// Rapor Ekranı elementleri
const backToMainFromReportsButton = document.getElementById("back-to-main-from-reports-button")
const dailyRevenueSpan = document.getElementById("daily-revenue")
const weeklyRevenueSpan = document.getElementById("weekly-revenue")
const monthlyRevenueSpan = document.getElementById("monthly-revenue")

// Fiş Modalı elementleri
const receiptModal = document.getElementById("receipt-modal")
const closeReceiptModalButton = document.querySelector("#receipt-modal .close-button")
const receiptContentArea = document.getElementById("receipt-content")

// Ürün Yönetimi Ekranı elementleri
const productManagementScreen = document.getElementById("product-management-screen")
const showProductsButton = document.getElementById("show-products-button")
const backToMainFromProductsButton = document.getElementById("back-to-main-from-products-button")
const newProductNameInput = document.getElementById("new-product-name")
const newProductPriceInput = document.getElementById("new-product-price")
const addProductButton = document.getElementById("add-product-button")
const productManagementList = document.getElementById("product-management-list")

// --- 2. Uygulama Durumunu Saklama ---
// localStorage kullanarak sayfa yenilendiğinde verilerin kaybolmamasını sağlıyoruz.
const tables = JSON.parse(localStorage.getItem("cafeTables")) || {}
let currentTableId = null
let appliedDiscount = 0

// İşlem geçmişi (raporlama için)
const transactions = JSON.parse(localStorage.getItem("cafeTransactions")) || []

// YENİ: Günlük cironun en son ne zaman manuel olarak sıfırlandığını takip et.
// Bu, 00:00'da otomatik sıfırlama ile karışmaması için kullanılacak.
// Eğer değer yoksa, başlangıçta çok eski bir tarih olarak kabul edilebilir.
let lastDailyManualResetDate = localStorage.getItem("lastDailyManualResetDate")
    ? new Date(localStorage.getItem("lastDailyManualResetDate"))
    : new Date(0) // Epoch zamanı, yani çok eski bir tarih

// Ürün listesi - artık localStorage'dan yükleniyor
let products = JSON.parse(localStorage.getItem("cafeProducts")) || [
    { id: "americano", name: "Americano", price: 50 },
    { id: "latte", name: "Latte", price: 60 },
    { id: "espresso", name: "Espresso", price: 40 },
    { id: "cappuccino", name: "Cappuccino", price: 65 },
    { id: "mocha", name: "Mocha", price: 70 },
    { id: "çay", name: "Çay", price: 25 },
    { id: "bitkisel-çay", name: "Bitkisel Çay", price: 30 },
    { id: "soda", name: "Soda", price: 30 },
    { id: "limonata", name: "Limonata", price: 45 },
    { id: "portakal-suyu", name: "Portakal Suyu", price: 55 },
    { id: "cheesecake", name: "Cheesecake", price: 80 },
    { id: "kurabiye", name: "Kurabiye", price: 35 },
    { id: "sandviç", name: "Sandviç", price: 90 },
    { id: "salata", name: "Salata", price: 110 },
]

// --- 3. Yardımcı Fonksiyonlar ---

// Verileri localStorage'a kaydeder
function saveState() {
    localStorage.setItem("cafeTables", JSON.stringify(tables))
    localStorage.setItem("cafeTransactions", JSON.stringify(transactions))
    localStorage.setItem("cafeProducts", JSON.stringify(products))
    localStorage.setItem("lastDailyManualResetDate", lastDailyManualResetDate.toISOString())
}

// Toplam hesabı hesaplar (iskontosuz)
function calculateSubtotal(order) {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Toplam hesabı iskonto ile hesaplar
function calculateFinalTotal(subtotal, discountRate) {
    if (isNaN(subtotal) || typeof subtotal !== "number") {
        return 0
    }
    return subtotal * (1 - discountRate)
}

// Toast bildirimleri gösterme fonksiyonu
function showToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div")
    toast.classList.add("toast", type)
    toast.textContent = message
    toastContainer.appendChild(toast)

    setTimeout(() => {
        toast.classList.add("show")
    }, 10)

    setTimeout(() => {
        toast.classList.remove("show")
        toast.addEventListener("transitionend", () => toast.remove())
    }, duration)
}

// Ekranları değiştirme fonksiyonu
function showScreen(screenToShow) {
    mainScreen.classList.remove("active-screen")
    orderScreen.classList.remove("active-screen")
    reportScreen.classList.remove("active-screen")
    productManagementScreen.classList.remove("active-screen")

    if (screenToShow === "main") {
        mainScreen.classList.add("active-screen")
        renderTables()
    } else if (screenToShow === "order") {
        orderScreen.classList.add("active-screen")
        renderProducts()
        renderOrder()
    } else if (screenToShow === "reports") {
        reportScreen.classList.add("active-screen")
        renderReports()
    } else if (screenToShow === "products") {
        productManagementScreen.classList.add("active-screen")
        renderProductManagement()
    }
}

// YENİ: Ana ekrandaki günlük ciro gösterimini günceller
function updateDailyRevenueDisplay() {
    const dailyRevenue = calculateCurrentDailyRevenue()
    dailyTotalRevenueAmountSpan.textContent = dailyRevenue.toFixed(2)
}

// YENİ: Günlük ciroyu hesaplama fonksiyonu (hem rapor için hem de ana ekran için)
function calculateCurrentDailyRevenue() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime()

    // Yalnızca manuel sıfırlama tarihinden sonraki veya aynı günkü işlemleri dikkate al.
    // Eğer aynı gün manuel sıfırlama yapıldıysa, sadece o sıfırlamadan sonraki işlemleri al.
    let effectiveStartTime = startOfDay
    if (lastDailyManualResetDate && now.toDateString() === lastDailyManualResetDate.toDateString()) {
        effectiveStartTime = lastDailyManualResetDate.getTime()
    }

    const currentDailyTransactions = transactions.filter(
        (t) => t.timestamp >= effectiveStartTime && t.timestamp <= now.getTime(),
    )
    return currentDailyTransactions.reduce((sum, t) => sum + t.amount, 0)
}

// --- 4. Masa Yönetimi (Ana Ekran) ---

function renderTables() {
    tablesContainer.innerHTML = ""

    if (Object.keys(tables).length === 0) {
        for (let i = 1; i <= 5; i++) {
            tables[i] = { id: i, name: `Masa ${i}`, order: [], discount: 0 }
        }
        saveState()
    }

    const sortedTableIds = Object.keys(tables).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

    sortedTableIds.forEach((tableId) => {
        const table = tables[tableId]
        const tableButton = document.createElement("button")
        tableButton.classList.add("table-button")
        tableButton.dataset.tableId = tableId

        const subtotal = calculateSubtotal(table.order)
        const totalAfterDiscount = calculateFinalTotal(subtotal, table.discount)

        const displayTotal = totalAfterDiscount > 0 ? `${totalAfterDiscount.toFixed(2)}₺` : "Boş"

        tableButton.innerHTML = `Masa ${table.id} <br> <span class="table-total">${displayTotal}</span>`

        const deleteButton = document.createElement("button")
        deleteButton.classList.add("delete-table-button")
        deleteButton.innerHTML = '<i class="fas fa-times"></i>'
        deleteButton.title = `Masa ${table.id} Sil`
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation()
            deleteTable(table.id)
        })
        tableButton.appendChild(deleteButton)

        tablesContainer.appendChild(tableButton)

        tableButton.addEventListener("click", () => {
            currentTableId = tableId
            appliedDiscount = tables[currentTableId].discount || 0
            showScreen("order")
        })
    })
}

addTableIconButton.addEventListener("click", () => {
    const existingTableIds = Object.keys(tables).map((id) => Number.parseInt(id))
    const maxTableId = existingTableIds.length > 0 ? Math.max(...existingTableIds) : 0
    const newTableId = maxTableId + 1

    tables[newTableId] = { id: newTableId, name: `Masa ${newTableId}`, order: [], discount: 0 }
    saveState()
    renderTables()
    showToast(`Masa ${newTableId} eklendi!`, "success")
})

function deleteTable(tableIdToDelete) {
    if (confirm(`Masa ${tableIdToDelete}'yi silmek istediğinize emin misiniz? Siparişleri de silinecektir.`)) {
        if (currentTableId === tableIdToDelete.toString()) {
            currentTableId = null
            appliedDiscount = 0
            showScreen("main")
        }
        delete tables[tableIdToDelete]
        saveState()
        renderTables()
        showToast(`Masa ${tableIdToDelete} başarıyla silindi.`, "success")
    }
}

// --- 5. Ürün Yönetimi (Sipariş Ekranı) ---

function renderProducts() {
    productList.innerHTML = ""
    products.forEach((product) => {
        const productButton = document.createElement("button")
        productButton.classList.add("product-button")
        productButton.dataset.productId = product.id
        productButton.dataset.price = product.price
        productButton.innerHTML = `${product.name}<span>${product.price.toFixed(2)}₺</span>`
        productList.appendChild(productButton)

        productButton.addEventListener("click", () => {
            addProductToOrder(product)
        })
    })
}

function addProductToOrder(product) {
    if (!currentTableId || !tables[currentTableId]) {
        showToast("Lütfen önce bir masa seçin!", "error")
        return
    }

    const currentTable = tables[currentTableId]
    const existingItem = currentTable.order.find((item) => item.id === product.id)

    if (existingItem) {
        existingItem.quantity++
    } else {
        currentTable.order.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
        })
    }
    saveState()
    renderOrder()
    showToast(`${product.name} siparişe eklendi!`, "success")
}

// --- 6. Sipariş Yönetimi (Sipariş Ekranı) ---

function renderOrder() {
    const currentTable = tables[currentTableId]
    currentTableDisplay.textContent = currentTable.name

    orderItems.innerHTML = ""
    if (currentTable.order.length === 0) {
        orderItems.innerHTML =
            '<li style="text-align: center; color: var(--text-medium); padding: 20px;">Bu masada henüz sipariş yok.</li>'
    } else {
        currentTable.order.forEach((item) => {
            const listItem = document.createElement("li")
            listItem.innerHTML = `
                <span class="item-info">
                    ${item.name} 
                    <div class="qty-controls">
                        <button class="qty-button minus" data-product-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="qty-button plus" data-product-id="${item.id}">+</button>
                    </div>
                </span>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)}₺</span>
            `
            orderItems.appendChild(listItem)
        })
    }

    const subtotal = calculateSubtotal(currentTable.order)
    const discountAmount = subtotal * appliedDiscount
    const finalTotal = calculateFinalTotal(subtotal, appliedDiscount)

    totalAmountSpan.textContent = finalTotal.toFixed(2)
    appliedDiscountRateSpan.textContent = `${(appliedDiscount * 100).toFixed(0)}%`
    discountAmountSpan.textContent = discountAmount.toFixed(2)

    if (appliedDiscount > 0) {
        appliedDiscountInfo.style.display = "block"
    } else {
        appliedDiscountInfo.style.display = "none"
    }

    discountButtons.forEach((button) => {
        button.classList.remove("active")
        const buttonRate = Number.parseFloat(button.dataset.discountRate)
        if (!isNaN(buttonRate) && buttonRate === appliedDiscount) {
            button.classList.add("active")
        } else if (button.classList.contains("reset-discount") && appliedDiscount === 0) {
            button.classList.add("active")
        }
    })

    document.querySelectorAll(".qty-button").forEach((button) => {
        button.onclick = (event) => {
            const productId = event.target.dataset.productId
            if (event.target.classList.contains("plus")) {
                changeItemQuantity(productId, 1)
            } else if (event.target.classList.contains("minus")) {
                changeItemQuantity(productId, -1)
            }
        }
    })
}

function changeItemQuantity(productId, change) {
    const currentTable = tables[currentTableId]
    const itemIndex = currentTable.order.findIndex((item) => item.id === productId)

    if (itemIndex > -1) {
        currentTable.order[itemIndex].quantity += change
        if (currentTable.order[itemIndex].quantity <= 0) {
            currentTable.order.splice(itemIndex, 1)
            showToast(`${products.find((p) => p.id === productId).name} siparişten kaldırıldı.`, "error")
        } else {
            showToast(`${products.find((p) => p.id === productId).name} adedi güncellendi.`, "info")
        }
        tables[currentTableId].discount = appliedDiscount
        saveState()
        renderOrder()
    }
}

// --- İskonto Uygulama ---
discountButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        if (event.target.classList.contains("reset-discount")) {
            appliedDiscount = 0
            showToast("İskonto sıfırlandı.", "info")
        } else {
            const rate = Number.parseFloat(event.target.dataset.discountRate)
            appliedDiscount = rate
            showToast(`%${(rate * 100).toFixed(0)} iskonto uygulandı.`, "info")
        }
        tables[currentTableId].discount = appliedDiscount
        saveState()
        renderOrder()
    })
})

// --- Aksiyon Butonları ---

clearOrderButton.addEventListener("click", () => {
    const currentTable = tables[currentTableId]
    if (currentTable.order.length === 0) {
        showToast(`Bu masada temizlenecek bir sipariş bulunmuyor.`, "info")
        return
    }
    if (confirm(`${currentTable.name} siparişini tamamen temizlemek istediğinize emin misiniz?`)) {
        currentTable.order = []
        currentTable.discount = 0
        appliedDiscount = 0
        saveState()
        renderOrder()
        showToast(`${currentTable.name} siparişi temizlendi!`, "success")
    }
})

printReceiptButton.addEventListener("click", () => {
    const currentTable = tables[currentTableId]
    if (currentTable.order.length === 0) {
        showToast(`Bu masada fiş çıkarılacak sipariş bulunmuyor.`, "info")
        return
    }

    const subtotal = calculateSubtotal(currentTable.order)
    const finalTotal = calculateFinalTotal(subtotal, currentTable.discount)
    const discountAmount = subtotal * currentTable.discount

    let receiptHtml = `
        <div class="receipt-header">
            <h2>${currentTable.name} Fişi</h2>
            <p>Tarih: ${new Date().toLocaleDateString("tr-TR")}</p>
            <p>Saat: ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
            <p class="receipt-line">---------------------------------</p>
        </div>
        <div class="receipt-items">
            <ul class="receipt-item-list">
    `
    currentTable.order.forEach((item) => {
        receiptHtml += `
                <li class="receipt-item">
                    <span class="qty-name">${item.name} (x${item.quantity})</span>
                    <span class="item-total">${(item.price * item.quantity).toFixed(2)}₺</span>
                </li>
        `
    })
    receiptHtml += `
            </ul>
        </div>
        <div class="receipt-totals">
            <div>Ara Toplam: <span>${subtotal.toFixed(2)}₺</span></div>
    `
    if (currentTable.discount > 0) {
        receiptHtml += `
            <div>İskonto (${(currentTable.discount * 100).toFixed(0)}%): <span>-${discountAmount.toFixed(2)}₺</span></div>
        `
    }
    receiptHtml += `
            <div class="final-total">TOPLAM: <span>${finalTotal.toFixed(2)}₺</span></div>
        </div>
        <div class="receipt-footer">
            <p class="receipt-line">---------------------------------</p>
            <p style="text-align: center;">Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!</p>
        </div>
    `

    receiptContentArea.innerHTML = receiptHtml
    receiptModal.style.display = "flex"
    showToast(`${currentTable.name} için fiş önizlemesi hazır.`, "info")
})

closeReceiptModalButton.addEventListener("click", () => {
    receiptModal.style.display = "none"
})

window.addEventListener("click", (event) => {
    if (event.target === receiptModal) {
        receiptModal.style.display = "none"
    }
})

completeOrderButton.addEventListener("click", () => {
    const currentTable = tables[currentTableId]
    const subtotal = calculateSubtotal(currentTable.order)
    const finalTotal = calculateFinalTotal(subtotal, currentTable.discount)

    if (currentTable.order.length === 0) {
        showToast(`${currentTable.name} için tamamlanacak bir sipariş bulunmuyor.`, "info")
        return
    }

    if (confirm(`${currentTable.name} siparişi ${finalTotal.toFixed(2)}₺ ile tamamlanacak. Onaylıyor musunuz?`)) {
        // Ciroya ekleme artık transactions üzerinden yapılacak.
        // totalRevenue değişkeni kaldırıldı.

        // İşlem kaydını oluştur ve ekle
        transactions.push({
            table: currentTable.name,
            amount: finalTotal,
            timestamp: new Date().getTime(), // İşlemin kaydedildiği anın zaman damgası
        })

        showToast(`${currentTable.name} siparişi ${finalTotal.toFixed(2)}₺ ile başarıyla tamamlandı!`, "success")

        currentTable.order = []
        currentTable.discount = 0
        appliedDiscount = 0

        saveState()
        showScreen("main")
    }
})

// --- Geri Dön Butonu ---
backToMainButton.addEventListener("click", () => {
    showScreen("main")
    currentTableId = null
    appliedDiscount = 0
})

// --- Raporlama Fonksiyonları ve Butonları ---

showReportsButton.addEventListener("click", () => {
    showScreen("reports")
})

backToMainFromReportsButton.addEventListener("click", () => {
    showScreen("main")
})

function renderReports() {
    const now = new Date()

    // Günlük Ciro
    const dailyRevenue = calculateCurrentDailyRevenue() // Ortak fonksiyonu kullan
    dailyRevenueSpan.textContent = dailyRevenue.toFixed(2) + "₺"

    // Haftalık Ciro (Pazartesi'den Pazara)
    const dayOfWeek = now.getDay() // Pazar 0, Pazartesi 1, ... Cumartesi 6
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Pazar ise önceki Pazartesi, değilse bu haftanın Pazartesi'si
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0).getTime()
    const endOfWeek = startOfWeek + 7 * 24 * 60 * 60 * 1000 - 1 // 7 gün sonrası eksi 1 milisaniye

    const weeklyRevenue = transactions
        .filter((t) => t.timestamp >= startOfWeek && t.timestamp <= endOfWeek)
        .reduce((sum, t) => sum + t.amount, 0)
    weeklyRevenueSpan.textContent = weeklyRevenue.toFixed(2) + "₺"

    // Aylık Ciro
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).getTime()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime() // Sonraki ayın 0. günü = bu ayın son günü
    const monthlyRevenue = transactions
        .filter((t) => t.timestamp >= startOfMonth && t.timestamp <= endOfMonth)
        .reduce((sum, t) => sum + t.amount, 0)
    monthlyRevenueSpan.textContent = monthlyRevenue.toFixed(2) + "₺"
}

// --- Ürün Yönetimi Fonksiyonları ---

function renderProductManagement() {
    productManagementList.innerHTML = ""

    if (products.length === 0) {
        productManagementList.innerHTML =
            '<p style="text-align: center; color: var(--text-medium); padding: 40px;">Henüz ürün bulunmuyor. Yukarıdaki formu kullanarak yeni ürün ekleyebilirsiniz.</p>'
        return
    }

    products.forEach((product) => {
        const productItem = document.createElement("div")
        productItem.classList.add("product-management-item")
        productItem.dataset.productId = product.id

        productItem.innerHTML = `
      <div class="product-info">
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${product.price.toFixed(2)}₺</div>
        </div>
        <div class="product-actions">
          <button class="edit-product-button">
            <i class="fas fa-edit"></i> Düzenle
          </button>
          <button class="delete-product-button">
            <i class="fas fa-trash"></i> Sil
          </button>
        </div>
      </div>
      <div class="edit-form">
        <div class="form-inputs">
          <input type="text" class="edit-name-input" value="${product.name}" placeholder="Ürün Adı">
          <input type="number" class="edit-price-input" value="${product.price}" min="0" step="0.01" placeholder="Fiyat">
        </div>
        <div class="form-buttons">
          <button class="save-product-button">Kaydet</button>
          <button class="cancel-edit-button">İptal</button>
        </div>
      </div>
    `

        productManagementList.appendChild(productItem)
    })

    // Event listeners for edit and delete buttons
    document.querySelectorAll(".edit-product-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const productItem = e.target.closest(".product-management-item")
            enterEditMode(productItem)
        })
    })

    document.querySelectorAll(".delete-product-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const productItem = e.target.closest(".product-management-item")
            const productId = productItem.dataset.productId
            deleteProduct(productId)
        })
    })

    document.querySelectorAll(".save-product-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const productItem = e.target.closest(".product-management-item")
            saveProductEdit(productItem)
        })
    })

    document.querySelectorAll(".cancel-edit-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const productItem = e.target.closest(".product-management-item")
            exitEditMode(productItem)
        })
    })
}

function generateProductId(name) {
    return name
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
}

function addNewProduct() {
    const name = newProductNameInput.value.trim()
    const price = Number.parseFloat(newProductPriceInput.value)

    if (!name) {
        showToast("Lütfen ürün adını girin!", "error")
        return
    }

    if (isNaN(price) || price <= 0) {
        showToast("Lütfen geçerli bir fiyat girin!", "error")
        return
    }

    const id = generateProductId(name)

    // Check if product already exists
    if (products.find((p) => p.id === id)) {
        showToast("Bu isimde bir ürün zaten mevcut!", "error")
        return
    }

    const newProduct = {
        id: id,
        name: name,
        price: price,
    }

    products.push(newProduct)
    saveState()
    renderProductManagement()

    // Clear form
    newProductNameInput.value = ""
    newProductPriceInput.value = ""

    showToast(`${name} başarıyla eklendi!`, "success")
}

function deleteProduct(productId) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (confirm(`"${product.name}" ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
        // Check if product is used in any existing orders
        let isUsedInOrders = false
        Object.values(tables).forEach((table) => {
            if (table.order.some((item) => item.id === productId)) {
                isUsedInOrders = true
            }
        })

        if (isUsedInOrders) {
            if (
                !confirm(
                    "Bu ürün mevcut siparişlerde kullanılıyor. Silmek istediğinize emin misiniz? Mevcut siparişlerden de kaldırılacak.",
                )
            ) {
                return
            }

            // Remove from all existing orders
            Object.values(tables).forEach((table) => {
                table.order = table.order.filter((item) => item.id !== productId)
            })
        }

        products = products.filter((p) => p.id !== productId)
        saveState()
        renderProductManagement()
        showToast(`${product.name} başarıyla silindi!`, "success")
    }
}

function enterEditMode(productItem) {
    productItem.classList.add("editing")
}

function exitEditMode(productItem) {
    productItem.classList.remove("editing")
}

function saveProductEdit(productItem) {
    const productId = productItem.dataset.productId
    const nameInput = productItem.querySelector(".edit-name-input")
    const priceInput = productItem.querySelector(".edit-price-input")

    const newName = nameInput.value.trim()
    const newPrice = Number.parseFloat(priceInput.value)

    if (!newName) {
        showToast("Lütfen ürün adını girin!", "error")
        return
    }

    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Lütfen geçerli bir fiyat girin!", "error")
        return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return

    const oldName = product.name
    product.name = newName
    product.price = newPrice

    // Update existing orders with new price and name
    Object.values(tables).forEach((table) => {
        table.order.forEach((item) => {
            if (item.id === productId) {
                item.name = newName
                item.price = newPrice
            }
        })
    })

    saveState()
    renderProductManagement()
    showToast(`${oldName} başarıyla güncellendi!`, "success")
}

// Event Listeners for Product Management
showProductsButton.addEventListener("click", () => {
    showScreen("products")
})

backToMainFromProductsButton.addEventListener("click", () => {
    showScreen("main")
})

addProductButton.addEventListener("click", addNewProduct)

// Allow Enter key to add product
newProductNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        newProductPriceInput.focus()
    }
})

newProductPriceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addNewProduct()
    }
})

// --- 7. Uygulamayı Başlatma ---
// Sayfa yüklendiğinde bu fonksiyonları çağırarak paneli başlatıyoruz.
document.addEventListener("DOMContentLoaded", () => {
    // Otomatik günlük sıfırlama kontrolü
    const now = new Date()
    const lastResetDay = new Date(lastDailyManualResetDate)

    // Eğer son manuel sıfırlama bugünden önceyse, otomatik sıfırlama yap.
    // Yani gece 00:00'dan sonra ilk açılışta veya ilk işlemde.
    if (now.toDateString() !== lastResetDay.toDateString()) {
        lastDailyManualResetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0) // Bugünün başlangıcına ayarla
        saveState() // Bu sıfırlama tarihini kaydet
    }

    showScreen("main")
})
