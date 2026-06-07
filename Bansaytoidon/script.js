/* ================================================================
   script.js — BẠN SAY TÔI ĐÓN v2.0
   Vanilla JavaScript — Không dùng thư viện ngoài
   ================================================================
   MỤC LỤC:
   1.  toggleMenu()        — Đóng/Mở menu mobile (GIỮ NGUYÊN GỐC)
   2.  checkReveal()       — Scroll Reveal animation (GIỮ NGUYÊN GỐC)
   3.  openModal()         — Đóng/Mở form đặt xe (GIỮ NGUYÊN GỐC)
   4A. quickDest()         — Chọn nhanh điểm đến (GIỮ NGUYÊN GỐC)
   4B. quickNote()         — Thêm nhanh ghi chú (GIỮ NGUYÊN GỐC)
   4C. vehicleToggle()     — Hiện spec xe máy/ô tô (GIỮ NGUYÊN GỐC)
   4D. bookForOther()      — Đặt hộ người khác (GIỮ NGUYÊN GỐC)
   4E. timeToggle()        — Đón ngay / Đặt lịch (GIỮ NGUYÊN GỐC)
   4F. geoLocate()         — Định vị GPS (GIỮ NGUYÊN GỐC)
   4G. submitOrder()       — Gửi form đặt xe (GIỮ NGUYÊN GỐC)
   5.  openServicePanel()  — Mở panel chi tiết dịch vụ (MỚI)
   6.  closeServicePanel() — Đóng panel (MỚI)
   7.  headerScroll()      — Hiệu ứng header khi cuộn (MỚI)
   8.  notifySubmit()      — Đăng ký thông báo giao hàng (MỚI)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {


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
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('open');

        /* Animate 3 gạch thành dấu X khi menu mở */
        const bars = menuToggle.querySelectorAll('.bar');
        if (navMenu.classList.contains('open')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    /* Đóng menu khi click ra ngoài vùng menu */
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                const bars = menuToggle.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
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
    const revealElements = document.querySelectorAll('.scroll-reveal');

    function checkReveal() {
        /* Kích hoạt khi phần tử lộ 15% từ đáy màn hình */
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
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
    const bookingModal = document.getElementById('bookingModal');
    const closeModalBtn = document.getElementById('closeModal');

    /* Dùng event delegation để bắt TẤT CẢ .open-modal-btn
       kể cả những nút được tạo động hoặc trong panel */
    document.addEventListener('click', function(e) {
        if (e.target.closest('.open-modal-btn')) {
            openModal();
        }
    });

    function openModal() {
        bookingModal.classList.add('open');
        document.body.style.overflow = 'hidden'; /* Khóa cuộn trang nền */
        /* Nếu có panel đang mở → đóng panel trước */
        closeServicePanel();
    }

    function closeModal() {
        bookingModal.classList.remove('open');
        document.body.style.overflow = ''; /* Trả lại cuộn bình thường */
    }

    closeModalBtn.addEventListener('click', closeModal);

    /* Click vào khoảng trống overlay bên ngoài hộp thoại → đóng */
    bookingModal.addEventListener('click', function(e) {
        if (e.target === bookingModal) closeModal();
    });

    /* Phím ESC → đóng modal */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeServicePanel();
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
    const quickDestBtns = document.querySelectorAll('.btn-quick');
    const dropoffInput = document.getElementById('dropoffInput');

    quickDestBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            dropoffInput.value = this.getAttribute('data-dest');
            /* Flash xanh nhẹ xác nhận đã điền */
            dropoffInput.style.backgroundColor = '#e0f2fe';
            setTimeout(() => dropoffInput.style.backgroundColor = '', 300);
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
    const quickNoteBtns = document.querySelectorAll('.btn-quick-note');
    const driverNotes = document.getElementById('driverNotes');

    quickNoteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.innerText;
            if (driverNotes.value.trim() === '') {
                driverNotes.value = text;
            } else if (!driverNotes.value.includes(text)) {
                driverNotes.value += ', ' + text;
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
    const vehicleRadioBtns = document.querySelectorAll('input[name="vehicleType"]');
    const motoSpecs = document.getElementById('motoSpecs');
    const carSpecs = document.getElementById('carSpecs');

    vehicleRadioBtns.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Xe máy') {
                motoSpecs.classList.remove('hidden');
                carSpecs.classList.add('hidden');
            } else if (this.value === 'Ô tô') {
                carSpecs.classList.remove('hidden');
                motoSpecs.classList.add('hidden');
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
    const bookingForOtherCheckbox = document.getElementById('bookingForOther');
    const otherPassengerInfo = document.getElementById('otherPassengerInfo');
    const otherNameInput = document.getElementById('otherName');
    const otherPhoneInput = document.getElementById('otherPhone');

    bookingForOtherCheckbox.addEventListener('change', function() {
        if (this.checked) {
            otherPassengerInfo.classList.remove('hidden');
            otherNameInput.setAttribute('required', 'required');
            otherPhoneInput.setAttribute('required', 'required');
        } else {
            otherPassengerInfo.classList.add('hidden');
            otherNameInput.removeAttribute('required');
            otherPhoneInput.removeAttribute('required');
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
    const timeNowBtn = document.getElementById('timeNow');
    const timeScheduleBtn = document.getElementById('timeSchedule');
    const scheduleInputs = document.getElementById('scheduleInputs');
    const datetimeInput = document.getElementById('scheduleDateTime');

    timeNowBtn.addEventListener('click', function() {
        this.classList.add('active');
        timeScheduleBtn.classList.remove('active');
        scheduleInputs.classList.add('hidden');
        datetimeInput.removeAttribute('required');
    });

    timeScheduleBtn.addEventListener('click', function() {
        this.classList.add('active');
        timeNowBtn.classList.remove('active');
        scheduleInputs.classList.remove('hidden');
        datetimeInput.setAttribute('required', 'required');

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
    const geoBtn = document.getElementById('geoBtn');
    const pickupInput = document.getElementById('pickupInput');

    geoBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            alert('Trình duyệt của bạn không hỗ trợ Geolocation.');
            return;
        }

        geoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...';
        geoBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude.toFixed(5);
                const lng = position.coords.longitude.toFixed(5);
                pickupInput.value = `Vị trí định vị: [Vĩ độ: ${lat}, Kinh độ: ${lng}]`;
                pickupInput.style.backgroundColor = '#e0f2fe';
                setTimeout(() => pickupInput.style.backgroundColor = '', 400);

                geoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Xong';
                geoBtn.disabled = false;
            },
            function() {
                alert('Không thể lấy vị trí. Vui lòng cấp quyền GPS hoặc nhập tay địa chỉ.');
                geoBtn.innerHTML = '<i class="fa-solid fa-location-arrow"></i> Định vị';
                geoBtn.disabled = false;
            }, { enableHighAccuracy: true, timeout: 5000 }
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
    const orderForm = document.getElementById('orderForm');

    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); /* Ngăn reload trang mặc định */

        /* Thu thập dữ liệu các trường */
        const pickup = pickupInput.value;
        const dropoff = dropoffInput.value;
        const vehicle = document.querySelector('input[name="vehicleType"]:checked').value;
        const plate = document.getElementById('plateNumber').value;
        const phone = document.getElementById('phoneInput').value;
        const payment = document.getElementById('paymentMethod').value;
        const isScheduled = timeScheduleBtn.classList.contains('active');
        const timeText = isScheduled ? datetimeInput.value : 'Đón ngay lập tức';

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
            `Tài xế sẽ gọi điện xác nhận trong 1–3 phút. Chúc bạn chuyến đi an toàn!`
        );

        /* Reset form về trạng thái mặc định */
        orderForm.reset();
        timeNowBtn.click(); /* Reset toggle thời gian */
        if (bookingForOtherCheckbox.checked) bookingForOtherCheckbox.click(); /* Reset đặt hộ */
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
    const panelOverlay = document.getElementById('panelOverlay');
    let activePanelEl = null; /* Lưu panel đang mở để đóng đúng */

    function openServicePanel(serviceKey) {
        /* Đóng panel cũ nếu đang mở */
        if (activePanelEl) closeServicePanel();

        const panel = document.getElementById('panel-' + serviceKey);
        if (!panel) return;

        activePanelEl = panel;
        panel.classList.add('open');
        panelOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; /* Khóa cuộn trang */
    }

    function closeServicePanel() {
        if (!activePanelEl) return;
        activePanelEl.classList.remove('open');
        panelOverlay.classList.remove('active');
        activePanelEl = null;
        /* Chỉ trả lại cuộn nếu modal cũng không đang mở */
        if (!bookingModal.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }

    /* Gắn sự kiện click cho tất cả nút .more-link trên card */
    document.querySelectorAll('.more-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const key = this.getAttribute('data-service');
            openServicePanel(key);
        });
    });

    /* Gắn sự kiện cho tất cả nút .panel-close trong panel */
    document.querySelectorAll('.panel-close').forEach(btn => {
        btn.addEventListener('click', closeServicePanel);
    });

    /* Click overlay → đóng panel */
    panelOverlay.addEventListener('click', closeServicePanel);


    /* ============================================================
       KHỐI 6 — HIỆU ỨNG HEADER KHI CUỘN TRANG
       ─────────────────────────────────────────────────────────
       Tên hàm  : headerScroll (inline trên scroll event)
       Mục đích : Khi cuộn trang > 40px → thêm class .scrolled
                  vào header để tăng độ đậm bóng đổ.
       HTML     : index.html → <header class="main-header">
       CSS      : style.css → .main-header.scrolled (dòng ~143)
       ============================================================ */
    const mainHeader = document.querySelector('.main-header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 40) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    }, { passive: true });


    /* ============================================================
       KHỐI 7 — XỬ LÝ FORM ĐĂNG KÝ THÔNG BÁO GIAO HÀNG
       ─────────────────────────────────────────────────────────
       Tên hàm  : notifySubmit (inline trên click)
       Mục đích : Trong panel "Giao hàng" (sắp ra mắt),
                  người dùng nhập SĐT → bấm đăng ký → thông báo
                  đã ghi nhận, xóa input.
       HTML     : index.html → id="notifyPhone", id="notifySubmit"
       ============================================================ */
    const notifySubmitBtn = document.getElementById('notifySubmit');
    const notifyPhoneInput = document.getElementById('notifyPhone');

    if (notifySubmitBtn && notifyPhoneInput) {
        notifySubmitBtn.addEventListener('click', function() {
            const phone = notifyPhoneInput.value.trim();

            if (!phone) {
                notifyPhoneInput.style.borderColor = '#ef4444';
                notifyPhoneInput.focus();
                setTimeout(() => notifyPhoneInput.style.borderColor = '', 1500);
                return;
            }

            /* Giả lập đăng ký thành công (TODO: thay bằng API thực) */
            this.innerHTML = '<i class="fa-solid fa-check"></i> Đã đăng ký thành công!';
            this.style.background = '#22c55e';
            this.disabled = true;
            notifyPhoneInput.value = '';
            notifyPhoneInput.placeholder = `SĐT ${phone} đã được ghi nhận!`;
        });
    }


}); /* ── End DOMContentLoaded ── */