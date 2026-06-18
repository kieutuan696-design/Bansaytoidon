/* ================================================================
   script.js — BẠN SAY TÔI ĐÓN v2.0
   Vanilla JavaScript — Không dùng thư viện ngoài
   ================================================================
   MỤC LỤC:
   1.  toggleMenu()        — Đóng/Mở menu mobile 
   2.  checkReveal()       — Scroll Reveal animation 
   3.  openModal()         — Đóng/Mở form đặt xe 
   4A. quickDest()         — Chọn nhanh điểm đến 
   4B. quickNote()         — Thêm nhanh ghi chú 
   4C. vehicleToggle()     — Hiện spec xe máy/ô tô 
   4D. bookForOther()      — Đặt hộ người khác 
   4E. timeToggle()        — Đón ngay / Đặt lịch 
   4F. geoLocate()         — Định vị GPS 
   4G. submitOrder()       — Gửi form đặt xe 
   5.  openServicePanel()  — Mở panel chi tiết dịch vụ (MỚI)
   6.  closeServicePanel() — Đóng panel (MỚI)
   7.  headerScroll()      — Hiệu ứng header khi cuộn (MỚI)
   8.  notifySubmit()      — Đăng ký thông báo giao hàng (MỚI)
   ================================================================ */

document.addEventListener("DOMContentLoaded", function() {
    /* ============================================================
         KHỐI 1 — XỬ LÝ MENU MOBILE DROPDOWN (SLIDE + FADE)
         ─────────────────────────────────────────────────────────
         Tên hàm  : toggleMenu (inline, gắn trên menuToggle click)
         Mục đích : Mở/đóng menu dọc trên mobile khi bấm nút 3 gạch.
                    Đồng thời animate 3 gạch → dấu X chéo.
         HTML     : index.html → <button id="menuToggle">
                                 <nav id="navMenu">
         CSS      : style.css → .nav-menu.open (dòng ~238)
                    style.css → .menu-toggle .bar (dòng ~173)
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    menuToggle.addEventListener("click", function(e) {
        e.stopPropagation();
        navMenu.classList.toggle("open");

        /* Animate 3 gạch thành dấu X khi menu mở */
        const bars = menuToggle.querySelectorAll(".bar");
        if (navMenu.classList.contains("open")) {
            bars[0].style.transform = "rotate(45deg) translate(5px, 5px)";
            bars[1].style.opacity = "0";
            bars[2].style.transform = "rotate(-45deg) translate(6px, -6px)";
        } else {
            bars[0].style.transform = "none";
            bars[1].style.opacity = "1";
            bars[2].style.transform = "none";
        }
    });

    /* Đóng menu khi click ra ngoài vùng menu */
    document.addEventListener("click", function(event) {
        if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            if (navMenu.classList.contains("open")) {
                navMenu.classList.remove("open");
                const bars = menuToggle.querySelectorAll(".bar");
                bars[0].style.transform = "none";
                bars[1].style.opacity = "1";
                bars[2].style.transform = "none";
            }
        }
    });

    /* ============================================================
         KHỐI 2 — SCROLL REVEAL ANIMATION
         ─────────────────────────────────────────────────────────
         Tên hàm  : checkReveal()
         Mục đích : Kích hoạt fade-in + slide-up cho các phần tử
                    có class .scroll-reveal khi chúng xuất hiện
                    trong vùng nhìn thấy của màn hình.
         HTML     : Tất cả thẻ có class="scroll-reveal"
         CSS      : style.css → .scroll-reveal, .scroll-reveal.active (dòng ~62)
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const revealElements = document.querySelectorAll(".scroll-reveal");

    function checkReveal() {
        /* Kích hoạt khi phần tử lộ 15% từ đáy màn hình */
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", checkReveal);
    checkReveal(); /* Chạy lần đầu khi load để reveal phần tử đang visible */

    /* ============================================================
         KHỐI 3 — ĐÓNG / MỞ MODAL FORM ĐẶT XE
         ─────────────────────────────────────────────────────────
         Tên hàm  : openModal() / closeModal()
         Mục đích : Mở overlay modal form đặt xe khi bấm bất kỳ
                    nút nào có class .open-modal-btn trên toàn trang.
                    Khóa cuộn trang nền khi modal mở.
         HTML     : index.html → class="open-modal-btn" (nhiều nút)
                                 id="bookingModal", id="closeModal"
         CSS      : style.css → .modal-overlay.open (dòng ~640)
         GIỮ NGUYÊN GỐC + mở rộng để bắt cả nút trong panel
         ============================================================ */
    const bookingModal = document.getElementById("bookingModal");
    const closeModalBtn = document.getElementById("closeModal");

    /* Dùng event delegation để bắt TẤT CẢ .open-modal-btn
         kể cả những nút được tạo động hoặc trong panel */
    /* =======================================================
       SỬA ĐỔI: Phân luồng mở Modal độc lập (Không bị trùng lặp)
       ======================================================= */
    document.addEventListener("click", function(e) {
        const targetBtn = e.target.closest(".open-modal-btn");

        if (targetBtn) {
            // 1. KIỂM TRA: Nếu nút này nằm trong panel Tài Xế Theo Giờ (#panel-hourly)
            if (
                targetBtn.closest("#panel-hourly") ||
                targetBtn.closest(".panel--hourly")
            ) {
                e.preventDefault();

                // Đóng cái panel giới thiệu dịch vụ hiện tại trước
                closeServicePanel();

                // Gọi hàm mở Modal theo giờ độc lập
                if (typeof window.openHourlyModal === "function") {
                    window.openHourlyModal();
                }
                return; // Thoát hàm luôn, không cho chạy xuống mở form cũ
            }

            // 2. MẶC ĐỊNH: Nếu bấm các nút khác thì mở form Bạn Say Tôi Đón cũ
            openModal();
        }
    });

    function openModal() {
        bookingModal.classList.add("open");
        document.body.style.overflow = "hidden"; /* Khóa cuộn trang nền */
        /* Nếu có panel đang mở → đóng panel trước */
        closeServicePanel();
    }

    function closeModal() {
        bookingModal.classList.remove("open");
        document.body.style.overflow = ""; /* Trả lại cuộn bình thường */
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

    /* Click vào khoảng trống overlay bên ngoài hộp thoại → đóng */
    bookingModal.addEventListener("click", function(e) {
        if (e.target === bookingModal) closeModal();
    });

    /* Phím ESC → đóng mọi modal đang mở */
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeModal();
            closeServicePanel();

            // Đóng thêm cả modal theo giờ nếu nó đang mở
            const hourlyModal = document.getElementById("hourlyModal");
            if (hourlyModal) hourlyModal.style.display = "none";
        }
    });

    /* ============================================================
         KHỐI 4A — CHỌN NHANH ĐIỂM ĐẾN
         ─────────────────────────────────────────────────────────
         Tên hàm  : quickDest (inline trên event listener)
         Mục đích : Bấm nút .btn-quick → điền nhanh giá trị
                    data-dest vào ô nhập điểm đến, kèm flash highlight.
         HTML     : index.html → class="btn-quick" data-dest="..."
                                 id="dropoffInput"
         CSS      : style.css → .btn-quick, .btn-quick:hover
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const quickDestBtns = document.querySelectorAll(".btn-quick");
    const dropoffInput = document.getElementById("dropoffInput");

    quickDestBtns.forEach((btn) => {
        btn.addEventListener("click", function() {
            dropoffInput.value = this.getAttribute("data-dest");
            /* Flash xanh nhẹ xác nhận đã điền */
            dropoffInput.style.backgroundColor = "#e0f2fe";
            setTimeout(() => (dropoffInput.style.backgroundColor = ""), 300);
        });
    });

    /* ============================================================
         KHỐI 4B — THÊM NHANH GHI CHÚ CHO TÀI XẾ
         ─────────────────────────────────────────────────────────
         Tên hàm  : quickNote (inline trên event listener)
         Mục đích : Bấm nút .btn-quick-note → append nội dung
                    vào textarea ghi chú, không trùng lặp.
         HTML     : index.html → class="btn-quick-note"
                                 id="driverNotes"
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const quickNoteBtns = document.querySelectorAll(".btn-quick-note");
    const driverNotes = document.getElementById("driverNotes");

    quickNoteBtns.forEach((btn) => {
        btn.addEventListener("click", function() {
            const text = this.innerText;
            if (driverNotes.value.trim() === "") {
                driverNotes.value = text;
            } else if (!driverNotes.value.includes(text)) {
                driverNotes.value += ", " + text;
            }
            driverNotes.focus();
        });
    });

    /* ============================================================
         KHỐI 4C — HIỂN THỊ THÔNG TIN XE THEO LOẠI
         ─────────────────────────────────────────────────────────
         Tên hàm  : vehicleToggle (inline trên event listener)
         Mục đích : Khi chọn radio "Xe máy" hoặc "Ô tô",
                    hiện/ẩn tương ứng cụm specs xe máy / ô tô.
         HTML     : index.html → input[name="vehicleType"]
                                 id="motoSpecs", id="carSpecs"
         CSS      : style.css → .hidden { display: none !important }
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const vehicleRadioBtns = document.querySelectorAll(
        'input[name="vehicleType"]',
    );
    const motoSpecs = document.getElementById("motoSpecs");
    const carSpecs = document.getElementById("carSpecs");

    vehicleRadioBtns.forEach((radio) => {
        radio.addEventListener("change", function() {
            if (this.value === "Xe máy") {
                motoSpecs.classList.remove("hidden");
                carSpecs.classList.add("hidden");
            } else if (this.value === "Ô tô") {
                carSpecs.classList.remove("hidden");
                motoSpecs.classList.add("hidden");
            }
        });
    });

    /* ============================================================
         KHỐI 4D — CHECKBOX ĐẶT HỘ NGƯỜI KHÁC
         ─────────────────────────────────────────────────────────
         Tên hàm  : bookForOther (inline trên event listener)
         Mục đích : Khi tick "Đặt hộ người khác" → hiện thêm
                    2 ô nhập tên và SĐT người đi, thêm required.
                    Bỏ tick → ẩn lại, xóa required.
         HTML     : index.html → id="bookingForOther"
                                 id="otherPassengerInfo"
                                 id="otherName", id="otherPhone"
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const bookingForOtherCheckbox = document.getElementById("bookingForOther");
    const otherPassengerInfo = document.getElementById("otherPassengerInfo");
    const otherNameInput = document.getElementById("otherName");
    const otherPhoneInput = document.getElementById("otherPhone");

    bookingForOtherCheckbox.addEventListener("change", function() {
        if (this.checked) {
            otherPassengerInfo.classList.remove("hidden");
            otherNameInput.setAttribute("required", "required");
            otherPhoneInput.setAttribute("required", "required");
        } else {
            otherPassengerInfo.classList.add("hidden");
            otherNameInput.removeAttribute("required");
            otherPhoneInput.removeAttribute("required");
        }
    });

    /* ============================================================
         KHỐI 4E — TOGGLE THỜI GIAN ĐÓN
         ─────────────────────────────────────────────────────────
         Tên hàm  : timeToggle (inline trên event listener)
         Mục đích : "Đón ngay" → ẩn input datetime, xóa required.
                    "Đặt lịch" → hiện input datetime, thêm required,
                                 set giá trị min là 15 phút từ bây giờ.
         HTML     : index.html → id="timeNow", id="timeSchedule"
                                 id="scheduleInputs", id="scheduleDateTime"
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const timeNowBtn = document.getElementById("timeNow");
    const timeScheduleBtn = document.getElementById("timeSchedule");
    const scheduleInputs = document.getElementById("scheduleInputs");
    const datetimeInput = document.getElementById("scheduleDateTime");

    timeNowBtn.addEventListener("click", function() {
        this.classList.add("active");
        timeScheduleBtn.classList.remove("active");
        scheduleInputs.classList.add("hidden");
        datetimeInput.removeAttribute("required");
    });

    timeScheduleBtn.addEventListener("click", function() {
        this.classList.add("active");
        timeNowBtn.classList.remove("active");
        scheduleInputs.classList.remove("hidden");
        datetimeInput.setAttribute("required", "required");

        /* Đặt thời gian tối thiểu là 15 phút từ hiện tại */
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        const formatted = now.toISOString().slice(0, 16);
        datetimeInput.min = formatted;
        if (!datetimeInput.value) datetimeInput.value = formatted;
    });

    /* ============================================================
         KHỐI 4F — ĐỊNH VỊ GPS (GEOLOCATION API)
         ─────────────────────────────────────────────────────────
         Tên hàm  : geoLocate (inline trên event listener)
         Mục đích : Bấm nút "Định vị" → trình duyệt hỏi quyền GPS,
                    nếu được cấp → điền tọa độ lat/lng vào ô điểm đón.
         HTML     : index.html → id="geoBtn", id="pickupInput"
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const geoBtn = document.getElementById("geoBtn");
    const pickupInput = document.getElementById("pickupInput");

    geoBtn.addEventListener("click", function() {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
            return;
        }

        geoBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...';
        geoBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude.toFixed(5);
                const lng = position.coords.longitude.toFixed(5);
                pickupInput.value = `Vị trí định vị: [Vĩ độ: ${lat}, Kinh độ: ${lng}]`;
                pickupInput.style.backgroundColor = "#e0f2fe";
                setTimeout(() => (pickupInput.style.backgroundColor = ""), 400);

                geoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Xong';
                geoBtn.disabled = false;
            },
            function() {
                alert(
                    "Không thể lấy vị trí. Vui lòng cấp quyền GPS hoặc nhập tay địa chỉ.",
                );
                geoBtn.innerHTML = '<i class="fa-solid fa-location-arrow"></i> Định vị';
                geoBtn.disabled = false;
            }, { enableHighAccuracy: true, timeout: 5000 },
        );
    });

    /* ============================================================
         KHỐI 4G — XỬ LÝ GỬI FORM ĐẶT XE (SUBMIT)
         ─────────────────────────────────────────────────────────
         Tên hàm  : submitOrder (inline trên form submit)
         Mục đích : Ngăn reload trang, thu thập dữ liệu form,
                    hiển thị thông báo xác nhận, reset form, đóng modal.
         HTML     : index.html → id="orderForm"
         TODO     : Thay alert() bằng fetch() gọi API thực khi có backend
         GIỮ NGUYÊN GỐC
         ============================================================ */
    const orderForm = document.getElementById("orderForm");

    orderForm.addEventListener("submit", function(e) {
        e.preventDefault(); /* Ngăn reload trang mặc định */

        /* Thu thập dữ liệu các trường */
        const pickup = pickupInput.value;
        const dropoff = dropoffInput.value;
        const vehicle = document.querySelector(
            'input[name="vehicleType"]:checked',
        ).value;
        const plate = document.getElementById("plateNumber").value;
        const phone = document.getElementById("phoneInput").value;
        const payment = document.getElementById("paymentMethod").value;
        const isScheduled = timeScheduleBtn.classList.contains("active");
        const timeText = isScheduled ? datetimeInput.value : "Đón ngay lập tức";

        /* Thông báo xác nhận (TODO: thay bằng API thực) */
        alert(
            `🎉 ĐẶT XE THÀNH CÔNG!\n\n` +
            `Hệ thống đang điều phối tài xế gần nhất đến:\n` +
            `📍 Điểm đón: ${pickup}\n` +
            `🏁 Điểm đến: ${dropoff}\n` +
            `🚗 Phương tiện: ${vehicle} (${plate})\n` +
            `⏱ Thời gian: ${timeText}\n` +
            `📞 SĐT liên lạc: ${phone}\n` +
            `💳 Thanh toán: ${payment}\n\n` +
            `Tài xế sẽ gọi điện xác nhận trong 1–3 phút. Chúc bạn chuyến đi an toàn!`,
        );

        /* Reset form về trạng thái mặc định */
        orderForm.reset();
        timeNowBtn.click(); /* Reset toggle thời gian */
        if (bookingForOtherCheckbox.checked)
            bookingForOtherCheckbox.click(); /* Reset đặt hộ */
        closeModal();
    });

    /* ============================================================
         KHỐI 5 — MỞ / ĐÓNG PANEL CHI TIẾT DỊCH VỤ
         ─────────────────────────────────────────────────────────
         Tên hàm  : openServicePanel(serviceKey) / closeServicePanel()
         Mục đích : Khi bấm nút .more-link trên card dịch vụ,
                    đọc attribute data-service → tìm panel tương ứng
                    (id="panel-{serviceKey}") → slide vào từ bên phải.
                    Hiện panel-overlay để mờ nền, click overlay → đóng.
         HTML     : index.html → button.more-link[data-service="drunk"]
                                 div.service-panel#panel-drunk
                                 div#panelOverlay
         CSS      : style.css → .service-panel.open (dòng ~735)
                    style.css → .panel-overlay.active (dòng ~710)
         ============================================================ */
    const panelOverlay = document.getElementById("panelOverlay");
    let activePanelEl = null; /* Lưu panel đang mở để đóng đúng */

    function openServicePanel(serviceKey) {
        /* Đóng panel cũ nếu đang mở */
        if (activePanelEl) closeServicePanel();

        const panel = document.getElementById("panel-" + serviceKey);
        if (!panel) return;

        activePanelEl = panel;
        panel.classList.add("open");
        panelOverlay.classList.add("active");
        document.body.style.overflow = "hidden"; /* Khóa cuộn trang */
    }

    function closeServicePanel() {
        if (!activePanelEl) return;
        activePanelEl.classList.remove("open");
        panelOverlay.classList.remove("active");
        activePanelEl = null;
        /* Chỉ trả lại cuộn nếu modal cũng không đang mở */
        if (!bookingModal.classList.contains("open")) {
            document.body.style.overflow = "";
        }
    }

    /* Gắn sự kiện click cho tất cả nút .more-link trên card */
    document.querySelectorAll(".more-link").forEach((btn) => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const key = this.getAttribute("data-service");
            openServicePanel(key);
        });
    });

    /* Gắn sự kiện cho tất cả nút .panel-close trong panel */
    document.querySelectorAll(".panel-close").forEach((btn) => {
        btn.addEventListener("click", closeServicePanel);
    });

    /* Click overlay → đóng panel */
    panelOverlay.addEventListener("click", closeServicePanel);

    /* ============================================================
         KHỐI 6 — HIỆU ỨNG HEADER KHI CUỘN TRANG
         ─────────────────────────────────────────────────────────
         Tên hàm  : headerScroll (inline trên scroll event)
         Mục đích : Khi cuộn trang > 40px → thêm class .scrolled
                    vào header để tăng độ đậm bóng đổ.
         HTML     : index.html → <header class="main-header">
         CSS      : style.css → .main-header.scrolled (dòng ~143)
         ============================================================ */
    const mainHeader = document.querySelector(".main-header");

    window.addEventListener(
        "scroll",
        function() {
            if (window.scrollY > 40) {
                mainHeader.classList.add("scrolled");
            } else {
                mainHeader.classList.remove("scrolled");
            }
        }, { passive: true },
    );

    /* ============================================================
         KHỐI 7 — XỬ LÝ FORM ĐĂNG KÝ THÔNG BÁO GIAO HÀNG
         ─────────────────────────────────────────────────────────
         Tên hàm  : notifySubmit (inline trên click)
         Mục đích : Trong panel "Giao hàng" (sắp ra mắt),
                    người dùng nhập SĐT → bấm đăng ký → thông báo
                    đã ghi nhận, xóa input.
         HTML     : index.html → id="notifyPhone", id="notifySubmit"
         ============================================================ */
    const notifySubmitBtn = document.getElementById("notifySubmit");
    const notifyPhoneInput = document.getElementById("notifyPhone");

    if (notifySubmitBtn && notifyPhoneInput) {
        notifySubmitBtn.addEventListener("click", function() {
            const phone = notifyPhoneInput.value.trim();

            if (!phone) {
                notifyPhoneInput.style.borderColor = "#ef4444";
                notifyPhoneInput.focus();
                setTimeout(() => (notifyPhoneInput.style.borderColor = ""), 1500);
                return;
            }

            /* Giả lập đăng ký thành công (TODO: thay bằng API thực) */
            this.innerHTML =
                '<i class="fa-solid fa-check"></i> Đã đăng ký thành công!';
            this.style.background = "#22c55e";
            this.disabled = true;
            notifyPhoneInput.value = "";
            notifyPhoneInput.placeholder = `SĐT ${phone} đã được ghi nhận!`;
        });
    }
}); /* ── End DOMContentLoaded ── */

/**
 * Hàm cập nhật hiển thị tổng số tiền lên giao diện đặt xe
 * @param {number} basePrice - Giá gốc chuyến đi (Ví dụ: 180000)
 * @param {number} discountAmount - Số tiền được giảm (Ví dụ: 100000)
 */
function updatePaymentSummary(basePrice, discountAmount) {
    // Đảm bảo số tiền cuối cùng không bị âm dưới 0đ
    let finalTotal = basePrice - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    // Định dạng số thành dạng tiền tệ VNĐ (ví dụ: 180000 -> 180.000đ)
    const formatMoney = (amount) => amount.toLocaleString("vi-VN") + "đ";

    // Đẩy dữ liệu đã tính toán trực tiếp lên giao diện HTML
    document.getElementById("temp-price").innerText = formatMoney(basePrice);
    document.getElementById("discount-price").innerText =
        "-" + formatMoney(discountAmount);
    document.getElementById("final-total-price").innerText =
        formatMoney(finalTotal);
}

// CHỨC NĂNG XỬ LÝ RIÊNG CHO MODAL TÀI XẾ THEO GIỜ
document.addEventListener("DOMContentLoaded", function() {
    const hourlyModal = document.getElementById("hourlyModal");
    const closeHourlyBtn = document.getElementById("closeHourlyModal");
    const hourlyForm = document.getElementById("hourlyBookingForm");
    const packageCards = document.querySelectorAll(".hourly-package-card");

    // --- 1. HÀM MỞ VÀ ĐÓNG MODAL ---
    // Hàm này dùng để kích hoạt hiển thị Modal từ bên ngoài
    window.openHourlyModal = function() {
        hourlyModal.style.display = "block";
        // Cài đặt ngày giờ hiện tại làm mặc định khi mở lên
        const now = new Date();
        document.getElementById("hourlyDate").value = now
            .toISOString()
            .split("T")[0];
        document.getElementById("hourlyTime").value = now
            .toTimeString()
            .split(" ")[0]
            .substring(0, 5);
        // Reset về gói 2 tiếng mặc định
        updateHourlyPrice(300000);
    };

    // Đóng modal khi bấm nút (X)
    if (closeHourlyBtn) {
        closeHourlyBtn.addEventListener("click", () => {
            hourlyModal.style.display = "none";
        });
    }

    // Đóng modal khi bấm trượt chuột ra vùng đen bên ngoài bản panel
    window.addEventListener("click", (event) => {
        if (event.target === hourlyModal) {
            hourlyModal.style.display = "none";
        }
    });

    // --- 2. XỬ LÝ TÍNH TOÁN GIÁ TIỀN GÓI THEO GIỜ ---
    packageCards.forEach((card) => {
        card.addEventListener("click", function() {
            // Loại bỏ trạng thái chọn cũ
            packageCards.forEach((c) => c.classList.remove("active"));
            // Kích hoạt trạng thái thẻ vừa bấm
            this.classList.add("active");

            // Lấy giá trị tiền từ thuộc tính data-price
            const basePrice = parseInt(this.getAttribute("data-price"));
            updateHourlyPrice(basePrice);
        });
    });

    function updateHourlyPrice(basePrice) {
        let discount = 100000; // Giảm giá mặc định 100k thành viên mới
        if (basePrice < discount) discount = 0;
        let finalPrice = basePrice - discount;

        // Đổ số liệu định dạng VNĐ lên view giao diện
        document.getElementById("hourly-temp-price").innerText =
            basePrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("hourly-discount-price").innerText =
            "-" + discount.toLocaleString("vi-VN") + "đ";
        document.getElementById("hourly-final-price").innerText =
            finalPrice.toLocaleString("vi-VN") + "đ";
    }

    // --- 3. XỬ LÝ KHI KHÁCH BẤM ĐẶT XE ---
    if (hourlyForm) {
        hourlyForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Ngăn trang web tải lại dữ liệu rác

            // Thu thập dữ liệu khách nhập để chuẩn bị gửi về backend/telegram/email
            const activeCard = document.querySelector(".hourly-package-card.active");
            const bookingData = {
                date: document.getElementById("hourlyDate").value,
                time: document.getElementById("hourlyTime").value,
                pickup: document.getElementById("hourlyPickup").value,
                notes: document.getElementById("hourlyNotes").value,
                vehicle: document.querySelector('input[name="hourlyVehicle"]:checked')
                    .value,
                plate: document.getElementById("hourlyPlate").value,
                package: activeCard.querySelector(".hourly-pkg-title").innerText,
                totalPrice: document.getElementById("hourly-final-price").innerText,
            };

            console.log("Dữ liệu đơn hàng đặt tài xế theo giờ:", bookingData);
            alert(
                `🎉 Đặt tài xế thành công!\nGói: ${bookingData.package}\nTổng thanh toán: ${bookingData.totalPrice}\nTài xế sẽ liên hệ bạn ngay :).`,
            );

            hourlyModal.style.display = "none"; // Đóng bảng đăng ký
            hourlyForm.reset(); // Làm sạch form nhập liệu
        });
    }
});

// =======================================================
// TOÀN BỘ LOGIC XỬ LÝ RIÊNG CHO TAXI SÂN BAY
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    const airportModal = document.getElementById("airportModal");
    const closeAirportBtn = document.getElementById("closeAirportModal");
    const airportForm = document.getElementById("airportBookingForm");

    const carTypeSelect = document.getElementById("airportCarType");
    const routeSelect = document.getElementById("airportSelectRoute");

    // Hàm mở Modal Sân bay toàn cục
    window.openAirportModal = function() {
        airportModal.style.display = "block";

        // Cài đặt ngày giờ hiện tại
        const now = new Date();
        document.getElementById("airportDate").value = now
            .toISOString()
            .split("T")[0];
        document.getElementById("airportTime").value = now
            .toTimeString()
            .split(" ")[0]
            .substring(0, 5);

        calculateAirportPrice(); // Tính tiền lần đầu
    };

    // Đóng bằng nút (X)
    if (closeAirportBtn) {
        closeAirportBtn.addEventListener("click", () => {
            airportModal.style.display = "none";
        });
    }

    // Đóng khi click ra vùng nền ngoài
    window.addEventListener("click", (e) => {
        if (e.target === airportModal) airportModal.style.display = "none";
    });

    // Tự động tính lại tiền khi khách thay đổi loại xe hoặc tuyến đường khu vực
    if (carTypeSelect)
        carTypeSelect.addEventListener("change", calculateAirportPrice);
    if (routeSelect)
        routeSelect.addEventListener("change", calculateAirportPrice);

    function calculateAirportPrice() {
        const selectedOption = carTypeSelect.options[carTypeSelect.selectedIndex];
        const routeType = routeSelect.value;

        let basePrice = 0;
        if (routeType === "Nội thành") {
            basePrice = parseInt(selectedOption.getAttribute("data-price-20"));
        } else {
            // Ngoại thành
            basePrice = parseInt(selectedOption.getAttribute("data-price-40"));
        }

        let discount = 100000; // Ưu đãi thành viên mới 100k
        if (basePrice < discount) discount = 0;
        let finalPrice = basePrice - discount;

        // Hiển thị lên form giao diện
        document.getElementById("airport-temp-price").innerText =
            basePrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("airport-discount-price").innerText =
            "-" + discount.toLocaleString("vi-VN") + "đ";
        document.getElementById("airport-final-price").innerText =
            finalPrice.toLocaleString("vi-VN") + "đ";
    }

    // Xử lý gửi Đơn hàng sân bay
    if (airportForm) {
        airportForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const airportData = {
                type: document.querySelector('input[name="airportType"]:checked').value,
                carType: carTypeSelect.value,
                address: document.getElementById("airportAddress").value,
                flightCode: document.getElementById("airportFlightCode").value,
                routeZone: routeSelect.value,
                date: document.getElementById("airportDate").value,
                time: document.getElementById("airportTime").value,
                phone: document.getElementById("airportPhone").value,
                total: document.getElementById("airport-final-price").innerText,
            };

            console.log("Đơn hàng Taxi Sân Bay:", airportData);
            alert(
                `🎉 Đặt Taxi Sân Bay thành công!\nLoại hình: ${airportData.type} (${airportData.carType})\nTổng thanh toán: ${airportData.total}\nTài xế sẽ liên hệ đón bạn đúng giờ.`,
            );

            airportModal.style.display = "none";
            airportForm.reset();
        });
    }
});

// =======================================================
// TOÀN BỘ LOGIC XỬ LÝ RIÊNG CHO DỊCH VỤ CHO THUÊ XE
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    const rentalModal = document.getElementById("rentalModal");
    const closeRentalBtn = document.getElementById("closeRentalModal");
    const rentalForm = document.getElementById("rentalBookingForm");

    const carSelect = document.getElementById("rentalCarType");
    const startDateInput = document.getElementById("rentalStartDate");
    const endDateInput = document.getElementById("rentalEndDate");
    const rentalTypeRadios = document.querySelectorAll(
        'input[name="rentalType"]',
    );

    // Hàm mở Modal thuê xe toàn cục
    window.openRentalModal = function() {
        rentalModal.style.display = "block";

        // Thiết lập ngày mặc định (Hôm nay nhận, ngày mai trả)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        startDateInput.value = today.toISOString().split("T")[0];
        endDateInput.value = tomorrow.toISOString().split("T")[0];

        calculateRentalPrice();
    };

    // Đóng modal bằng nút (X)
    if (closeRentalBtn) {
        closeRentalBtn.addEventListener("click", () => {
            rentalModal.style.display = "none";
        });
    }

    // Đóng khi click ngoài vùng overlay
    window.addEventListener("click", (e) => {
        if (e.target === rentalModal) rentalModal.style.display = "none";
    });

    // Lắng nghe thay đổi dữ liệu để tính lại tiền tự động
    if (carSelect) carSelect.addEventListener("change", calculateRentalPrice);
    if (startDateInput)
        startDateInput.addEventListener("change", calculateRentalPrice);
    if (endDateInput)
        endDateInput.addEventListener("change", calculateRentalPrice);
    rentalTypeRadios.forEach((radio) =>
        radio.addEventListener("change", calculateRentalPrice),
    );

    function calculateRentalPrice() {
        if (!startDateInput.value || !endDateInput.value) return;

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        // Tính khoảng cách số ngày (Tối thiểu là 1 ngày)
        const diffTime = end - start;
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days <= 0) days = 1;

        // Lấy đơn giá dòng xe
        const selectedOption = carSelect.options[carSelect.selectedIndex];
        const carPricePerDay = parseInt(selectedOption.getAttribute("data-price"));

        // Kiểm tra hình thức thuê xem có cần tài xế ko (+500k/ngày)
        const rentalType = document.querySelector(
            'input[name="rentalType"]:checked',
        ).value;
        let driverPricePerDay = 0;
        const driverRow = document.getElementById("rentalDriverRow");

        if (rentalType === "Có tài xế") {
            driverPricePerDay = 500000;
            if (driverRow) driverRow.style.display = "flex";
        } else {
            if (driverRow) driverRow.style.display = "none";
        }

        // Tính toán tổng số tiền
        const totalCarPrice = carPricePerDay * days;
        const totalDriverPrice = driverPricePerDay * days;
        const finalPrice = totalCarPrice + totalDriverPrice;

        // Render kết quả lên màn hình view
        document.getElementById("rental-days-count").innerText = days + " ngày";
        document.getElementById("rental-temp-price").innerText =
            totalCarPrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("rental-driver-price").innerText =
            "+" + totalDriverPrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("rental-final-price").innerText =
            finalPrice.toLocaleString("vi-VN") + "đ";
    }

    // Xử lý gửi đơn đặt thuê xe
    if (rentalForm) {
        rentalForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const rentalData = {
                type: document.querySelector('input[name="rentalType"]:checked').value,
                car: carSelect.value,
                startDate: startDateInput.value,
                endDate: endDateInput.value,
                address: document.getElementById("rentalAddress").value,
                name: document.getElementById("rentalName").value,
                phone: document.getElementById("rentalPhone").value,
                total: document.getElementById("rental-final-price").innerText,
            };

            console.log("Đơn đăng ký dịch vụ Thuê Xe:", rentalData);
            alert(
                `🎉 Gửi yêu cầu đặt thuê xe thành công!\nHình thức: ${rentalData.type}\nDòng xe: ${rentalData.car}\nTổng dự tính: ${rentalData.total}\nNhân viên tổng đài sẽ gọi lại xác nhận tình trạng xe trống ngay lập tức.`,
            );

            rentalModal.style.display = "none";
            rentalForm.reset();
        });
    }
});

// =======================================================
// TOÀN BỘ LOGIC XỬ LÝ RIÊNG CHO DỊCH VỤ ĐĂNG KIỂM HỘ
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    const registryModal = document.getElementById("registryModal");
    const closeRegistryBtn = document.getElementById("closeRegistryModal");
    const registryForm = document.getElementById("registryBookingForm");
    const carSelect = document.getElementById("registryCarType");

    // Hàm mở Modal Đăng Kiểm toàn cục
    window.openRegistryModal = function() {
        registryModal.style.display = "block";

        // Thiết lập ngày giờ hiện tại
        const now = new Date();
        document.getElementById("registryDate").value = now
            .toISOString()
            .split("T")[0];
        document.getElementById("registryTime").value = now
            .toTimeString()
            .split(" ")[0]
            .substring(0, 5);

        // Gán ngày hết hạn mặc định là hôm nay để người dùng sửa lại
        document.getElementById("registryExpire").value = now
            .toISOString()
            .split("T")[0];

        calculateRegistryPrice();
    };

    // Đóng bằng nút (X)
    if (closeRegistryBtn) {
        closeRegistryBtn.addEventListener("click", () => {
            registryModal.style.display = "none";
        });
    }

    // Đóng khi click ra vùng nền ngoài overlay
    window.addEventListener("click", (e) => {
        if (e.target === registryModal) registryModal.style.display = "none";
    });

    // Thay đổi loại xe tự động nhảy lại giá dịch vụ
    if (carSelect) {
        carSelect.addEventListener("change", calculateRegistryPrice);
    }

    function calculateRegistryPrice() {
        const selectedOption = carSelect.options[carSelect.selectedIndex];
        const price = parseInt(selectedOption.getAttribute("data-price"));

        // Đổ giá trị lên view hiển thị
        document.getElementById("registry-service-price").innerText =
            price.toLocaleString("vi-VN") + "đ";
        document.getElementById("registry-final-price").innerText =
            price.toLocaleString("vi-VN") + "đ";
    }

    // Xử lý khi Submit Form gửi thông tin đi
    if (registryForm) {
        registryForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const registryData = {
                carType: carSelect.value,
                plate: document.getElementById("registryPlate").value,
                expireDate: document.getElementById("registryExpire").value,
                pickupDate: document.getElementById("registryDate").value,
                pickupTime: document.getElementById("registryTime").value,
                address: document.getElementById("registryAddress").value,
                name: document.getElementById("registryName").value,
                phone: document.getElementById("registryPhone").value,
                servicePrice: document.getElementById("registry-final-price").innerText,
            };

            console.log("Đơn đăng ký Đăng Kiểm Hộ:", registryData);
            alert(
                `🎉 Gửi yêu cầu dịch vụ Đăng Kiểm Hộ thành công!\nLoại xe: ${registryData.carType}\nBiển số: ${registryData.plate}\nPhí dịch vụ nhận xe: ${registryData.servicePrice}\nTài xế chuyên trách sẽ gọi điện liên hệ hẹn giờ qua nhận xe và hồ sơ.`,
            );

            registryModal.style.display = "none";
            registryForm.reset();
        });
    }
});

// =======================================================
// TOÀN BỘ LOGIC XỬ LÝ RIÊNG CHO DỊCH VỤ VẬN CHUYỂN XE
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    const transportModal = document.getElementById("transportModal");
    const closeTransportBtn = document.getElementById("closeTransportModal");
    const transportForm = document.getElementById("transportBookingForm");

    const vehicleSelect = document.getElementById("transportVehicleType");
    const routeSelect = document.getElementById("transportRoute");
    const insuranceCheck = document.getElementById("transportInsuranceCheck");

    // Hàm mở Modal Vận Chuyển toàn cục
    window.openTransportModal = function() {
        transportModal.style.display = "block";

        // Cài đặt ngày hôm nay làm mặc định
        const now = new Date();
        document.getElementById("transportDate").value = now
            .toISOString()
            .split("T")[0];

        calculateTransportPrice();
    };

    if (closeTransportBtn) {
        closeTransportBtn.addEventListener("click", () => {
            transportModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === transportModal) transportModal.style.display = "none";
    });

    // Lắng nghe thay đổi tính toán tiền cước
    if (vehicleSelect)
        vehicleSelect.addEventListener("change", calculateTransportPrice);
    if (routeSelect)
        routeSelect.addEventListener("change", calculateTransportPrice);
    if (insuranceCheck)
        insuranceCheck.addEventListener("change", calculateTransportPrice);

    function calculateTransportPrice() {
        if (!vehicleSelect || !routeSelect) return;

        // 1. Lấy giá cước theo tuyến đường
        const routeOption = routeSelect.options[routeSelect.selectedIndex];
        const basePrice = parseInt(routeOption.getAttribute("data-price"));

        // 2. Lấy giá bảo hiểm theo loại xe gửi
        const vehicleOption = vehicleSelect.options[vehicleSelect.selectedIndex];
        const insFee = parseInt(vehicleOption.getAttribute("data-insurance"));

        // Cập nhật text hiển thị ở nhãn checkbox bảo hiểm
        if (document.getElementById("transport-ins-fee")) {
            document.getElementById("transport-ins-fee").innerText =
                insFee.toLocaleString("vi-VN") + "đ";
        }

        // 3. Kiểm tra xem khách có tích chọn mua bảo hiểm không
        let finalInsPrice = 0;
        const insRow = document.getElementById("transportInsRow");

        if (insuranceCheck && insuranceCheck.checked) {
            finalInsPrice = insFee;
            if (insRow) insRow.style.display = "flex";
        } else {
            if (insRow) insRow.style.display = "none";
        }

        // 4. Tổng tiền cuối cùng
        const finalPrice = basePrice + finalInsPrice;

        // Đổ dữ liệu lên giao diện view
        document.getElementById("transport-base-price").innerText =
            basePrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("transport-insurance-price").innerText =
            "+" + finalInsPrice.toLocaleString("vi-VN") + "đ";
        document.getElementById("transport-final-price").innerText =
            finalPrice.toLocaleString("vi-VN") + "đ";
    }

    // Xử lý gửi form đơn hàng vận chuyển
    if (transportForm) {
        transportForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const transportData = {
                vehicle: vehicleSelect.value,
                carInfo: document.getElementById("transportCarInfo").value,
                route: routeSelect.value,
                pickup: document.getElementById("transportPickup").value,
                dropoff: document.getElementById("transportDropoff").value,
                date: document.getElementById("transportDate").value,
                insurance: insuranceCheck && insuranceCheck.checked ? "Có mua" : "Không mua",
                name: document.getElementById("transportName").value,
                phone: document.getElementById("transportPhone").value,
                total: document.getElementById("transport-final-price").innerText,
            };

            console.log("Đơn hàng Vận Chuyển Xe Liên Tỉnh:", transportData);
            alert(
                `🎉 Đặt đơn vị chuyển xe thành công!\nTuyến: ${transportData.route}\nPhương tiện: ${transportData.carInfo}\nTổng chi phí: ${transportData.total}\nTổ tư vấn logistics sẽ gọi lại báo thời gian xe lồng/xe cẩu chuyên dụng qua nhận xe.`,
            );

            transportModal.style.display = "none";
            transportForm.reset();
        });
    }
});

// =======================================================
// TOÀN BỘ LOGIC XỬ LÝ RIÊNG CHO DỊCH VỤ XE GHÉP
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    const carpoolModal = document.getElementById("carpoolModal");
    const closeCarpoolBtn = document.getElementById("closeCarpoolModal");
    const carpoolForm = document.getElementById("carpoolBookingForm");

    const routeSelect = document.getElementById("carpoolRoute");
    const seatsSelect = document.getElementById("carpoolSeats");
    const seatGroup = document.getElementById("carpoolSeatGroup");
    const carpoolTypeRadios = document.querySelectorAll(
        'input[name="carpoolType"]',
    );

    // Hàm mở Modal Xe Ghép toàn cục
    window.openCarpoolModal = function() {
        carpoolModal.style.display = "block";

        // Cài đặt ngày hôm nay làm mặc định
        const now = new Date();
        document.getElementById("carpoolDate").value = now
            .toISOString()
            .split("T")[0];

        calculateCarpoolPrice();
    };

    if (closeCarpoolBtn) {
        closeCarpoolBtn.addEventListener("click", () => {
            carpoolModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === carpoolModal) carpoolModal.style.display = "none";
    });

    // Lắng nghe thay đổi để tính lại tiền cước
    if (routeSelect)
        routeSelect.addEventListener("change", calculateCarpoolPrice);
    if (seatsSelect)
        seatsSelect.addEventListener("change", calculateCarpoolPrice);
    carpoolTypeRadios.forEach((radio) =>
        radio.addEventListener("change", function() {
            // Nếu chọn bao xe thì ẩn ô chọn số ghế
            if (this.value === "Bao xe") {
                if (seatGroup) seatGroup.style.opacity = "0.3";
                if (seatsSelect) seatsSelect.disabled = true;
            } else {
                if (seatGroup) seatGroup.style.opacity = "1";
                if (seatsSelect) seatsSelect.disabled = false;
            }
            calculateCarpoolPrice();
        }),
    );

    function calculateCarpoolPrice() {
        if (!routeSelect || !seatsSelect) return;

        const routeOption = routeSelect.options[routeSelect.selectedIndex];
        const carpoolType = document.querySelector(
            'input[name="carpoolType"]:checked',
        ).value;

        let unitPriceText = "";
        let finalPrice = 0;

        if (carpoolType === "Ghép ghế") {
            const pricePerSeat = parseInt(
                routeOption.getAttribute("data-seat-price"),
            );
            const seatCount = parseInt(seatsSelect.value);
            finalPrice = pricePerSeat * seatCount;
            unitPriceText = `${pricePerSeat.toLocaleString("vi-VN")}đ / ghế (x${seatCount})`;
        } else {
            // Bao xe trọn gói
            finalPrice = parseInt(routeOption.getAttribute("data-full-price"));
            unitPriceText = `${finalPrice.toLocaleString("vi-VN")}đ (Trọn chuyến)`;
        }

        // Đổ dữ liệu lên giao diện
        document.getElementById("carpool-fare-method").innerText = carpoolType;
        document.getElementById("carpool-unit-price").innerText = unitPriceText;
        document.getElementById("carpool-final-price").innerText =
            finalPrice.toLocaleString("vi-VN") + "đ";
    }

    // Xử lý gửi form đơn hàng xe ghép
    if (carpoolForm) {
        carpoolForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const carpoolData = {
                type: document.querySelector('input[name="carpoolType"]:checked').value,
                route: routeSelect.value,
                seats: document.querySelector('input[name="carpoolType"]:checked').value ===
                    "Ghép ghế" ?
                    seatsSelect.value : "Bao xe",
                pickup: document.getElementById("carpoolPickup").value,
                dropoff: document.getElementById("carpoolDropoff").value,
                date: document.getElementById("carpoolDate").value,
                timeSlot: document.getElementById("carpoolTime").value,
                name: document.getElementById("carpoolName").value,
                phone: document.getElementById("carpoolPhone").value,
                total: document.getElementById("carpool-final-price").innerText,
            };

            console.log("Đơn hàng Đặt Xe Ghép:", carpoolData);
            alert(
                `🎉 Đặt xe ghép thành công!\nTuyến: ${carpoolData.route}\nHình thức: ${carpoolData.type} (${carpoolData.seats})\nTổng tiền: ${carpoolData.total}\nTài xế sẽ liên hệ khớp giờ đón chính xác với bạn trước 1 tiếng.`,
            );

            carpoolModal.style.display = "none";
            carpoolForm.reset();
        });
    }





    // LOGIC VIDEO QUY TRÌNH
    const processVideo = document.getElementById('processVideo');
    const staticImage = document.getElementById('staticImage');
    let videoPlayed = false;

    function handleProcessVideo() {
        const rect = processVideo.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
            if (!videoPlayed) {
                processVideo.play().catch(() => {});
                videoPlayed = true;

                // Sau 1 phút 6 giây → chuyển sang ảnh tĩnh
                setTimeout(() => {
                    if (processVideo) {
                        processVideo.pause();
                        staticImage.classList.remove('hidden');
                    }
                }, 66000);
            }
        } else {
            // Cuộn ra ngoài → reset để lần sau phát lại
            if (videoPlayed) {
                videoPlayed = false;
                staticImage.classList.add('hidden');
                processVideo.currentTime = 0;
            }
        }
    }

    window.addEventListener('scroll', handleProcessVideo);
});