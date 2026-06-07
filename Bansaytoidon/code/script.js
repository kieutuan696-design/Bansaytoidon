document.addEventListener('DOMContentLoaded', function() {
    
    // ================= 1. XỬ LÝ MENU MOBILE DROPDOWN (SLIDE + FADE) =================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navMenu.classList.toggle('open');
        
        // Thêm hiệu ứng hoạt họa 3 gạch thành dấu X chéo
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

    // Đóng menu khi nhấn ra ngoài vùng menu trên thiết bị di động
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


    // ================= 2. HIỆU ỨNG ANIMATION KHI CUỘN TRANG (SCROLL REVEAL) =================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85; // Điểm kích hoạt khi phần tử lộ 15% từ đáy màn hình

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }

    // Chạy kiểm tra ngay khi load trang và mỗi khi cuộn chu kỳ
    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Chạy mồi lần đầu


    // ================= 3. ĐIỀU KHIỂN ĐÓNG / MỞ FORM ĐẶT XE (MODAL) =================
    const bookingModal = document.getElementById('bookingModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('closeModal');

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            bookingModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Ngăn cuộn trang nền khi mở form
        });
    });

    function closeModal() {
        bookingModal.classList.remove('open');
        document.body.style.overflow = ''; // Trả lại trạng thái cuộn bình thường
    }

    closeModalBtn.addEventListener('click', closeModal);

    // Click vào khoảng không overlay bên ngoài hộp thoại để đóng
    bookingModal.addEventListener('click', function(e) {
        if (e.target === bookingModal) {
            closeModal();
        }
    });


    // ================= 4. LOGIC TƯƠNG TÁC CHI TIẾT TRONG FORM ĐẶT XE =================
    
    // A. Chọn nhanh điểm đến
    const quickDestBtns = document.querySelectorAll('.btn-quick');
    const dropoffInput = document.getElementById('dropoffInput');

    quickDestBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            dropoffInput.value = this.getAttribute('data-dest');
            // Tạo hiệu ứng flash nhẹ báo hiệu đã điền
            dropoffInput.style.backgroundColor = '#e0f2fe';
            setTimeout(() => dropoffInput.style.backgroundColor = '', 300);
        });
    });

    // B. Chọn nhanh ghi chú cho tài xế
    const quickNoteBtns = document.querySelectorAll('.btn-quick-note');
    const driverNotes = document.getElementById('driverNotes');

    quickNoteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const textToAppend = this.innerText;
            if (driverNotes.value.trim() === "") {
                driverNotes.value = textToAppend;
            } else if (!driverNotes.value.includes(textToAppend)) {
                driverNotes.value += ", " + textToAppend;
            }
            driverNotes.focus();
        });
    });

    // C. Thay đổi Loại Xe (Hiện thông tin Specs tương ứng)
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

    // D. Checkbox Đặt hộ người khác
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

    // E. Toggle thời gian đón (Ngay bây giờ / Đặt lịch trước)
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
        
        // Đặt giá trị tối thiểu là thời gian hiện tại
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15); // Đặt trước tối thiểu 15 phút
        const formattedDateTime = now.toISOString().slice(0, 16);
        datetimeInput.min = formattedDateTime;
        if(!datetimeInput.value) datetimeInput.value = formattedDateTime;
    });

    // F. Định vị Geolocation API tích hợp nút hành động
    const geoBtn = document.getElementById('geoBtn');
    const pickupInput = document.getElementById('pickupInput');

    geoBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            geoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...';
            geoBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude.toFixed(5);
                    const lng = position.coords.longitude.toFixed(5);
                    // Giả lập điền chuỗi tọa độ thực tế từ trình duyệt
                    pickupInput.value = `Vị trí định vị tài xế: [Vĩ độ: ${lat}, Kinh độ: ${lng}]`;
                    pickupInput.style.backgroundColor = '#e0f2fe';
                    setTimeout(() => pickupInput.style.backgroundColor = '', 400);
                    
                    geoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Xong';
                    geoBtn.disabled = false;
                },
                function(error) {
                    alert("Không thể lấy vị trí tự động. Vui lòng cấp quyền truy cập GPS hoặc nhập tay địa chỉ.");
                    geoBtn.innerHTML = '<i class="fa-solid fa-gretchen"></i> Định vị';
                    geoBtn.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            alert("Trình duyệt của bạn không hỗ trợ công cụ định vị Geolocation.");
        }
    });

    // G. Xử lý gửi Form Đặt xe (Submit Form)
    const orderForm = document.getElementById('orderForm');
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Ngăn hành vi tải lại trang mặc định
        
        // Thu thập các biến dữ liệu cơ bản
        const pickup = pickupInput.value;
        const dropoff = dropoffInput.value;
        const vehicle = document.querySelector('input[name="vehicleType"]:checked').value;
        const plate = document.getElementById('plateNumber').value;
        const phone = document.getElementById('phoneInput').value;
        const payment = document.getElementById('paymentMethod').value;
        const isScheduled = timeScheduleBtn.classList.contains('active');
        const timeText = isScheduled ? datetimeInput.value : "Đón ngay lập tức";

        // Hiển thị thông báo Alert mô phỏng quá trình kết nối máy chủ thành công
        alert(`🎉 ĐẶT XE THÀNH CÔNG!\n\nHệ thống "Bạn Say Tôi Đón" đang điều phối tài xế gần nhất đến:\n📍 Điểm đón: ${pickup}\n🏁 Điểm đến: ${dropoff}\n🚗 Phương tiện: ${vehicle} (${plate})\n⏱ Thời gian: ${timeText}\n📞 SĐT liên lạc: ${phone}\n💳 Thanh toán: ${payment}\n\nTài xế sẽ gọi điện xác nhận trong 1-3 phút. Chúc bạn có một chuyến đi an toàn!`);
        
        // Khởi tạo lại form và đóng hộp thoại modal ẩn đi
        orderForm.reset();
        timeNowBtn.click(); // Reset thời gian đón về mặc định
        if (bookingForOtherCheckbox.checked) bookingForOtherCheckbox.click(); // Reset cụm đặt hộ
        closeModal();
    });
});